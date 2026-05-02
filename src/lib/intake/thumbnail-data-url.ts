/** 브라우저에서 리포트용 작은 JPEG data URL 생성 (sessionStorage 용량 절약) */
export async function fileToJpegThumbnailDataUrl(file: File, maxEdge = 280, quality = 0.72): Promise<string> {
  const bmp = await createImageBitmap(file)
  try {
    const { width: w0, height: h0 } = bmp
    const scale = Math.min(1, maxEdge / Math.max(w0, h0))
    const w = Math.max(1, Math.round(w0 * scale))
    const h = Math.max(1, Math.round(h0 * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas 2d')
    ctx.drawImage(bmp, 0, 0, w, h)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob) throw new Error('toBlob failed')
    return await blobToDataUrl(blob)
  } finally {
    bmp.close()
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(blob)
  })
}
