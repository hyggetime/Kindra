import { KINDRA_GALLERY_INTRO, KINDRA_GALLERY_ITEMS, type GalleryItem } from '../data/kindraGalleryItems'

function GalleryCard({ item, index }: { item: GalleryItem; index: number }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-[#EDE8E0] bg-white shadow-[0_16px_48px_-24px_rgba(74,74,74,0.18)]">
      {/* Image */}
      <div className="bg-[#F7F5F2]">
        <img
          src={item.src}
          alt={item.alt}
          loading="lazy"
          className="w-full object-contain"
          style={{ maxHeight: '480px' }}
        />
      </div>

      {/* Content */}
      <div className="px-6 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-10">

        {/* Label + index */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C9070]/80">
            {item.label}
          </span>
          <span className="text-[10px] font-medium tabular-nums text-[#CDCAC4]">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-xl font-bold leading-snug tracking-tight text-[#3D3D3D] sm:text-2xl">
          {item.title}
        </h3>
        <p className="mt-1.5 text-sm text-[#8A8A8A]">{item.subtitle}</p>

        {/* Tags */}
        <div className="mt-5 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#F3EFE0] px-3.5 py-1.5 text-xs font-semibold text-[#5C6656]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Analysis */}
        <div className="mt-8 space-y-5">
          {item.analysis.map((para, i) => (
            <p key={i} className="text-[0.925rem] leading-[2] text-[#4A4A4A]/90">
              {para}
            </p>
          ))}
        </div>

        {/* Tip */}
        <div className="mt-9 rounded-2xl bg-[#EDF2EB] px-6 py-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4F6048]">
            Hygge Tip · 응원법
          </p>
          <p className="text-sm leading-[1.95] text-[#3D4A38]">{item.tip}</p>
        </div>
      </div>
    </article>
  )
}

export function KindraGallery() {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Section header */}
      <div className="mb-14 px-1 text-center sm:mb-16">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7C9070]/80">
          Kindra Gallery
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#3D3D3D] sm:text-3xl">
          아이 그림 읽기
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-[0.925rem] leading-[2] text-[#5A5A5A]">
          {KINDRA_GALLERY_INTRO}
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-14 sm:gap-16">
        {KINDRA_GALLERY_ITEMS.map((item, i) => (
          <GalleryCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  )
}
