/** 선택 그림을 90° 회전한 새 JPEG File (분석·업로드용 픽셀 반영) */
export async function rotateImageFile(file: File, degreesClockwise: 90 | -90): Promise<File> {
  const bmp = await createImageBitmap(file)
  try {
    const { width: w0, height: h0 } = bmp
    const rad = (degreesClockwise * Math.PI) / 180
    const w = Math.abs(degreesClockwise) === 90 ? h0 : w0
    const h = Math.abs(degreesClockwise) === 90 ? w0 : h0
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas 2d')
    ctx.translate(w / 2, h / 2)
    ctx.rotate(rad)
    ctx.drawImage(bmp, -w0 / 2, -h0 / 2)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
    if (!blob) throw new Error('toBlob failed')
    const stem = file.name.replace(/\.[^.]+$/i, '') || 'drawing'
    return new File([blob], `${stem}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })
  } finally {
    bmp.close()
  }
}
