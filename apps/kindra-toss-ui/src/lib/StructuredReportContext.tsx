import { createContext, useContext, type ReactNode } from 'react'

import type { KindraStructuredReportJson } from '@/lib/kindra-engine'

const StructuredReportContext = createContext<KindraStructuredReportJson | null>(null)

export function StructuredReportProvider({
  value,
  children,
}: {
  value: KindraStructuredReportJson
  children: ReactNode
}) {
  return <StructuredReportContext.Provider value={value}>{children}</StructuredReportContext.Provider>
}

export function useStructuredReport(): KindraStructuredReportJson {
  const v = useContext(StructuredReportContext)
  if (!v) {
    throw new Error('useStructuredReport: Provider가 트리 상위에 없습니다.')
  }
  return v
}
