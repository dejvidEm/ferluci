'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { X, ChevronUp, ChevronDown, Upload } from 'lucide-react'

export interface ImageFile {
  file: File
  preview: string
  assetId?: string
  uploading?: boolean
  uploadProgress?: number // 0-100
  id?: string // Unique ID for tracking (auto-generated if not provided)
}

interface ImageUploaderProps {
  images: ImageFile[]
  onImagesChange: (images: ImageFile[]) => void
  onUploadProgress?: (uploaded: number, total: number) => void
  storageKey?: string // Optional key for localStorage persistence
}

const BATCH_SIZE = 3 // Upload 3 images at a time
const MAX_PREVIEW_SIZE = 300 // Max dimension for preview thumbnails

// Create optimized thumbnail from file
async function createThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // Calculate dimensions maintaining aspect ratio
        let width = img.width
        let height = img.height
        if (width > height) {
          if (width > MAX_PREVIEW_SIZE) {
            height = (height * MAX_PREVIEW_SIZE) / width
            width = MAX_PREVIEW_SIZE
          }
        } else {
          if (height > MAX_PREVIEW_SIZE) {
            width = (width * MAX_PREVIEW_SIZE) / height
            height = MAX_PREVIEW_SIZE
          }
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
        resolve(thumbnail)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function ImageUploader({
  images,
  onImagesChange,
  onUploadProgress,
  storageKey = 'vehicle-images',
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imagesRef = useRef<ImageFile[]>(images)
  const uploadBatchesRef = useRef<((imagesToUpload?: ImageFile[]) => Promise<void>) | null>(null)
  const [uploading, setUploading] = useState(false)
  const [visibleCount, setVisibleCount] = useState(12) // Show first 12 images initially

  // Keep ref in sync with images prop and ensure IDs
  useEffect(() => {
    const imagesWithIds = ensureImageIds(images)
    if (imagesWithIds.some((img, idx) => img.id !== images[idx]?.id)) {
      onImagesChange(imagesWithIds)
    }
    imagesRef.current = imagesWithIds
  }, [images, ensureImageIds, onImagesChange])

  // Persist to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && images.length > 0) {
      try {
        const serializable = images.map(img => ({
          id: img.id,
          fileName: img.file.name,
          fileSize: img.file.size,
          fileType: img.file.type,
          assetId: img.assetId,
          uploading: img.uploading,
          uploadProgress: img.uploadProgress,
        }))
        localStorage.setItem(storageKey, JSON.stringify(serializable))
      } catch (e) {
        console.warn('Failed to save to localStorage:', e)
      }
    }
  }, [images, storageKey])

  // Ensure all images have IDs
  const ensureImageIds = useCallback((imgs: ImageFile[]): ImageFile[] => {
    return imgs.map(img => ({
      ...img,
      id: img.id || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    }))
  }, [])

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const fileArray = Array.from(files)
      const currentImages = ensureImageIds(images)
      
      // First, add all files with temporary blob URLs for immediate UI feedback
      const tempImages: ImageFile[] = fileArray.map((file) => {
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        return {
          file,
          preview: URL.createObjectURL(file), // Temporary blob URL
          id,
        }
      })

      const initialImages = [...currentImages, ...tempImages]
      onImagesChange(initialImages)
      imagesRef.current = initialImages

      // Then progressively create optimized thumbnails in batches to avoid lag
      const THUMBNAIL_BATCH_SIZE = 5
      for (let i = 0; i < tempImages.length; i += THUMBNAIL_BATCH_SIZE) {
        const batch = tempImages.slice(i, i + THUMBNAIL_BATCH_SIZE)
        
        const thumbnailPromises = batch.map(async (tempImg) => {
          try {
            const thumbnail = await createThumbnail(tempImg.file)
            // Revoke the temporary blob URL
            URL.revokeObjectURL(tempImg.preview)
            return { ...tempImg, preview: thumbnail }
          } catch (error) {
            console.warn('Failed to create thumbnail, keeping blob URL:', error)
            return tempImg
          }
        })

        const thumbnailedBatch = await Promise.all(thumbnailPromises)
        
        // Update images with thumbnails progressively
        const currentState = [...imagesRef.current]
        thumbnailedBatch.forEach((thumbnailedImg) => {
          const index = currentState.findIndex(img => img.id === thumbnailedImg.id)
          if (index !== -1) {
            currentState[index] = thumbnailedImg
          }
        })
        imagesRef.current = currentState
        onImagesChange([...currentState])
        
        // Small delay between batches to keep UI responsive
        if (i + THUMBNAIL_BATCH_SIZE < tempImages.length) {
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }
      
      // Auto-start upload in batches after thumbnails are created
      setTimeout(() => {
        if (uploadBatchesRef.current) {
          uploadBatchesRef.current(imagesRef.current)
        }
      }, 200)
    },
    [images, onImagesChange, ensureImageIds]
  )

  const handleRemove = useCallback(
    (index: number) => {
      const imagesWithIds = ensureImageIds(images)
      const imageToRemove = imagesWithIds[index]
      const newImages = imagesWithIds.filter((_, i) => i !== index)
      
      // Revoke object URL to prevent memory leak
      if (imageToRemove.preview && imageToRemove.preview.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.preview)
      }
      
      onImagesChange(newImages)
    },
    [images, onImagesChange, ensureImageIds]
  )

  const handleMove = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const imagesWithIds = ensureImageIds(images)
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= imagesWithIds.length) return

      const newImages = [...imagesWithIds]
      ;[newImages[index], newImages[newIndex]] = [
        newImages[newIndex],
        newImages[index],
      ]
      onImagesChange(newImages)
    },
    [images, onImagesChange, ensureImageIds]
  )

  const uploadBatch = useCallback(async (batch: ImageFile[]): Promise<void> => {
    const formData = new FormData()
    batch.forEach(img => {
      formData.append('files', img.file)
    })

    const response = await fetch('/api/admin/upload-images', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }

    const { results } = await response.json()
    
    // Update images with asset IDs
    let currentImages = ensureImageIds([...imagesRef.current])
    batch.forEach((imgToUpdate, batchIndex) => {
      const result = results[batchIndex]
      if (result && result._id && !result.error) {
        const imageIndex = currentImages.findIndex((img) => img.id === imgToUpdate.id)
        if (imageIndex !== -1) {
          currentImages[imageIndex] = {
            ...currentImages[imageIndex],
            assetId: result._id,
            uploading: false,
            uploadProgress: 100,
          }
          
          // Revoke blob URL after successful upload to free memory
          if (currentImages[imageIndex].preview && currentImages[imageIndex].preview.startsWith('blob:')) {
            URL.revokeObjectURL(currentImages[imageIndex].preview)
            // Keep thumbnail for display
            currentImages[imageIndex].preview = currentImages[imageIndex].preview
          }
        }
      } else if (result && result.error) {
        const imageIndex = currentImages.findIndex((img) => img.id === imgToUpdate.id)
        if (imageIndex !== -1) {
          currentImages[imageIndex] = {
            ...currentImages[imageIndex],
            uploading: false,
            uploadProgress: undefined,
          }
        }
        throw new Error(result.error)
      }
    })
    
    imagesRef.current = currentImages
    onImagesChange([...currentImages])
  }, [onImagesChange, ensureImageIds])

  const handleUploadBatches = useCallback(async (imagesToUpload?: ImageFile[]) => {
    const currentImages = ensureImageIds(imagesToUpload || [...imagesRef.current])
    const filesToUpload = currentImages.filter((img) => !img.assetId && !img.uploading)
    if (filesToUpload.length === 0) return

    setUploading(true)
    const totalFiles = filesToUpload.length
    let uploadedCount = 0

    // Mark all as uploading
    let updatedImages = ensureImageIds([...imagesRef.current])
    filesToUpload.forEach(img => {
      const index = updatedImages.findIndex(i => i.id === img.id)
      if (index !== -1) {
        updatedImages[index] = {
          ...updatedImages[index],
          uploading: true,
          uploadProgress: 0,
        }
      }
    })
    imagesRef.current = updatedImages
    onImagesChange([...updatedImages])

    // Upload in batches
    for (let i = 0; i < filesToUpload.length; i += BATCH_SIZE) {
      const batch = filesToUpload.slice(i, i + BATCH_SIZE)
      
      try {
        await uploadBatch(batch)
        uploadedCount += batch.length
        onUploadProgress?.(uploadedCount, totalFiles)
        
        // Small delay between batches to avoid overwhelming the server
        if (i + BATCH_SIZE < filesToUpload.length) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      } catch (error) {
        console.error(`Batch upload error:`, error)
        // Mark batch as failed but continue
        updatedImages = ensureImageIds([...imagesRef.current])
        batch.forEach(img => {
          const index = updatedImages.findIndex(i => i.id === img.id)
          if (index !== -1) {
            updatedImages[index] = {
              ...updatedImages[index],
              uploading: false,
              uploadProgress: undefined,
            }
          }
        })
        imagesRef.current = updatedImages
        onImagesChange([...updatedImages])
        
        alert(`Nepodarilo sa nahrať niektoré obrázky: ${error instanceof Error ? error.message : 'Neznáma chyba'}`)
      }
    }

    setUploading(false)
  }, [uploadBatch, onImagesChange, onUploadProgress, ensureImageIds])

  // Store function in ref so it can be called from handleFileSelect
  useEffect(() => {
    uploadBatchesRef.current = handleUploadBatches
  }, [handleUploadBatches])

  const handleUpload = useCallback(() => {
    handleUploadBatches()
  }, [handleUploadBatches])

  const hasUnuploadedImages = imagesWithIds.some((img) => !img.assetId)

  // Visible images (for performance with many images)
  const imagesWithIds = useMemo(() => ensureImageIds(images), [images, ensureImageIds])
  const visibleImages = useMemo(() => {
    return imagesWithIds.slice(0, visibleCount)
  }, [imagesWithIds, visibleCount])

  const hasMoreImages = images.length > visibleCount

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imagesWithIds.forEach((img) => {
        if (img.preview && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview)
        }
      })
    }
  }, [imagesWithIds]) // Cleanup when images change

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
        {imagesWithIds.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            {imagesWithIds.length} obrázok(ov) • {imagesWithIds.filter((img) => img.assetId).length} nahraných
          </p>
        )}
      </div>

      {imagesWithIds.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            {visibleImages.map((image, displayIndex) => {
              // Find actual index in full images array
              const actualIndex = imagesWithIds.findIndex(img => img.id === image.id)
              return (
                <div
                  key={image.id}
                  className="relative group bg-[#1a1a1a] rounded-lg overflow-hidden border border-white/10"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={image.preview}
                      alt={`Preview ${actualIndex + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      loading={displayIndex < 6 ? "eager" : "lazy"}
                    />
                    {image.uploading && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
                        <div className="text-white text-xs sm:text-sm mb-2">Nahrávam...</div>
                        {image.uploadProgress !== undefined && (
                          <div className="w-20 sm:w-24 h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${image.uploadProgress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {image.assetId && !image.uploading && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded z-10">
                        ✓
                      </div>
                    )}
                  </div>

                  <div className="p-1.5 sm:p-2 flex items-center justify-between gap-1">
                    <div className="flex gap-0.5 sm:gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8"
                        onClick={() => handleMove(actualIndex, 'up')}
                        disabled={actualIndex === 0}
                      >
                        <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8"
                        onClick={() => handleMove(actualIndex, 'down')}
                        disabled={actualIndex === imagesWithIds.length - 1}
                      >
                        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 text-red-400 hover:text-red-500"
                      onClick={() => handleRemove(actualIndex)}
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {hasMoreImages && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisibleCount(prev => Math.min(prev + 12, imagesWithIds.length))}
              className="w-full text-sm"
            >
              Zobraziť viac ({imagesWithIds.length - visibleCount} zostáva)
            </Button>
          )}

          {hasUnuploadedImages && (
            <div className="space-y-2">
              <Button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="w-full text-sm sm:text-base"
              >
                {uploading 
                  ? `Nahrávam... (${imagesWithIds.filter((img) => img.assetId).length}/${imagesWithIds.length})`
                  : `Nahrať ${imagesWithIds.filter((img) => !img.assetId).length} obrázok(ov)`
                }
              </Button>
              {uploading && (
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ 
                      width: `${(imagesWithIds.filter((img) => img.assetId).length / imagesWithIds.length) * 100}%` 
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
