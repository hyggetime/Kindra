/** 구조화 JSON 리포트 — 루트 `lib/gemini/kindra-structured-json-report.ts` 와 동형 */

export type KindraChartScoresJson = {
  fine_motor: number
  observation: number
  spatial_logic: number
  narrative: number
  emotional_resource: number
}

export type KindraVisualSummaryItemJson = {
  target_image: string
  description: string
}

export type KindraStructuredChartReportJson = {
  chart_scores: KindraChartScoresJson
  report_sections: {
    title: string
    visual_summary: KindraVisualSummaryItemJson[]
    overall_summary: string
    developmental_lenses: {
      goodenough_analysis: string
      luquet_analysis: string
      lowenfeld_analysis: string
    }
    psychological_lenses: {
      dap_kfd_analysis: string
      line_pressure_analysis: string
      space_layout_analysis: string
      color_density_analysis: string
    }
    integrated_narrative: string
    growth_stats_guide: string
    hygge_tips: string[]
  }
}

/** 미니앱·웹 UI 공통 별칭 */
export type KindraStructuredReportJson = KindraStructuredChartReportJson
