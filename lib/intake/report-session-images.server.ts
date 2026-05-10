import 'server-only'

import sharp from 'sharp'

/** 히어로(그림 1) — 가로 기준 축소, 용량 절감 */
const HERO_MAX_EDGE = 1400
const HERO_JPEG_QUALITY = 82
/** 그림별 시각 요약 썸네일 */
const THUMB_MAX_EDGE = 360
const THUMB_JPEG_QUALITY = 78

function dataUrlJpeg(buf: Buffer): string {
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

async function toJpegDataUrl(buf: Buffer, maxEdge: number, quality: number): Promise<string> {
  const out = await sharp(buf)
    .rotate()
    .resize({
      width: maxEdge,
      height: maxEdge,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer()
  return dataUrlJpeg(out)
}

export type ReportSlotBuffer = { buf: Buffer; mime: string }

/**
 * 신청 시 업로드 버퍼로 리포트 UI용 data URL 생성 — `report_json.session` 에 저장.
 * DB 용량을 위해 JPEG로 재인코딩·축소합니다.
 */
export async function buildReportSessionImageFields(
  slots: readonly ReportSlotBuffer[],
): Promise<{ heroImageDataUrl?: string; drawingThumbDataUrls?: string[] }> {
  if (slots.length === 0) return {}

  const drawingThumbDataUrls: string[] = []
  for (const slot of slots) {
    try {
      drawingThumbDataUrls.push(await toJpegDataUrl(slot.buf, THUMB_MAX_EDGE, THUMB_JPEG_QUALITY))
    } catch (e) {
      console.error('[buildReportSessionImageFields] thumb failed', e)
      drawingThumbDataUrls.push(await toJpegDataUrl(slot.buf, 480, 68))
    }
  }

  let heroImageDataUrl: string | undefined
  try {
    heroImageDataUrl = await toJpegDataUrl(slots[0]!.buf, HERO_MAX_EDGE, HERO_JPEG_QUALITY)
  } catch (e) {
    console.error('[buildReportSessionImageFields] hero failed', e)
    heroImageDataUrl = drawingThumbDataUrls[0]
  }

  return {
    heroImageDataUrl,
    drawingThumbDataUrls: drawingThumbDataUrls.length > 0 ? drawingThumbDataUrls : undefined,
  }
}
