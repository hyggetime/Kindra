export type GalleryItem = {
  id: string
  src: string
  alt: string
  tags: string[]
  comment: string
}

export const KINDRA_GALLERY_INTRO =
  '아래는 실제 아이 그림 예시입니다. 그림과 해설로 Kindra가 바라보았던 ‘결’의 여정을 함께 만나 보실 수 있습니다.'

export const KINDRA_GALLERY_FOOTER_BEFORE = '생일 케이크, 해변 장면, 스케치 카드, 오려낸 인형 등 추가 예시 이미지는 저장소 '

export const KINDRA_GALLERY_FOOTER_AFTER = '에 함께 두었어요.'

export const KINDRA_GALLERY_LABEL_ORIGINAL = '아이 원본 그림'

export const KINDRA_GALLERY_LABEL_ANALYSIS = 'Kindra 분석'

export const KINDRA_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: '1',
    src: '/gallery/family-four.png',
    alt: '네 명이 한 프레임 안에 모여 있는 아이의 인물화',
    tags: ['#소근육', '#가족관계', '#디테일표현'],
    comment:
      '멀리 장식과 의상의 작은 무늬까지 정성스럽게 그려요. 가족을 한데 모아 머리를 크게 그리는 방식에서는 관계에 대한 관심과 안정감이 동시에 보입니다.',
  },
  {
    id: '2',
    src: '/gallery/watering-scene.png',
    alt: '나무 사이에서 물을 주는 아이와, 하트 모양의 잎이 펴지는 장면',
    tags: ['#의미있는서사', '#정서표현', '#색의조화'],
    comment:
      '물을 주는 동작과 하트 모양의 잎이 만나는 장면에서 정서와 이야기가 한 그림 안에서 자연스럽게 이어져요. 서로 방해하지 않고 각자의 자리를 지키며 색과 이야기가 조화로습니다.',
  },
  {
    id: '3',
    src: '/gallery/seal-show.png',
    alt: '바다사자 쇼와 관람객이 한 장면에 모인 스케치',
    tags: ['#장면구성', '#관찰력', '#이야기전개'],
    comment:
      '여러 인물과 동물, 비누방울까지 한 장면에 다양한 구성력이 보여요. 단순히 보이는 대로 그린 것이 아니라, 그 순간을 기록하려는 마음이 느껴집니다.',
  },
]
