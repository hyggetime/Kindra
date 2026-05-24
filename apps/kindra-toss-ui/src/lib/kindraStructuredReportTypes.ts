/** 킨드라 구조화 JSON 리포트 — `dev1-prompts` 스키마와 동형 (미니앱 UI용). */

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

export type KindraStructuredReportJson = {
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
