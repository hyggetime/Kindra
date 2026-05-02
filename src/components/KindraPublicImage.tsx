'use client'

import Image from 'next/image'

type FillProps = {
  variant: 'fill'
  src: string
  alt: string
  /** `relative` 를 포함한 프레임 클래스 (높이·너비 필수) */
  frameClassName: string
  imgClassName?: string
  sizes?: string
  priority?: boolean
}

type ContainProps = {
  variant: 'contain'
  src: string
  alt: string
  /** `next/image` 고정 비율용 — 레이아웃은 className 으로 제한 */
  width: number
  height: number
  className?: string
  sizes?: string
  /** SVG 등 최적화가 불필요하거나 제한될 때 */
  unoptimized?: boolean
}

/**
 * `public/` 루트 기준 경로(`/…`) — Vite 와 동일. Next.js `Image` 로 최적화합니다.
 * (외부 URL 은 사용하지 마세요. 필요 시 `next.config` 의 `remotePatterns` 를 추가하세요.)
 */
export function KindraPublicImage(props: FillProps | ContainProps) {
  if (props.variant === 'fill') {
    return (
      <div className={`relative ${props.frameClassName}`}>
        <Image
          src={props.src}
          alt={props.alt}
          fill
          sizes={props.sizes ?? '(max-width: 640px) 100vw, 42rem'}
          className={props.imgClassName ?? 'object-cover object-top'}
          priority={props.priority}
        />
      </div>
    )
  }

  return (
    <Image
      src={props.src}
      alt={props.alt}
      width={props.width}
      height={props.height}
      sizes={props.sizes ?? '(max-width: 640px) 100vw, 42rem'}
      className={props.className ?? 'h-auto w-full object-contain'}
      unoptimized={props.unoptimized}
    />
  )
}
