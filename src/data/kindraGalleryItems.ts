export type GalleryItem = {
  id: string
  src: string
  alt: string
  marker: { left: string; top: string }
  zoomBg: { size: string; posX: string; posY: string }
  line: { x1: number; y1: number; x2: number; y2: number }
  tags: string[]
  comment: string
}

export const KINDRA_GALLERY_INTRO = '아래는 실제 아이 그림 예시예요. 원본 위에 마음이띴 무는 지점을 가리게 표시하고, 그 한 순간을 확대해 해석하는 방식을 보여드립니다. 선으로 이어진 연결선이 바로 Kindra가 함께 보얇던 ‘결’이에요.'

export const KINDRA_GALLERY_FOOTER_BEFORE = '생일 케이크, 해벳연 장면, 스케치 카드, 오려낸 인형 등 추가 예시 이미지는 저장소 '

export const KINDRA_GALLERY_FOOTER_AFTER = '에 함께 두었어요.'

export const KINDRA_GALLERY_LABEL_ORIGINAL = '아이 원본 그림'

export const KINDRA_GALLERY_LABEL_MOBILE = '세로 연결'

export const KINDRA_GALLERY_LABEL_ANALYSIS = 'Kindra 분석 · 확대'

export const KINDRA_GALLERY_ZOOM_SUFFIX = ' — 확대 영역'

export const KINDRA_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: '1',
    src: '/gallery/family-four.png',
    alt: '네 명이 한 프레임 안에 모여 있는 아이의 인물화',
    marker: { left: '62%', top: '38%' },
    zoomBg: { size: '260% 260%', posX: '58%', posY: '36%' },
    line: { x1: 28, y1: 34, x2: 72, y2: 40 },
    tags: ['#소근육우수', '#가족관계', '#디테일표현'],
    comment:
      '덜리 장식과 의 작은 무늬까지 정성스레 그려요. 가족을 한데 모아리를 크게 그리는 방식에서, 관계에 대한 관심과 안정감이 동시에 보입니다.',
  },
  {
    id: '2',
    src: '/gallery/watering-scene.png',
    alt: '나무 사이에서 물을 주는 아이와 하트 모양의 잎이 펴지는 장면',
    marker: { left: '70%', top: '36%' },
    zoomBg: { size: '280% 280%', posX: '68%', posY: '34%' },
    line: { x1: 30, y1: 32, x2: 72, y2: 38 },
    tags: ['#의미적서사', '#정서표현', '#색의조화'],
    comment:
      '물을 주는 동작과 하트 모양의 잎이 만나는 장면은 정서와 이야기가 한 그림 안에서 자연스럽게 이어져요. 서로 방해지 않고 각자의 자리를 지키며 조화를 만듭니다.',
  },
  {
    id: '3',
    src: '/gallery/seal-show.png',
    alt: '바다사자 쇼와 관람객이 한데 모인 스케치',
    marker: { left: '48%', top: '44%' },
    zoomBg: { size: '300% 300%', posX: '46%', posY: '42%' },
    line: { x1: 28, y1: 44, x2: 72, y2: 46 },
    tags: ['#상장면구성', '#관찰력', '#이야기장면'],
    comment:
      '여러 인물과 동물, 비누방울까지 한 장면에 다양한 구성력이 보여요. 단순히 보는 것을 그리는 것이 아니라, 귷 순간을 기력하려는 마음이 느력니다.',
  },
]
