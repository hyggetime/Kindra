import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import jioJson from '@/data/reports/jio.json'
import type { KindraReportPageData } from '@/types/kindraReportPage'
import { isStaticReportSlug, STATIC_REPORT_SLUGS } from '@lib/reports/static-report-slugs'
import { ReportDocument } from '@/views/reports/ReportDocument'

const REPORTS = {
  jio: jioJson as KindraReportPageData,
} satisfies Record<(typeof STATIC_REPORT_SLUGS)[number], KindraReportPageData>

export function generateStaticParams(): { slug: string }[] {
  return Object.keys(REPORTS).map((slug) => ({ slug }))
}

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const data = isStaticReportSlug(slug) ? REPORTS[slug] : undefined
  if (!data) return { title: '리포트 — Kindra', robots: { index: false, follow: false } }
  return {
    title: data.seo.title,
    description: data.seo.description,
    robots: { index: false, follow: false },
  }
}

export default async function ReportBySlugPage({ params }: PageProps) {
  const { slug } = await params
  const data = isStaticReportSlug(slug) ? REPORTS[slug] : undefined
  if (!data) notFound()
  return <ReportDocument data={data} />
}
