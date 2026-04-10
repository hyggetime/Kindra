export type InteractiveGalleryMarker = {
  x: string
  y: string
}

export type InteractiveGalleryAnalysisPoint = {
  id: number
  tag: string
  title: string
  description: string
  markerCoordinate: InteractiveGalleryMarker
  zoomImageFilename?: string
}

export type InteractiveGalleryReport = {
  reportTitle: string
  childInfo: { name: string; age: string; gender: string }
  overallComment: string
  analysisPoints: InteractiveGalleryAnalysisPoint[]
  parentGuide: {
    sectionTitle: string
    praisePoints: string[]
    directScript: string[]
  }
}
