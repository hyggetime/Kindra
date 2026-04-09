type GalleryItem = {
  id: string
  src: string
  alt: string
  /** 원본 위 마커(동그란 강조) 위치 % */
  marker: { left: string; top: string }
  /** 확대 배경: size %, position */
  zoomBg: { size: string; posX: string; posY: string }
  /** SVG viewBox 0~100 기준 연결선 (원본 쪽 → 확대 컷 쪽) */
  line: { x1: number; y1: number; x2: number; y2: number }
  tags: string[]
  comment: string
}

const ITEMS: GalleryItem[] = [
  {
    id: '1',
    src: '/gallery-1.svg',
    alt: '인물 얼굴과 시선이 담긴 그림',
    marker: { left: '50%', top: '28%' },
    zoomBg: { size: '280% 280%', posX: '50%', posY: '26%' },
    line: { x1: 27, y1: 30, x2: 73, y2: 40 },
    tags: ['#소근육우수', '#시선표현'],
    comment:
      '눈동자와 입 주변을 조심스럽게 도려낸 선은, 손끝의 힘이 또래보다 안정적으로 자리 잡았다는 뜻이에요. 작은 반짝임까지 놓치지 않는 시선이 느껴져요.',
  },
  {
    id: '2',
    src: '/gallery-2.svg',
    alt: '상황과 인물이 어우러진 장면',
    marker: { left: '52%', top: '48%' },
    zoomBg: { size: '260% 260%', posX: '52%', posY: '48%' },
    line: { x1: 28, y1: 46, x2: 72, y2: 46 },
    tags: ['#창의적서사', '#상황구성'],
    comment:
      '여러 인물과 사물이 한 장면에 얽히듯 놓여 있어요. 단순 나열이 아니라, 이야기의 한 순간을 고른 듯한 구성이에요.',
  },
  {
    id: '3',
    src: '/gallery-3.svg',
    alt: '색과 형의 균형이 드러난 그림',
    marker: { left: '50%', top: '62%' },
    zoomBg: { size: '300% 300%', posX: '50%', posY: '62%' },
    line: { x1: 28, y1: 56, x2: 72, y2: 48 },
    tags: ['#색채조화', '#장식디테일'],
    comment:
      '색이 침범하지 않고 자기 구역을 지키며 만나요. 장식과 면의 경계에서 느껴지는 섬세함이, 차분한 집중력을 보여 줍니다.',
  },
]

function GalleryCard({ item }: { item: GalleryItem }) {
  return (
    <article className="relative overflow-hidden rounded-[28px] border border-[#EDE8E0] bg-white p-5 shadow-[0_16px_48px_-32px_rgba(74,74,74,0.22)] sm:p-8">
      {/* 데스크톱: 좌우를 잇는 안내선 */}
      <svg
        className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full md:block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <line
          x1={item.line.x1}
          y1={item.line.y1}
          x2={item.line.x2}
          y2={item.line.y2}
          stroke="#7C9070"
          strokeWidth={0.35}
          strokeLinecap="round"
          strokeDasharray="0.8 0.6"
          opacity={0.85}
        />
        <circle cx={item.line.x1} cy={item.line.y1} r={0.9} fill="#7C9070" opacity={0.9} />
        <circle cx={item.line.x2} cy={item.line.y2} r={0.7} fill="#A45C40" opacity={0.85} />
      </svg>

      <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center md:gap-6 lg:gap-10">
        {/* 왼쪽: 원본 */}
        <div className="md:min-w-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#8A8A8A]">
            아이 원본 그림
          </p>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F7F5F2] ring-1 ring-[#EDE8E0]">
            <img src={item.src} alt={item.alt} className="h-full w-full object-cover" loading="lazy" />
            {/* 동그란 마킹 */}
            <div
              className="pointer-events-none absolute h-[18%] w-[18%] min-h-[2.5rem] min-w-[2.5rem] rounded-full border-[3px] border-[#7C9070] bg-[#7C9070]/10 shadow-[0_0_0_4px_rgba(253,251,249,0.85)]"
              style={{
                left: item.marker.left,
                top: item.marker.top,
                transform: 'translate(-50%, -50%)',
              }}
              aria-hidden
            />
          </div>
        </div>

        {/* 모바일: 원본 → 확대 안내선 */}
        <div
          className="flex flex-col items-center justify-center gap-1 py-1 md:hidden"
          aria-hidden
        >
          <svg width="2" height="36" className="text-[#7C9070]">
            <line
              x1="1"
              y1="0"
              x2="1"
              y2="36"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 5"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[10px] font-medium tracking-wide text-[#7C9070]/90">확대 컷</span>
        </div>

        {/* 오른쪽: 확대 컷 + 태그 + 코멘트 */}
        <div className="flex flex-col items-center md:items-start">
          <p className="mb-3 w-full text-center text-xs font-semibold uppercase tracking-[0.12em] text-[#8A8A8A] md:text-left">
            킨드라 분석 확대 컷
          </p>
          <div className="relative mx-auto md:mx-0">
            <div
              className="h-40 w-40 overflow-hidden rounded-full border-[4px] border-[#7C9070] shadow-[0_12px_32px_-16px_rgba(124,144,112,0.45)] sm:h-44 sm:w-44"
              style={{
                backgroundImage: `url(${item.src})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: item.zoomBg.size,
                backgroundPosition: `${item.zoomBg.posX} ${item.zoomBg.posY}`,
              }}
              role="img"
              aria-label={`${item.alt} — 확대 영역`}
            />
          </div>

          <div className="mt-5 flex w-full max-w-md flex-wrap justify-center gap-2 md:justify-start">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#F3EFE0] px-3 py-1 text-xs font-semibold text-[#5C6656]"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-4 w-full max-w-md text-center text-sm leading-[1.85] text-[#5A5A5A] md:text-left">
            {item.comment}
          </p>
        </div>
      </div>
    </article>
  )
}

export function KindraGallery() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-10 text-center sm:mb-12">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#7C9070]/85">Gallery</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#4A4A4A] sm:text-3xl">Kindra Gallery</h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-[1.9] text-[#6B6B6B] sm:text-base">
          원본 그림 위에 마음이 머무는 지점을 동그랗게 짚고, 그 한 점을 확대해 읽어 드려요. 선으로 이어진
          곳이 바로 킨드라가 함께 보고 싶었던 ‘결’이에요.
        </p>
      </div>

      <div className="flex flex-col gap-12 sm:gap-14">
        {ITEMS.map((item) => (
          <GalleryCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
