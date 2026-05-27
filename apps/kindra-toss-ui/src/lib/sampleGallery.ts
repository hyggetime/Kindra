/** 홈·샘플 리포트에 노출하는 5장 예시 그림 (`public/gallery/` 정적 제공) */
export type SampleGalleryItem = {
  src: string
  label: string
  /** 썸네일 표시 시 시계 방향 보정 (도) */
  rotationDeg: number
}

export const SAMPLE_GALLERY_ITEMS: readonly SampleGalleryItem[] = [
  {
    src: '/gallery/birthday-cake.png',
    label: '그림 1 · 생일 케이크',
    rotationDeg: 0,
  },
  {
    src: '/gallery/beach-scene.png',
    label: '그림 2 · 해변 가족',
    rotationDeg: 0,
  },
  {
    src: '/gallery/paper-dolls-a.png',
    label: '그림 3 · 종이 인형',
    rotationDeg: 0,
  },
  {
    src: '/gallery/paper-dolls-b.png',
    label: '그림 4 · 종이 인형',
    rotationDeg: 180,
  },
  {
    src: '/gallery/sketches-card.png',
    label: '그림 5 · 표정 스케치',
    rotationDeg: 0,
  },
] as const

export function getSampleGalleryItem(index: number): SampleGalleryItem | undefined {
  return SAMPLE_GALLERY_ITEMS[index]
}
