export interface GrowthPoint {
  label: string
  value: number
}

export interface ReportSection {
  category: string
  score: number
  title: string
  content: string
  evidence: string
  tip: string
}

export interface ChildInfo {
  name: string
  birth_month: string
  analysis_period: string
}

export interface ReportSample {
  report_id: string
  child_info: ChildInfo
  sections: ReportSection[]
  mina_insight: string
}
