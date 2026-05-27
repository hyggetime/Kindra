import Image from 'next/image'

import { getSampleGalleryItem } from '@/lib/sampleGallery'

type Props = {
  index: number
  alt?: string
  className?: string
}

/** `visual_summary` 항목 순서(0~4) ↔ `public/gallery` 예시 그림 */
export function VisualSummaryDrawingThumb({ index, alt, className = 'h-[9rem] w-[9rem]' }: Props) {
  const item = getSampleGalleryItem(index)
  if (!item) return null

  const needsRotate = item.rotationDeg !== 0

  return (
    <figure
      className={`relative overflow-hidden rounded-xl border border-[#e8e4dc] bg-[#faf6ef] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] ${className}`}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center ${needsRotate ? 'p-0.5' : ''}`}
        style={needsRotate ? { transform: `rotate(${item.rotationDeg}deg)` } : undefined}
      >
        <div className={`relative ${needsRotate ? 'h-[115%] w-[115%]' : 'h-full w-full'}`}>
          <Image
            src={item.src}
            alt={alt ?? item.label}
            fill
            className="object-contain"
            sizes="144px"
            unoptimized
          />
        </div>
      </div>
    </figure>
  )
}
