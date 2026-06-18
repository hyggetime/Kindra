/**
 * Granite 파일 기반 라우팅 — `pages/` 하위 화면을 일괄 등록합니다.
 * @see https://developers-apps-in-toss.toss.im/tutorials/react-native.html
 */
export const context = require.context('./pages', true, /\.tsx$/)
