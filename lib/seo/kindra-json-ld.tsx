import type { ReactElement } from 'react'

import { BUSINESS_INFO, getBusinessPhone, getBusinessPremisesAddress } from '@lib/legal/business-info'
import { getSiteOrigin } from '@lib/site-origin'

/** 리포트·메타 설명과 정합되는 한 줄 (검색 스니펫용 설명과 동일 계열). */
const KINDRA_SERVICE_SUMMARY =
  '아이 그림을 바탕으로 마음의 패턴을 다정하게 읽어 주는 온라인 리포트 서비스입니다. 임상 진단이 아닌 관찰·경향 안내를 제공합니다.'

/**
 * 전역 schema.org JSON-LD (`Organization` + `WebSite`).
 * `BUSINESS_INFO`·`getSiteOrigin()` 과 푸터·약관 고지를 맞춥니다.
 */
export function KindraJsonLd(): ReactElement {
  const origin = getSiteOrigin()
  const orgId = `${origin}/#organization`
  const websiteId = `${origin}/#website`
  const logoUrl = `${origin}/favicon.png`
  const socialImageUrl = `${origin}/og-image.png`

  const organization: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': orgId,
    name: '킨드라 Kindra',
    legalName: BUSINESS_INFO.tradeNameKo,
    alternateName: [
      BUSINESS_INFO.companyDisplay,
      BUSINESS_INFO.tradeNameEn,
      'Kindra',
      '킨드라',
      'HYGGETIME',
    ],
    url: `${origin}/`,
    description: KINDRA_SERVICE_SUMMARY,
    logo: {
      '@type': 'ImageObject',
      url: logoUrl,
      width: 512,
      height: 512,
    },
    image: socialImageUrl,
    email: BUSINESS_INFO.supportEmail,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
      streetAddress: getBusinessPremisesAddress(),
    },
    taxID: BUSINESS_INFO.bizRegNo,
    identifier: {
      '@type': 'PropertyValue',
      name: '통신판매업 신고번호',
      value: BUSINESS_INFO.mailOrderReportNo,
    },
  }

  const phone = getBusinessPhone()
  if (phone) {
    organization.telephone = phone.replace(/\s/g, '')
  }

  const website = {
    '@type': 'WebSite',
    '@id': websiteId,
    url: `${origin}/`,
    name: '킨드라 Kindra',
    description: KINDRA_SERVICE_SUMMARY,
    inLanguage: 'ko-KR',
    publisher: { '@id': orgId },
    copyrightHolder: { '@id': orgId },
  }

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [organization, website],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
