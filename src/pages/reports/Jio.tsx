import jioJson from '../../data/reports/jio.json'
import type { KindraReportPageData } from '../../types/kindraReportPage'
import { ReportDocument } from './ReportDocument'

const jioData = jioJson as KindraReportPageData

export function JioReportPage() {
  return <ReportDocument data={jioData} />
}
