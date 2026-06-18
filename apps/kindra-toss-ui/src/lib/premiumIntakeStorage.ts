/** RN·웹 공통 — sessionStorage 없을 때 인메모리 폴백 */

const memory = new Map<string, string>()

export function setPremiumSessionItem(key: string, value: string): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(key, value)
    return
  }
  memory.set(key, value)
}

export function getPremiumSessionItem(key: string): string | null {
  if (typeof sessionStorage !== 'undefined') {
    return sessionStorage.getItem(key)
  }
  return memory.get(key) ?? null
}
