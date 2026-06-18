/**
 * Next 정적 웹 등 — `window.location` 기반 내비게이션.
 * Granite RN 화면에서는 `useNavigation()` (`@granite-js/react-native`) 을 사용하세요.
 * `@granite-js/plugin-router` 는 Node(fs) 의존이 있어 클라이언트 번들에 넣지 않습니다.
 */
export function navigateToPath(path: string): void {
  if (typeof window !== 'undefined' && typeof window.location?.assign === 'function') {
    window.location.assign(path)
    return
  }

  console.warn('[kindra:granite] navigateToPath skipped (no web location):', path)
}
