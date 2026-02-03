'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, ChevronUp, ChevronDown, Upload } from 'lucide-react'

export interface ImageFile {
  file: File
  preview: string
  assetId?: string
  uploading?: boolean
  uploadProgress?: number // 0-100
}

interface ImageUploaderProps {
  images: ImageFile[]
  onImagesChange: (images: ImageFile[]) => void
  onUploadProgress?: (uploaded: number, total: number) => void
}

export function ImageUploader({
  images,
  onImagesChange,
  onUploadProgress,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imagesRef = useRef<ImageFile[]>(images)
  const [uploading, setUploading] = useState(false)

  // Keep ref in sync with images prop
  useEffect(() => {
    imagesRef.current = images
  }, [images])

  // Compress image aggressively to ensure it's under 2MB (safe margin under 4.5MB Vercel limit)
  const compressImage = useCallback(async (file: File, targetSizeMB = 2): Promise<File> => {
    // If file is already small enough, return as-is
    if (file.size <= targetSizeMB * 1024 * 1024) {
      return file
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          // Calculate new dimensions - aggressive compression
          let width = img.width
          let height = img.height
          
          // Very aggressive compression - start with smaller dimensions
          const fileSizeMB = file.size / 1024 / 1024
          let maxDimension = 1920 // Start smaller
          let quality = 0.7 // Start with lower quality
          
          if (fileSizeMB > 10) {
            maxDimension = 1200
            quality = 0.6
          } else if (fileSizeMB > 7) {
            maxDimension = 1400
            quality = 0.65
          } else if (fileSizeMB > 5) {
            maxDimension = 1600
            quality = 0.7
          } else if (fileSizeMB > 3) {
            maxDimension = 1800
            quality = 0.75
          }
          
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width
              width = maxDimension
            } else {
              width = (width * maxDimension) / height
              height = maxDimension
            }
          }

          canvas.width = width
          canvas.height = height
          
          // Use better quality settings for image rendering
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)

          // Try compression with progressive quality reduction
          const tryCompress = (q: number, attempt = 0): void => {
            if (attempt > 10) {
              // If we've tried too many times, just return what we have
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    resolve(new File([blob], file.name, {
                      type: 'image/jpeg',
                      lastModified: Date.now(),
                    }))
                  } else {
                    reject(new Error('Failed to compress image'))
                  }
                },
                'image/jpeg',
                0.5
              )
              return
            }

            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Failed to compress image'))
                  return
                }

                const blobSizeMB = blob.size / 1024 / 1024
                
                // If still too large, reduce quality or dimensions further
                if (blobSizeMB > targetSizeMB && q > 0.4) {
                  // Reduce quality
                  tryCompress(Math.max(0.4, q - 0.05), attempt + 1)
                } else if (blobSizeMB > targetSizeMB && maxDimension > 800) {
                  // Reduce dimensions if quality is already low
                  maxDimension = Math.max(800, maxDimension - 200)
                  const newWidth = width > height ? maxDimension : (width * maxDimension) / height
                  const newHeight = height > width ? maxDimension : (height * maxDimension) / width
                  canvas.width = newWidth
                  canvas.height = newHeight
                  ctx.drawImage(img, 0, 0, newWidth, newHeight)
                  tryCompress(q, attempt + 1)
                } else {
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  })
                  resolve(compressedFile)
                }
              },
              'image/jpeg',
              q
            )
          }

          tryCompress(quality)
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }, [])

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      // Compress images before adding them (compress if larger than 1MB)
      const compressionPromises = Array.from(files).map(async (file) => {
        try {
          // Always compress files larger than 1MB to ensure they're well under Vercel's 4.5MB limit
          let compressedFile = file
          
          if (file.size > 1 * 1024 * 1024) {
            compressedFile = await compressImage(file, 2) // Target 2MB max
            
            // If still too large after compression, try even more aggressive compression
            if (compressedFile.size > 3 * 1024 * 1024) {
              console.warn(`File ${file.name} still large after compression (${(compressedFile.size / 1024 / 1024).toFixed(2)}MB), trying more aggressive compression`)
              compressedFile = await compressImage(file, 1.5) // Try 1.5MB target
            }
            
            // Final check - if still too large, warn user
            if (compressedFile.size > 4 * 1024 * 1024) {
              console.error(`File ${file.name} is still too large after compression: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`)
              // Still add it, but it might fail - user will see error during upload
            }
          }
          
          return {
            file: compressedFile,
            preview: '', // No preview needed - we'll just show file names
          }
        } catch (error) {
          console.warn(`Failed to compress ${file.name}, using original:`, error)
          // If compression fails completely, still try to use original (might fail, but at least user sees error)
          return {
            file,
            preview: '',
          }
        }
      })

      const newImages = await Promise.all(compressionPromises)
      
      // Check for files that are still too large after compression
      const tooLargeFiles = newImages.filter(img => img.file.size > 4 * 1024 * 1024)
      if (tooLargeFiles.length > 0) {
        const fileNames = tooLargeFiles.map(img => `${img.file.name} (${(img.file.size / 1024 / 1024).toFixed(2)}MB)`).join('\n')
        alert(`Upozornenie: Nasledujúce súbory sú stále príliš veľké aj po kompresii:\n${fileNames}\n\nMôžu zlyhať pri nahrávaní. Skúste ich zmenšiť pred nahrávaním.`)
      }
      
      onImagesChange([...images, ...newImages])
    },
    [images, onImagesChange, compressImage]
  )

  const handleRemove = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index)
      // Revoke object URL if it exists
      if (images[index].preview && images[index].preview.startsWith('blob:')) {
        URL.revokeObjectURL(images[index].preview)
      }
      onImagesChange(newImages)
    },
    [images, onImagesChange]
  )

  const handleMove = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= images.length) return

      const newImages = [...images]
      ;[newImages[index], newImages[newIndex]] = [
        newImages[newIndex],
        newImages[index],
      ]
      onImagesChange(newImages)
    },
    [images, onImagesChange]
  )

  const handleUpload = useCallback(async () => {
    // Get current images from ref (always latest)
    let currentImages = [...imagesRef.current]
    const filesToUpload = currentImages.filter((img) => !img.assetId && !img.uploading)
    if (filesToUpload.length === 0) return

    setUploading(true)
    const totalFiles = filesToUpload.length
    let uploadedCount = 0

    // Upload images one by one
    for (let i = 0; i < filesToUpload.length; i++) {
      const imageToUpload = filesToUpload[i]
      
      // Get latest images state from ref
      currentImages = [...imagesRef.current]
      
      // Find index in current images array
      const imageIndex = currentImages.findIndex((img) => img.file === imageToUpload.file)
      
      if (imageIndex === -1) {
        console.warn(`Image ${imageToUpload.file.name} not found in current images array`)
        continue
      }

      try {
        // Mark this image as uploading
        currentImages[imageIndex] = {
          ...currentImages[imageIndex],
          uploading: true,
          uploadProgress: 0,
        }
        imagesRef.current = currentImages
        onImagesChange([...currentImages])

        // Upload single image
        const formData = new FormData()
        formData.append('files', imageToUpload.file)

        const response = await fetch('/api/admin/upload-images', {
          method: 'POST',
          body: formData,
        })

         if (!response.ok) {
           // Handle 413 (Content Too Large) error
           if (response.status === 413) {
             throw new Error(`Súbor "${imageToUpload.file.name}" je príliš veľký aj po kompresii (${(imageToUpload.file.size / 1024 / 1024).toFixed(2)}MB). Skúste použiť menší obrázok alebo ho zmenšiť pred nahrávaním.`)
           }
           
           // Handle non-JSON error responses
           let errorMessage = 'Upload failed'
           const contentType = response.headers.get('content-type') || ''
           
           if (contentType.includes('application/json')) {
             try {
               const errorData = await response.json()
               errorMessage = errorData.error || errorMessage
             } catch {
               errorMessage = `Chyba servera (${response.status})`
             }
           } else {
             // Response is HTML (like error page)
             try {
               const text = await response.text()
               if (text.includes('Request Entity Too Large') || text.includes('413') || text.includes('Content Too Large')) {
                 errorMessage = `Súbor "${imageToUpload.file.name}" je príliš veľký aj po kompresii (${(imageToUpload.file.size / 1024 / 1024).toFixed(2)}MB). Skúste použiť menší obrázok alebo ho zmenšiť pred nahrávaním.`
               } else {
                 errorMessage = `Chyba servera (${response.status})`
               }
             } catch {
               errorMessage = `Chyba servera (${response.status})`
             }
           }
           throw new Error(errorMessage)
         }

         // Parse JSON response
         let results
         try {
           const data = await response.json()
           results = data.results
           if (!results || !Array.isArray(results) || results.length === 0) {
             throw new Error('Neplatná odpoveď zo servera')
           }
         } catch (error) {
           throw new Error('Chyba pri komunikácii so serverom. Skúste to znova.')
         }
        const result = results[0]

        if (result.error) {
          throw new Error(result.error)
        }

        // Update this image with asset ID using latest state from ref
        currentImages = [...imagesRef.current]
        currentImages[imageIndex] = {
          ...currentImages[imageIndex],
          assetId: result._id,
          uploading: false,
          uploadProgress: 100,
        }
        imagesRef.current = currentImages
        onImagesChange([...currentImages])

        uploadedCount++
        onUploadProgress?.(uploadedCount, totalFiles)
      } catch (error) {
        console.error(`Upload error for ${imageToUpload.file.name}:`, error)
        
        // Mark this image as failed (remove uploading state)
        currentImages = [...imagesRef.current]
        const failedIndex = currentImages.findIndex((img) => img.file === imageToUpload.file)
        if (failedIndex !== -1) {
          currentImages[failedIndex] = {
            ...currentImages[failedIndex],
            uploading: false,
            uploadProgress: undefined,
          }
          imagesRef.current = currentImages
          onImagesChange([...currentImages])
        }
        
        // Show error but continue with other images
        alert(`Nepodarilo sa nahrať ${imageToUpload.file.name}: ${error instanceof Error ? error.message : 'Neznáma chyba'}`)
      }
    }

    setUploading(false)
  }, [onImagesChange, onUploadProgress])

  const hasUnuploadedImages = images.some((img) => !img.assetId)

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.preview && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview)
        }
      })
    }
  }, []) // Only run on unmount

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Obrázky (vyžaduje sa aspoň 1)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Vybrať obrázky
        </Button>
      </div>

      {images.length > 0 && (
        <div className="space-y-2">
          {/* Simple list view - just file names */}
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {images.map((image, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 p-2 bg-[#1a1a1a] rounded border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* Order number */}
                  <div className="flex items-center justify-center w-6 h-6 rounded bg-white/10 text-white text-xs font-medium shrink-0">
                    {index + 1}
                  </div>
                  
                  {/* Move buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      title="Presunúť nahor"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === images.length - 1}
                      title="Presunúť nadol"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* File name and size */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate" title={image.file.name}>
                      {image.file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(image.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  {/* Status */}
                  <div className="flex items-center gap-2 shrink-0">
                    {image.uploading && (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${image.uploadProgress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">Nahrávam...</span>
                      </div>
                    )}
                    {image.assetId && !image.uploading && (
                      <div className="flex items-center gap-1 text-green-500">
                        <span className="text-lg">✓</span>
                        <span className="text-xs">Nahrané</span>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-400 hover:text-red-500"
                      onClick={() => handleRemove(index)}
                      title="Odstrániť"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasUnuploadedImages && (
            <div className="space-y-2">
              <Button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="w-full text-sm sm:text-base"
              >
                {uploading 
                  ? `Nahrávam... (${images.filter((img) => img.assetId).length}/${images.length})`
                  : `Nahrať ${images.filter((img) => !img.assetId).length} obrázok(ov)`
                }
              </Button>
              {uploading && (
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ 
                      width: `${(images.filter((img) => img.assetId).length / images.length) * 100}%` 
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
