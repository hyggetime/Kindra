'use client'

import { createContext, useContext, type ReactNode } from 'react'

import type { KindraStructuredReportJson } from './kindraStructuredReportTypes'

const MockStructuredReportContext = createContext<KindraStructuredReportJson | null>(null)

type ProviderProps = {
  value: KindraStructuredReportJson
  children: ReactNode
}

export function MockStructuredReportProvider({ value, children }: ProviderProps) {
  return <MockStructuredReportContext.Provider value={value}>{children}</MockStructuredReportContext.Provider>
}

export function useMockStructuredReport(): KindraStructuredReportJson {
  const v = useContext(MockStructuredReportContext)
  if (!v) {
    throw new Error('useMockStructuredReport: Provider가 트리 상위에 없습니다.')
  }
  return v
}
