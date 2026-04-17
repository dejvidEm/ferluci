"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import { useGalleryMuxPlaybackSingle } from "@/lib/hooks/useGalleryMuxPlaybackSingle"
import { galleryMuxPosterUrl } from "@/lib/gallery-mux"

const GalleryMuxPlayer = dynamic(() => import("@/components/gallery-mux-player"), { ssr: false })

type Props = {
  videoUrl: string
  poster?: string
  alt: string
  loadingText: string
  unsupportedText: string
}

/** Loads Mux or direct video only when mounted (open modal). */
export default function GalleryOpenedVideo({
  videoUrl,
  poster,
  alt,
  loadingText,
  unsupportedText,
}: Props) {
  const mux = useGalleryMuxPlaybackSingle(videoUrl)

  if (mux.mode === "mux") {
    return (
      <GalleryMuxPlayer
        playbackId={mux.playbackId}
        poster={poster || galleryMuxPosterUrl(mux.playbackId)}
        autoPlay
        className="w-full max-w-full max-h-[95vh] bg-black"
      />
    )
  }

  if (mux.mode === "pending") {
    return (
      <div className="relative flex min-h-[40vh] w-full max-w-4xl flex-col items-center justify-center gap-4 p-8">
        {poster ? (
          <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-md">
            <Image src={poster} alt={alt} fill className="object-contain" sizes="95vw" />
          </div>
        ) : (
          <div className="h-48 w-full max-w-3xl rounded-md bg-neutral-900" />
        )}
        <p className="text-center text-sm text-neutral-400">{loadingText}</p>
      </div>
    )
  }

  return (
    <video
      src={videoUrl}
      controls
      autoPlay
      preload="metadata"
      playsInline
      className="max-w-full max-h-full w-auto h-auto"
      style={{ maxHeight: "95vh" }}
    >
      {unsupportedText}
    </video>
  )
}
