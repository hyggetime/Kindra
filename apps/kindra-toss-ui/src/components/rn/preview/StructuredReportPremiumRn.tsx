import { StyleSheet, Text, View } from 'react-native'

import { SectionCardRn, ProseRn } from '@/components/rn/preview/SectionCardRn'
import { StructuredReportPentagonRn } from '@/components/rn/preview/StructuredReportPentagonRn'
import { useStructuredReport } from '@/lib/StructuredReportContext'

/** 웹 `StructuredReportPremium.tsx` 섹션 구조 1:1 — RN View/Text 뼈대 */
export function StructuredReportPremiumRn() {
  const { report_sections: rs } = useStructuredReport()

  return (
    <View style={styles.stack}>
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>KINDRA PREMIUM</Text>
        <Text style={styles.heroTitle}>{rs.title}</Text>
        <Text style={styles.heroMeta}>제출 그림 {rs.visual_summary.length}장을 바탕으로 한 통합 분석이에요</Text>
      </View>

      <View style={styles.pentagonCard}>
        <Text style={styles.pentagonTitle}>발달·표현 오각형</Text>
        <Text style={styles.pentagonSub}>발달·표현 5축 (50–100)</Text>
        <StructuredReportPentagonRn />
      </View>

      <SectionCardRn eyebrow="Visual" title="장별 시각 해설">
        <View style={styles.visualList}>
          {rs.visual_summary.map((item) => (
            <View key={item.target_image} style={styles.visualItem}>
              <Text style={styles.visualBadge}>{item.target_image}</Text>
              <ProseRn>{item.description}</ProseRn>
            </View>
          ))}
        </View>
      </SectionCardRn>

      <SectionCardRn eyebrow="Summary" title="전체 요약">
        <ProseRn>{rs.overall_summary}</ProseRn>
      </SectionCardRn>

      <SectionCardRn eyebrow="발달 렌즈" title="인지·표현 관점">
        <View style={styles.lensBlock}>
          <Text style={styles.lensLabel}>Goodenough–Harris (관찰)</Text>
          <ProseRn>{rs.developmental_lenses.goodenough_analysis}</ProseRn>
        </View>
        <View style={styles.lensBlock}>
          <Text style={styles.lensLabel}>Luquet (공간·서사)</Text>
          <ProseRn>{rs.developmental_lenses.luquet_analysis}</ProseRn>
        </View>
        <View style={styles.lensBlock}>
          <Text style={styles.lensLabel}>Lowenfeld (소근육)</Text>
          <ProseRn>{rs.developmental_lenses.lowenfeld_analysis}</ProseRn>
        </View>
      </SectionCardRn>

      <SectionCardRn eyebrow="심리 렌즈" title="정서·형식 관점">
        <View style={styles.lensBlock}>
          <Text style={styles.lensLabel}>DAP / KFD</Text>
          <ProseRn>{rs.psychological_lenses.dap_kfd_analysis}</ProseRn>
        </View>
        <View style={styles.lensBlock}>
          <Text style={styles.lensLabel}>선·필압</Text>
          <ProseRn>{rs.psychological_lenses.line_pressure_analysis}</ProseRn>
        </View>
        <View style={styles.lensBlock}>
          <Text style={styles.lensLabel}>공간·구도</Text>
          <ProseRn>{rs.psychological_lenses.space_layout_analysis}</ProseRn>
        </View>
        <View style={styles.lensBlock}>
          <Text style={styles.lensLabel}>색·밀도</Text>
          <ProseRn>{rs.psychological_lenses.color_density_analysis}</ProseRn>
        </View>
      </SectionCardRn>

      <SectionCardRn eyebrow="Narrative" title="통합 이야기">
        <ProseRn>{rs.integrated_narrative}</ProseRn>
      </SectionCardRn>

      <SectionCardRn eyebrow="Growth" title="신체 스펙 참고치">
        <ProseRn>{rs.growth_stats_guide}</ProseRn>
      </SectionCardRn>

      <SectionCardRn eyebrow="Hygge" title="함께 이어가기">
        {rs.hygge_tips.map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <Text style={styles.tipIndex}>{i + 1}.</Text>
            <ProseRn>{tip}</ProseRn>
          </View>
        ))}
      </SectionCardRn>
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: 20,
    paddingBottom: 48,
  },
  hero: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dfe6d8',
    backgroundColor: '#f7faf4',
    padding: 24,
  },
  heroKicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2.2,
    color: '#6b8562',
  },
  heroTitle: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    color: '#2a3428',
  },
  heroMeta: {
    marginTop: 12,
    fontSize: 12,
    color: '#6b6b6b',
  },
  pentagonCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4ddd3',
    backgroundColor: '#fff',
    padding: 20,
  },
  pentagonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3d5236',
  },
  pentagonSub: {
    marginTop: 4,
    fontSize: 12,
    color: '#7a7a7a',
  },
  visualList: {
    gap: 16,
  },
  visualItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ebe6df',
    backgroundColor: '#fdfcfa',
    padding: 16,
    gap: 8,
  },
  visualBadge: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'rgba(124, 144, 112, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: '#4d6b46',
  },
  lensBlock: {
    marginBottom: 16,
    gap: 6,
  },
  lensLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5a6f52',
  },
  tipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tipIndex: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7c9070',
    lineHeight: 24,
  },
})
