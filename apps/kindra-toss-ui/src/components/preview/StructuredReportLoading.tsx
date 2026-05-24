'use client'

/**
 * 분석 대기 UI — 네트워크 없이 즉시 마운트·스타일 튜닝용.
 * 토스 WebView에서도 가벼운 CSS 애니메이션만 사용합니다.
 */
export function StructuredReportLoading() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#e4ddd3] bg-gradient-to-b from-white via-[#faf8f4] to-[#f3efe8] px-6 py-14 text-center shadow-[0_12px_40px_-18px_rgba(60,52,40,0.35)]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <div className="absolute -left-1/4 top-0 h-64 w-64 rounded-full bg-[#7c9070] blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-72 w-72 rounded-full bg-[#c4a574] blur-3xl" />
      </div>

      <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
        <span className="absolute inline-flex h-24 w-24 animate-pulse rounded-full border-2 border-[#7c9070]/25" />
        <span className="absolute inline-flex h-20 w-20 animate-spin rounded-full border-2 border-[#7c9070]/20 border-t-[#7c9070]" />
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#7c9070] text-lg text-white shadow-md">
          ✎
        </span>
      </div>

      <h2 className="relative mt-8 text-lg font-bold tracking-tight text-[#2f3d2e]">그림을 읽고 있어요</h2>
      <p className="relative mx-auto mt-3 max-w-xs text-sm leading-relaxed text-[#5c5c5c]">
        제출하신 그림과 이야기를 차분히 살펴보는 중이에요. 잠시만 기다려 주세요.
      </p>

      <div className="relative mt-8 flex justify-center gap-1.5" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7c9070]/50"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </section>
  )
}
