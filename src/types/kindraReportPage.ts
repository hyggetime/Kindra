export type KindraReportColorSwatch = {
  hex: string
  label: string
}

export type KindraReportAnalysisSection = {
  label: string
  title: string
  /** `**강조**` 구간은 굵게 렌더링됩니다. */
  body: string
}

export type KindraReportHyggeTip = {
  title: string
  body: string
}

export type KindraReportPageData = {
  reportId: string
  /** @deprecated URL 은 `/reports/{uuid}` 고정 — 레거시 JSON 호환용으로만 남김 */
  slug?: string
  childShortName: string
  seo: {
    title: string
    description: string
  }
  hero: {
    imageSrc: string
    imageAlt: string
    kicker: string
    titleLines: [string, string]
  }
  subject: {
    applicantLabel: string
    childLabel: string
    birthAndMaterials: string
  }
  philosophyTitle: string
  philosophyBody: string
  coreNatureHeading: string
  tags: string[]
  analysisSections: KindraReportAnalysisSection[]
  summary: {
    title: string
    body: string
  }
  hyggeSectionTitle: string
  hyggeTips: KindraReportHyggeTip[]
  colorSpectrumTitle: string
  colorSpectrumIntro: string
  colors: KindraReportColorSwatch[]
  share: {
    headline: string
    copyButtonLabel: string
    copiedFeedback: string
  }
  footer: {
    disclaimer: string
    securityNote: string
    ctaLabel: string
  }
}
