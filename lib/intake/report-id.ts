/**
 * Jio 샘플(`KINDRA-2026-JIO`)과 같은 패턴의 일련번호.
 * 아이 이름에 라틴 문자가 있으면 그것만 사용하고, 없으면 intake UUID 일부로 짧은 슬러그를 붙입니다.
 */
export function buildIntakeReportIdentifiers(childDisplayName: string, intakeId: string): { reportId: string } {
  const year = new Date().getFullYear()
  const latin = (childDisplayName.normalize('NFKC').match(/[A-Za-z0-9]+/g) ?? []).join('').toUpperCase()
  const hex = intakeId.replace(/-/g, '').toUpperCase()
  const suffix = hex.slice(0, 5)
  const slug = latin.length >= 2 ? latin.slice(0, 12) : `U${suffix}`
  return { reportId: `KINDRA-${year}-${slug}` }
}
