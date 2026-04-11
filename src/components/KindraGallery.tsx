import {
  KINDRA_GALLERY_FOOTER_AFTER,
  KINDRA_GALLERY_FOOTER_BEFORE,
  KINDRA_GALLERY_INTRO,
  KINDRA_GALLERY_ITEMS,
  KINDRA_GALLERY_LABEL_ANALYSIS,
  KINDRA_GALLERY_LABEL_ORIGINAL,
  type GalleryItem,
} from '../data/kindraGalleryItems'

function GalleryCard({ item }: { item: GalleryItem }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-[#EDE8E0] bg-white p-5 shadow-[0_16px_48px_-32px_rgba(74,74,74,0.22)] sm:p-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start md:gap-6 lg:gap-10">
        <div className="md:min-w-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#8A8A8A]">
            {KINDRA_GALLERY_LABEL_ORIGINAL}
          </p>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F7F5F2] ring-1 ring-[#EDE8E0]">
            <img src={item.src} alt={item.alt} className="h-full w-full object-cover" loading="lazy" />
          </div>
        </div>

        <div className="flex flex-col items-center md:items-start">
          <p className="mb-3 w-full text-center text-xs font-semibold uppercase tracking-[0.12em] text-[#8A8A8A] md:text-left">
            {KINDRA_GALLERY_LABEL_ANALYSIS}
          </p>

          <div className="flex w-full max-w-md flex-wrap justify-center gap-2 md:justify-start">
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

      <div className="flex flex-col gap-12 sm:gap-14">
        {KINDRA_GALLERY_ITEMS.map((item) => (
          <GalleryCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
