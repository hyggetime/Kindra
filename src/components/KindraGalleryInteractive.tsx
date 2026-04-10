import { useCallback, useEffect, useId, useState } from 'react'
import { INTERACTIVE_GALLERY_REPORT } from '../data/interactiveGalleryReport'
import type { InteractiveGalleryAnalysisPoint } from '../types/interactiveGalleryReport'

const HERO_SRC = '/represent.jpg'
const ZOOM = 2.35
const TRANSITION_MS = 700

const sage =
  'bg-[#7C9070] shadow-[0_0_0_3px_rgba(253,251,249,0.95),0_4px_14px_rgba(124,144,112,0.45)]'

export function KindraGalleryInteractive() {
  const { reportTitle, childInfo, overallComment, analysisPoints, parentGuide } =
    INTERACTIVE_GALLERY_REPORT
  const [active, setActive] = useState<InteractiveGalleryAnalysisPoint | null>(null)
  const titleId = useId()

  const close = useCallback(() => setActive(null), [])

  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [active])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, close])

  const origin =
    active != null
      ? `${active.markerCoordinate.x} ${active.markerCoordinate.y}`
      : '50% 50%'

  const scriptForActive =
    active != null ? parentGuide.directScript[active.id - 1] ?? '' : ''

  return (
    <section
      className="mb-14 rounded-[28px] border border-[#EDE8E0] bg-white p-5 shadow-[0_16px_48px_-32px_rgba(74,74,74,0.18)] sm:mb-16 sm:p-8"
      aria-labelledby={titleId}
    >
      <div className="mb-6 text-center sm:mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7C9070]/85">
          Interactive
        </p>
        <h3 id={titleId} className="mt-2 text-xl font-semibold text-[#4A4A4A] sm:text-2xl">
          {reportTitle}
        </h3>
        <p className="mt-2 text-sm text-[#6B6B6B]">
          {childInfo.name} · {childInfo.age} · {childInfo.gender}
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm leading-[1.85] text-[#5A5A5A]">
          {overallComment}
        </p>
        <p className="mt-4 text-xs text-[#8A8A8A]">
          Tap the sage-green dots on the art to zoom in and read the insight plus a line you can say
          tonight. Tap the dimmed area outside the card to zoom back out.
        </p>
      </div>

      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl bg-[#F0EDE8] ring-1 ring-[#EDE8E0]">
        <div
          className="will-change-transform transition-[transform,transform-origin] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transform: active ? `scale(${ZOOM})` : 'scale(1)',
            transformOrigin: origin,
            transitionDuration: `${TRANSITION_MS}ms`,
          }}
        >
          <div className="relative aspect-[3/4] w-full sm:aspect-[4/5]">
            <img
              src={HERO_SRC}
              alt={`${childInfo.name}의 그림 — ${reportTitle}`}
              className="h-full w-full object-cover object-center"
              draggable={false}
            />
            {analysisPoints.map((p) => {
              const isOn = active?.id === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`${p.tag}: ${p.title}`}
                  aria-expanded={isOn}
                  className={`absolute z-10 flex h-4 w-4 min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full border-2 border-white ${sage} transition-[transform,box-shadow] duration-300 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C9070] ${isOn ? 'z-20 ring-2 ring-white' : ''} `}
                  style={{
                    left: p.markerCoordinate.x,
                    top: p.markerCoordinate.y,
                    transform: `translate(-50%, -50%) scale(${active ? 1 / ZOOM : 1})`,
                    transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.22,1,0.36,1)`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setActive(p)
                  }}
                >
                  <span className="sr-only">{p.title}</span>
                  <span
                    className="block h-2.5 w-2.5 rounded-full bg-white/90"
                    aria-hidden
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
          role="presentation"
          onClick={close}
        >
          <div
            className="absolute inset-0 bg-[#2A2A2A]/40 backdrop-blur-[3px] transition-opacity duration-300"
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="interactive-popup-heading"
            className="relative z-10 mb-0 max-h-[min(88vh,640px)] w-full max-w-lg translate-y-0 overflow-y-auto rounded-t-3xl border border-[#EDE8E0] bg-[#FDFBF9] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] sm:mb-0 sm:rounded-3xl sm:shadow-[0_24px_64px_-24px_rgba(0,0,0,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex justify-center pt-3 sm:hidden">
              <span className="h-1 w-10 rounded-full bg-[#D4CFC4]" aria-hidden />
            </div>
            <div className="px-6 pb-8 pt-4 sm:p-8">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#E8F0E4] px-3 py-1 text-xs font-semibold text-[#5C6656]">
                  #{active.tag}
                </span>
              </div>
              <h4
                id="interactive-popup-heading"
                className="text-lg font-semibold leading-snug text-[#3D3D3D] sm:text-xl"
              >
                {active.title}
              </h4>
              <p className="mt-4 text-sm leading-[1.9] text-[#5A5A5A]">{active.description}</p>

              <div className="my-6 h-px bg-gradient-to-r from-transparent via-[#EDE8E0] to-transparent" />

              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8A8A8A]">
                Praise script
              </p>
              <p className="mt-1 text-sm font-medium text-[#4A4A4A]">{parentGuide.sectionTitle}</p>

              <blockquote className="mt-4 rounded-2xl border border-[#E8F0E4] bg-[#F7FAF5] px-4 py-4 text-sm leading-[1.85] text-[#4A4A4A]">
                <span className="text-[#7C9070]">“</span>
                {scriptForActive}
                <span className="text-[#7C9070]">”</span>
              </blockquote>

              <p className="mt-3 text-xs text-[#8A8A8A]">
                               Tap outside the card or the dimmed backdrop to zoom out.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
