import { useInitialSearchParams } from '@granite-js/react-native'
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'

import { StructuredReportPremiumRn } from '@/components/rn/preview/StructuredReportPremiumRn'
import type { KindraStructuredReportJson } from '@/lib/kindra-engine'
import { KINDRA_LIVE_STRUCTURED_REPORT_STORAGE_KEY } from '@/lib/kindraPremiumIntakeTypes'
import { getPremiumSessionItem } from '@/lib/premiumIntakeStorage'
import { MOCK_KINDRA_STRUCTURED_REPORT } from '@/lib/kindraStructuredReportMock'
import { StructuredReportProvider } from '@/lib/StructuredReportContext'

function readLiveReportFromStorage(): KindraStructuredReportJson | null {
  const raw = getPremiumSessionItem(KINDRA_LIVE_STRUCTURED_REPORT_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as KindraStructuredReportJson
  } catch {
    return null
  }
}

export function StructuredReportPreviewScreen() {
  const params = useInitialSearchParams()
  const live = String(params?.live ?? '') === '1'
  const [liveReport, setLiveReport] = useState<KindraStructuredReportJson | null>(null)
  const [liveReadDone, setLiveReadDone] = useState(!live)

  useEffect(() => {
    if (!live) {
      setLiveReadDone(true)
      return
    }
    setLiveReport(readLiveReportFromStorage())
    setLiveReadDone(true)
  }, [live])

  const report = useMemo(() => {
    if (live && liveReport) return liveReport
    return MOCK_KINDRA_STRUCTURED_REPORT
  }, [live, liveReport])

  const subtitle = live ? '실시간 리포트' : '샘플 리포트'

  if (live && !liveReadDone) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c9070" />
        <Text style={styles.muted}>리포트를 불러오는 중…</Text>
      </View>
    )
  }

  if (live && liveReadDone && liveReport === null) {
    return (
      <View style={styles.centered}>
        <Text style={styles.warn}>
          저장된 리포트 JSON이 없습니다. 결제 완료 후 다시 시도하거나 샘플 리포트를 확인해 주세요.
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerBadge}>{subtitle.toUpperCase()}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <StructuredReportProvider value={report}>
          <StructuredReportPremiumRn />
        </StructuredReportProvider>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fbf9f5',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#e4ddd3',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(251, 249, 245, 0.95)',
  },
  headerBadge: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: '#7c9070',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fbf9f5',
  },
  muted: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b6b6b',
  },
  warn: {
    fontSize: 14,
    lineHeight: 22,
    color: '#92400e',
    textAlign: 'center',
  },
})
