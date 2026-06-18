'use client'

import { useEffect } from 'react'

import { initTossInAppIfPresent } from '@/lib/tossInApp'

/** 루트 레이아웃 — `window.toss.init()` 싱크 */
export function TossInAppBootstrap() {
  useEffect(() => {
    initTossInAppIfPresent()
  }, [])
  return null
}
