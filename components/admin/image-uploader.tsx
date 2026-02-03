'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
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

  // Ensure all images have IDs - MUST be defined before useEffects that use it
  const ensureImageIds = useCallback((imgs: ImageFile[]): ImageFile[] => {
    return imgs.map(img => ({
      ...img,
      id: img.id || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    }))
  }, [])

  // Keep ref in sync with images prop and ensure IDs
  useEffect(() => {
    // Check if any images need IDs
    const needsIds = images.some(img => !img.id)
    
    if (needsIds) {
      const imagesWithIds = ensureImageIds(images)
      imagesRef.current = imagesWithIds
      onImagesChange(imagesWithIds)
    } else {
      imagesRef.current = images
    }
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

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const fileArray = Array.from(files)
      const currentImages = ensureImageIds(images)
      
      // Add files without creating previews to save memory
      // Preserve the order they were selected in
      const newImages: ImageFile[] = fileArray.map((file, index) => {
        const id = `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`
        return {
          file,
          preview: '', // No preview needed - we'll just show file names
          id,
        }
      })

      // Maintain order: append new images to the end
      const updatedImages = [...currentImages, ...newImages]
      onImagesChange(updatedImages)
      imagesRef.current = updatedImages
      
      // Auto-start upload immediately
      setTimeout(() => {
        if (uploadBatchesRef.current) {
          uploadBatchesRef.current(updatedImages)
        }
      }, 100)
    },
    [images, onImagesChange, ensureImageIds]
  )

  const handleRemove = useCallback(
    (index: number) => {
      const imagesWithIds = ensureImageIds(images)
      const newImages = imagesWithIds.filter((_, i) => i !== index)
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
    // If batch has only one image, upload it directly
    if (batch.length === 1) {
      const formData = new FormData()
      formData.append('files', batch[0].file)

      const response = await fetch('/api/admin/upload-images', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        // Handle 413 (Content Too Large) - file is too big
        if (response.status === 413) {
          throw new Error(`Súbor "${batch[0].file.name}" je príliš veľký (${(batch[0].file.size / 1024 / 1024).toFixed(2)}MB). Maximálna veľkosť je 20MB.`)
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
              errorMessage = `Súbor "${batch[0].file.name}" je príliš veľký (${(batch[0].file.size / 1024 / 1024).toFixed(2)}MB). Maximálna veľkosť je 20MB.`
            } else {
              errorMessage = `Chyba servera (${response.status})`
            }
          } catch {
            errorMessage = `Chyba servera (${response.status})`
          }
        }
        throw new Error(errorMessage)
      }

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

      // Update the single image
      let currentImages = ensureImageIds([...imagesRef.current])
      const result = results[0]
      if (result && result._id && !result.error) {
        const imageIndex = currentImages.findIndex((img) => img.id === batch[0].id)
        if (imageIndex !== -1) {
          currentImages[imageIndex] = {
            ...currentImages[imageIndex],
            assetId: result._id,
            uploading: false,
            uploadProgress: 100,
          }
        }
      } else if (result && result.error) {
        throw new Error(result.error)
      }
      
      imagesRef.current = currentImages
      onImagesChange([...currentImages])
      return
    }

    // Try uploading batch of 3
    const formData = new FormData()
    batch.forEach(img => {
      formData.append('files', img.file)
    })

    const response = await fetch('/api/admin/upload-images', {
      method: 'POST',
      body: formData,
    })

    // Handle 413 (Content Too Large) - batch is too big, retry individually
    if (response.status === 413) {
      // Upload each image individually
      for (const img of batch) {
        try {
          await uploadBatch([img])
        } catch (error) {
          // Mark as failed but continue with others
          let currentImages = ensureImageIds([...imagesRef.current])
          const failedIndex = currentImages.findIndex((i) => i.id === img.id)
          if (failedIndex !== -1) {
            currentImages[failedIndex] = {
              ...currentImages[failedIndex],
              uploading: false,
              uploadProgress: undefined,
            }
            imagesRef.current = currentImages
            onImagesChange([...currentImages])
          }
          // Don't throw - continue with other images
        }
      }
      return
    }

    if (!response.ok) {
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
        // Response is HTML (like error page) - retry individually
        try {
          const text = await response.text()
          if (text.includes('Request Entity Too Large') || text.includes('413') || text.includes('Content Too Large')) {
            // Retry each image individually
            for (const img of batch) {
              try {
                await uploadBatch([img])
              } catch (error) {
                // Mark as failed but continue
                let currentImages = ensureImageIds([...imagesRef.current])
                const failedIndex = currentImages.findIndex((i) => i.id === img.id)
                if (failedIndex !== -1) {
                  currentImages[failedIndex] = {
                    ...currentImages[failedIndex],
                    uploading: false,
                    uploadProgress: undefined,
                  }
                  imagesRef.current = currentImages
                  onImagesChange([...currentImages])
                }
              }
            }
            return
          } else {
            errorMessage = `Chyba servera (${response.status})`
          }
        } catch {
          errorMessage = `Chyba servera (${response.status})`
        }
      }
      throw new Error(errorMessage)
    }

    let results
    try {
      const data = await response.json()
      results = data.results
      if (!results || !Array.isArray(results)) {
        throw new Error('Neplatná odpoveď zo servera')
      }
    } catch (error) {
      throw new Error('Chyba pri komunikácii so serverom. Skúste to znova.')
    }
    
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
          
          // No need to revoke previews since we're not using them
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

  // All images with IDs
  const imagesWithIds = useMemo(() => ensureImageIds(images), [images, ensureImageIds])
  const hasUnuploadedImages = imagesWithIds.some((img) => !img.assetId)

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
          {/* Simple list view - just file names */}
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {imagesWithIds.map((image, index) => (
              <div
                key={image.id}
                className="flex items-center justify-between gap-2 p-2 bg-[#1a1a1a] rounded border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* Order number indicator */}
                  <div className="flex items-center justify-center w-6 h-6 rounded bg-white/10 text-white text-xs font-medium shrink-0">
                    {index + 1}
                  </div>
                  
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
                      disabled={index === imagesWithIds.length - 1}
                      title="Presunúť nadol"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate" title={image.file.name}>
                      {image.file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(image.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
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
