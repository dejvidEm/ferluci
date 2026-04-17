"use client"

import MuxPlayer from "@mux/mux-player-react"

type Props = {
  playbackId: string
  poster?: string
  autoPlay?: boolean
  className?: string
}

export default function GalleryMuxPlayer({ playbackId, poster, autoPlay, className }: Props) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      streamType="on-demand"
      poster={poster}
      autoPlay={Boolean(autoPlay)}
      muted={Boolean(autoPlay)}
      playsInline
      className={className}
    />
  )
}
