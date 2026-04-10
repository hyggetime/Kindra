import {
  KINDRA_GALLERY_FOOTER_AFTER,
  KINDRA_GALLERY_FOOTER_BEFORE,
  KINDRA_GALLERY_INTRO,
  KINDRA_GALLERY_ITEMS,
  KINDRA_GALLERY_LABEL_ANALYSIS,
  KINDRA_GALLERY_LABEL_MOBILE,
  KINDRA_GALLERY_LABEL_ORIGINAL,
  KINDRA_GALLERY_ZOOM_SUFFIX,
  type GalleryItem,
} from '../data/kindraGalleryItems'
import { KindraGalleryInteractive } from './KindraGalleryInteractive'

function GalleryCard({ item }: { item: GalleryItem }) {
  return (
    <article className="relative overflow-hidden rounded-[28px] border border-[#EDE8E0] bg-white p-5 shadow-[0_16px_48px_-32px_rgba(74,74,74,0.22)] sm:p-8">
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
        <div className="md:min-w-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#8A8A8A]">
            {KINDRA_GALLERY_LABEL_ORIGINAL}
          </p>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F7F5F2] ring-1 ring-[#EDE8E0]">
            <img src={item.src} alt={item.alt} className="h-full w-full object-cover" loading="lazy" />
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
          <span className="text-[10px] font-medium tracking-wide text-[#7C9070]/90">
            {KINDRA_GALLERY_LABEL_MOBILE}
          </span>
        </div>

        <div className="flex flex-col items-center md:items-start">
          <p className="mb-3 w-full text-center text-xs font-semibold uppercase tracking-[0.12em] text-[#8A8A8A] md:text-left">
            {KINDRA_GALLERY_LABEL_ANALYSIS}
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
              aria-label={`${item.alt}${KINDRA_GALLERY_ZOOM_SUFFIX}`}
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
          {KINDRA_GALLERY_INTRO}
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-[#9A9A9A]">
          {KINDRA_GALLERY_FOOTER_BEFORE}
          <code className="rounded bg-[#F3EFE0] px-1 py-0.5">public/gallery/</code>
          {KINDRA_GALLERY_FOOTER_AFTER}
        </p>
      </div>

      <KindraGalleryInteractive />

      <div className="flex flex-col gap-12 sm:gap-14">
        {KINDRA_GALLERY_ITEMS.map((item) => (
          <GalleryCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
