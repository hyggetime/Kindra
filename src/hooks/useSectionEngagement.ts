import { useEffect } from 'react'
import { trackEvent } from '../lib/analytics'

const DWELL_MS = 2000

/**
 * `[data-track-section]` 속성을 가진 모든 섹션 요소를 Intersection Observer 로 감시합니다.
 * 섹션이 화면에 2초 이상 노출되면 해당 섹션을 "읽음"으로 간주하고
 * `section_read` 이벤트를 전송합니다. 각 섹션은 한 세션에서 한 번만 전송됩니다.
 */
export function useSectionEngagement(reportId: string): void {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-track-section]'),
    )
    if (!elements.length) return

    const timers = new Map<HTMLElement, ReturnType<typeof setTimeout>>()
    const fired = new Set<HTMLElement>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement

          if (entry.isIntersecting && !fired.has(el)) {
            const timer = window.setTimeout(() => {
              if (!fired.has(el)) {
                fired.add(el)
                const sectionTitle = el.dataset.trackSection ?? 'unknown'
                trackEvent('section_read', {
                  section_title: sectionTitle,
                  report_id: reportId,
                })
              }
              timers.delete(el)
            }, DWELL_MS)

            timers.set(el, timer)
          } else {
            const pending = timers.get(el)
            if (pending !== undefined) {
              window.clearTimeout(pending)
              timers.delete(el)
            }
          }
        }
      },
      { threshold: 0.5 },
    )

    elements.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [reportId])
}
