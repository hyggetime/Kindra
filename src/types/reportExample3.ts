export interface ReportExample3AnalysisItem {
  focus: string
  detail: string
}

export interface ReportExample3TechnicalTrust {
  stars: string
  reason: string
}

export interface ReportExample3Section {
  id: string
  section_heading: string
  category: string
  title: string
  score: number
  approach_intro: string
  analysis_items: ReportExample3AnalysisItem[]
  evidence: string
  helper_comment: string
  technical_trust: ReportExample3TechnicalTrust
}

export interface ReportExample3Data {
  report_id: string
  project_name: string
  report_title: string
  report_title_emoji?: string
  subject: string
  observation: string
  sections: ReportExample3Section[]
  summary_insight: string
}
