/**
 * 전자상거래법·이용약관·개인정보처리방침 등에 쓰는 사업자 고지 정보.
 * 푸터(`Footer`)와 법률 문서에서 동일 값을 쓰도록 한곳에 둡니다.
 */
export const BUSINESS_INFO = {
  tradeNameKo: '휘게타임',
  tradeNameEn: 'HYGGETIME',
  /** 약관 본문 등에서 쓰는 통칭 */
  companyDisplay: '휘게타임(HYGGETIME)',
  representative: '안형설',
  bizRegNo: '825-78-00316',
  mailOrderReportNo: '2022-서울양천-0568',
  privacyOfficer: '안형설',
  supportEmail: 'hygge.studio.dev@gmail.com',
  /** 기본 대표번호. `NEXT_PUBLIC_BUSINESS_PHONE`이 있으면 그 값이 우선합니다. */
  supportPhone: '070-7954-6468',
  ftcBizVerifyUrl: 'https://www.ftc.go.kr/bizCommPop.do?wrkr_no=8257800316',
  /** 사업장 소재지(등록 기준). `NEXT_PUBLIC_BUSINESS_PREMISES_ADDRESS`가 있으면 그 값이 우선합니다. */
  premisesAddressKo: '서울특별시 양천구 남부순환로57길 17 1층',
} as const

/** 전자상거래 등 사업장 소재지 표시용 */
export function getBusinessPremisesAddress(): string {
  return process.env.NEXT_PUBLIC_BUSINESS_PREMISES_ADDRESS?.trim() || BUSINESS_INFO.premisesAddressKo
}

/** 대표 고객용 전화. `NEXT_PUBLIC_BUSINESS_PHONE`이 있으면 우선, 없으면 `supportPhone` */
export function getBusinessPhone(): string {
  return process.env.NEXT_PUBLIC_BUSINESS_PHONE?.trim() || BUSINESS_INFO.supportPhone
}
