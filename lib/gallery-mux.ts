/** Mux image API poster for a playback id (gallery grid / modal poster). */
export function galleryMuxPosterUrl(playbackId: string): string {
  return `https://image.mux.com/${encodeURIComponent(playbackId)}/thumbnail.jpg?time=1&width=800`
}
