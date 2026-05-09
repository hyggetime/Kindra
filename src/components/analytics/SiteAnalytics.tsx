import Script from 'next/script'

/**
 * Google Analytics 4(gtag) · Microsoft Clarity.
 * - GA: `NEXT_PUBLIC_GA_MEASUREMENT_ID` (미설정 시 기존 측정 ID로 폴백)
 * - Clarity: `NEXT_PUBLIC_CLARITY_PROJECT_ID` (선택, 없으면 로드 안 함)
 */
export function SiteAnalytics() {
  const gaId = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? 'G-QHB2KXJ78B').trim()
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim() ?? ''

  return (
    <>
      {gaId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="kindra-gtag" strategy="afterInteractive">
            {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');
            `.trim()}
          </Script>
        </>
      ) : null}

      {clarityId ? (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${clarityId}");
          `.trim()}
        </Script>
      ) : null}
    </>
  )
}
