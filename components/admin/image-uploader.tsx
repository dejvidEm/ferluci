'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
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

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const newImages: ImageFile[] = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))

      onImagesChange([...images, ...newImages])
    },
    [images, onImagesChange]
  )

  const handleRemove = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index)
      // Revoke object URL to prevent memory leak
      URL.revokeObjectURL(images[index].preview)
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
          const error = await response.json()
          throw new Error(error.error || `Upload failed for ${imageToUpload.file.name}`)
        }

        const { results } = await response.json()
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group bg-[#1a1a1a] rounded-lg overflow-hidden border border-white/10"
              >
                <div className="aspect-square relative">
                  <Image
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {image.uploading && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                      <div className="text-white text-sm mb-2">Nahrávam...</div>
                      {image.uploadProgress !== undefined && (
                        <div className="w-24 h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${image.uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {image.assetId && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
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
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8"
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === images.length - 1}
                    >
                      <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8 text-red-400 hover:text-red-500"
                    onClick={() => handleRemove(index)}
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
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
