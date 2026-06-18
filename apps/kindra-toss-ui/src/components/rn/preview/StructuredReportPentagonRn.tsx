import { StyleSheet, Text, View } from 'react-native'

import { chartScoresToAxisRows } from '@/lib/kindra-engine'
import { useStructuredReport } from '@/lib/StructuredReportContext'

/** 웹 `StructuredReportPentagon`(recharts) 대응 — RN 뼈대: 축·점수·밴드 라벨 리스트 */
export function StructuredReportPentagonRn({ compact = false }: { compact?: boolean }) {
  const { chart_scores } = useStructuredReport()
  const rows = chartScoresToAxisRows(chart_scores)

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      {rows.map((row) => (
        <View key={row.key} style={styles.row}>
          <View style={styles.labelCol}>
            <Text style={styles.axisLabel}>{row.label}</Text>
            <Text style={styles.lensHint}>{row.lens}</Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${Math.max(0, Math.min(100, row.value - 50)) * 2}%` }]} />
          </View>
          <Text style={styles.score}>{row.value}</Text>
          <Text style={styles.band}>{row.bandLabel}</Text>
        </View>
      ))}
      <Text style={styles.scaleHint}>발달·표현 5축 (50–100) · 차트는 추후 네이티브 레이더로 교체 예정</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    paddingVertical: 4,
  },
  wrapCompact: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  labelCol: {
    width: 72,
  },
  axisLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4a4a4a',
  },
  lensHint: {
    fontSize: 9,
    color: '#8a8a8a',
  },
  barTrack: {
    flex: 1,
    minWidth: 80,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0d8ce',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#7c9070',
    borderRadius: 4,
  },
  score: {
    width: 28,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
    color: '#4d6b46',
  },
  band: {
    fontSize: 10,
    color: '#6b8562',
    minWidth: 64,
  },
  scaleHint: {
    marginTop: 8,
    fontSize: 11,
    color: '#7a7a7a',
  },
})
