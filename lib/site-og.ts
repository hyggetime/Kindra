/**
 * 공유 미리보기용 OG 이미지 (`public/og-image.png`, scripts/make_og_image.py 생성).
 *
 * 이미지를 다시 생성했을 때: 아래 `OG_IMAGE_CACHE_VERSION`만 1 올리면
 * `SITE_OG_IMAGE.url`의 `?v=`가 함께 바뀝니다. (카카오톡 등 캐시 무효화)
 */
export const OG_IMAGE_CACHE_VERSION = 7

export const SITE_OG_IMAGE = {
  url: `/og-image.png?v=${OG_IMAGE_CACHE_VERSION}`,
  width: 1200,
  height: 630,
  /** 이미지 안의 메인 카피와 맞춤 (make_og_image.py MAIN_LINES) */
  alt: '아이를 잘 보고 있다는 것, 킨드라의 리포트가 함께 느껴드립니다.',
} as const
