import { useEffect, useRef } from 'react'
import { trackEvent } from '../lib/analytics'

const MILESTONES = [25, 50, 75, 100] as const

/**
 * 페이지 스크롤 깊이가 25 / 50 / 75 / 100% 에 최초로 도달할 때
 * `scroll_depth` 이벤트를 전송합니다. 각 마일스톤은 한 번만 전송됩니다.
 */
export function useScrollDepth(reportId: string): void {
  const firedRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    firedRef.current = new Set()

    const handleScroll = (): void => {
      const el = document.documentElement
      const scrolled = el.scrollTop + el.clientHeight
      const total = el.scrollHeight
      if (total === 0) return
      const pct = (scrolled / total) * 100

      for (const m of MILESTONES) {
        if (!firedRef.current.has(m) && pct >= m) {
          firedRef.current.add(m)
          trackEvent('scroll_depth', { depth: m, report_id: reportId })
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [reportId])
}
