import 'server-only'

/** 서버 전용: 결제 승인·쿠키 서명에 쓰는 시크릿 키 (API 개별 연동). 하위 호환으로 위젯 시크릿 이름도 허용. */
export function getTossSecretKey(): string {
  return (
    process.env.TOSS_SECRET_KEY?.trim() ??
    process.env.TOSS_WIDGET_SECRET_KEY?.trim() ??
    ''
  )
}
