import Link from 'next/link'

import { BizVerifyButton } from '@/components/layout/BizVerifyButton'
import { KakaoChannelButtons } from '@/components/layout/KakaoChannelButtons'
import { shouldShowKakaoChannel } from '@lib/locale/kakao-cs-visibility'

const FTC_BIZ_VERIFY_URL = 'https://www.ftc.go.kr/bizCommPop.do?wrkr_no=8257800316'
const SUPPORT_EMAIL = 'hygge.studio.dev@gmail.com'

export function Footer() {
  const year = new Date().getFullYear()
  const showKakao = shouldShowKakaoChannel()

  return (
    <footer className="border-t border-[#EDE8E0]/90 bg-[#FDFBF9] px-4 py-5 text-[#9A9A9A] sm:px-5 sm:py-6">
      <div className="mx-auto max-w-3xl">
        <div className="min-w-0 space-y-2.5">
          <p className="text-sm font-semibold text-[#4A4A4A] sm:text-base">고객지원</p>
          {showKakao ? <KakaoChannelButtons /> : null}
          <p className="text-[10px] leading-snug sm:text-[11px]">
            <span className="text-[#7A7A7A]">이메일:</span>{' '}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-[#5A6F52] underline decoration-[#C8D4C0] underline-offset-2 transition hover:text-[#4F6048]"
            >
              {SUPPORT_EMAIL}
            </a>
          </p>
        </div>

        <div
          className="mt-4 space-y-1 text-[10px] leading-relaxed text-[#9A9A9A] sm:text-[11px] sm:leading-relaxed"
        >
          <p>
            <span className="text-[#7A7A7A]">상호:</span> 휘게타임 <span className="text-[#C8C4BC]">|</span>{' '}
            <span className="text-[#7A7A7A]">대표:</span> 안형설 <span className="text-[#C8C4BC]">|</span>{' '}
            <span className="text-[#7A7A7A]">사업자등록번호</span> 825-78-00316 <span className="text-[#C8C4BC]">|</span>{' '}
            <BizVerifyButton href={FTC_BIZ_VERIFY_URL} />
          </p>
          <p>
            <span className="text-[#7A7A7A]">통신판매업신고번호</span> 2022-서울양천-0568 <span className="text-[#C8C4BC]">|</span>{' '}
            <span className="text-[#7A7A7A]">개인정보보호책임자:</span> 안형설
          </p>
        </div>

        <div className="mt-4 flex flex-col items-center gap-1.5 border-t border-[#EDE8E0]/70 pt-3 text-[11px] sm:flex-row sm:justify-between sm:gap-2">
          <span className="font-medium tracking-tight text-[#7C9070]/85">Kindra · 킨드라</span>
          <span className="text-center tabular-nums text-[#A8A8A8] sm:text-left">
            © {year} 휘게타임 · All Rights Reserved
          </span>
          <nav className="flex items-center gap-3 text-[11px]">
            <Link href="/privacy" className="text-[#8A8A8A] transition hover:text-[#5A6F52]">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="text-[#8A8A8A] transition hover:text-[#5A6F52]">
              이용약관
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
