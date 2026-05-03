import Link from 'next/link'
import type { ReactNode } from 'react'

import { BUSINESS_INFO, getBusinessPhone, getBusinessPremisesAddress } from '@lib/legal/business-info'

const EFFECTIVE_DATE = '2026년 4월 19일'
const COMPANY = BUSINESS_INFO.companyDisplay
const EMAIL = BUSINESS_INFO.supportEmail
const SERVICE = '킨드라(Kindra)'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-base font-bold text-[#3D3D3D]">{title}</h2>
      <div className="space-y-3 text-[0.9rem] leading-[1.95] text-[#5A5A5A]">{children}</div>
    </section>
  )
}

function Table({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <table className="mt-3 w-full border-collapse text-[0.85rem]">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} className="border border-[#E8E4DC]">
            <td className="w-1/3 bg-[#F7F5F2] px-4 py-2.5 font-medium text-[#4A4A4A]">{label}</td>
            <td className="px-4 py-2.5 text-[#5A5A5A]">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-svh bg-[#FDFBF9] text-[#4A4A4A]">
      {/* 헤더 */}
      <header className="border-b border-[#EDE8E0] bg-[#FDFBF9]/90 px-5 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-[#7C9070]">
            Kindra
          </Link>
          <Link href="/" className="text-xs text-[#8A8A8A] transition hover:text-[#7C9070]">
            ← 메인으로
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
        {/* 문서 타이틀 */}
        <div className="mb-10 border-b border-[#EDE8E0] pb-8">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C9070]/80">
            Legal
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#3D3D3D] sm:text-3xl">
            개인정보처리방침
          </h1>
          <p className="mt-3 text-sm text-[#8A8A8A]">
            시행일: {EFFECTIVE_DATE} &nbsp;|&nbsp; 제공자: {COMPANY}
          </p>
        </div>

        <p className="text-[0.9rem] leading-[1.95] text-[#5A5A5A]">
          {COMPANY}(이하 '회사')는 {SERVICE} 서비스(이하 '서비스') 이용자의 개인정보를
          소중히 여기며, 「개인정보 보호법」 및 관련 법령을 준수합니다. 이 방침은
          회사가 수집하는 개인정보의 항목, 이용 목적, 보유 기간, 제3자 제공 여부 및
          이용자의 권리에 대해 안내합니다.
        </p>

        <Section title="1. 수집하는 개인정보 항목 및 수집 방법">
          <p>회사는 서비스 제공을 위해 아래와 같은 개인정보를 수집합니다.</p>
          <Table rows={[
            ['수집 항목', '이메일 주소, 부모(신청자) 표시 이름, 아이 호칭·이름, 아이 성별·연령 힌트·메모(선택), 마케팅·가격 관련 설문 응답(선택), 아이 그림 이미지 파일, 유료 구간 이용 시 입금자명(해당 시) 등 신청·이용 과정에서 입력·업로드되는 정보'],
            ['수집 방법', '웹사이트 내 신청·결제·문의 절차, 이메일 매직 링크 로그인, 서버(Supabase) 및 스토리지에의 저장'],
            ['필수·선택 여부', '이메일, 부모 표시 이름, 아이 호칭·이름, 아이 성별, 그림 이미지: 필수 / 그 외 항목: 서비스 화면에 표시된 대로 필수 또는 선택'],
          ]} />
          <p className="mt-3 rounded-xl bg-[#F7F5F2] px-4 py-3 text-xs text-[#6B6B6B]">
            ※ 아이의 그림 이미지에는 아동의 개인정보가 포함될 수 있습니다.
            부모님(법정대리인)이 동의하신 범위 내에서만 처리하며, 분석 목적 외에 사용하지 않습니다.
          </p>
        </Section>

        <Section title="2. 개인정보의 수집 및 이용 목적">
          <Table rows={[
            ['리포트 작성·제공', '제공된 그림·신청 정보를 바탕으로 아동 그림 심리 관찰 리포트를 작성·저장하고, 로그인된 이용자에게 웹으로 열람할 수 있게 제공'],
            ['본인 확인·서비스 운영', '이메일 기반 로그인(매직 링크), 신청·유료 구간(입금 확인 등) 처리, 부정 이용 방지'],
            ['서비스 품질 향상', '서비스 개선을 위한 내부 분석 (가능한 범위에서 비식별·통계 형태로 활용)'],
            ['고객 응대', '리포트·결제 관련 문의 응답(이메일·카카오톡 채널 등 회사가 안내하는 채널)'],
          ]} />
        </Section>

        <Section title="3. 개인정보의 보유 및 이용 기간">
          <p>
            회사는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
            단, 관련 법령에 따라 보존할 필요가 있는 경우에는 아래 기간 동안 보관합니다.
          </p>
          <Table rows={[
            ['리포트 제공 완료 후', '신청자 요청 시 즉시 삭제, 별도 요청 없을 시 서비스 제공일로부터 1년'],
            ['계좌이체(무통장 입금) 등 대금 관련 기록', '5년 (전자상거래 등에서의 소비자보호에 관한 법률)'],
            ['소비자 불만·분쟁 기록', '3년 (동법)'],
          ]} />
        </Section>

        <Section title="4. 개인정보의 제3자 제공">
          <p>
            회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
            다만 아래의 경우는 예외로 합니다.
          </p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ul>
        </Section>

        <Section title="5. 개인정보 처리 위탁">
          <p>서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 위탁(또는 재수탁)하고 있습니다.</p>
          <Table rows={[
            ['수탁자', '위탁 업무 내용'],
            ['Supabase Inc.', '회원 인증·데이터베이스 및 파일 스토리지 등 클라우드 인프라(신청·리포트·그림 파일 저장)'],
            ['Google LLC', '생성형 AI(Google Gemini API 등)를 이용한 그림·텍스트 기반 분석 처리'],
            ['Vercel Inc.', '웹 애플리케이션 호스팅 및 배포, 접속·성능 관련 지표 처리'],
            [
              '토스페이먼츠(주)',
              '결제 대행 및 본인인증 등 전자결제 처리(결제 위젯·간편결제·카드 결제가 제공되는 경우에 한함)',
            ],
          ]} />
          <p className="mt-2 text-xs text-[#8A8A8A]">
            ※ 위탁 계약 시 개인정보 보호 관련 법규 준수, 개인정보 보호를 위한 기술적·관리적 보호조치,
            재위탁 제한, 수탁자에 대한 관리·감독 및 손해배상 등을 계약서에 명시합니다.
          </p>
          <div className="mt-4 rounded-xl border border-[#E8E4DC] bg-[#F7F5F2] px-4 py-3 text-xs leading-relaxed text-[#5A5A5A]">
            <p className="font-semibold text-[#3D3D3D]">토스페이먼츠(주) 위탁 안내</p>
            <p className="mt-2">
              카드·간편결제 등 <strong>전자결제</strong>를 이용할 때, 회사는 결제 정보를 직접 저장하지 않고{' '}
              <strong>수탁자 토스페이먼츠(주)</strong>가 결제 대행·본인인증 등에 필요한 정보를 처리합니다.
              이에 따라 토스페이먼츠(주)의 개인정보처리방침·전자금융거래 약관 등이 추가로 적용될 수 있습니다.
            </p>
            <p className="mt-2">
              <strong>무통장 입금만</strong> 이용하는 경우에는 위 전자결제(PG) 단계가 없으므로, 그 경로로
              토스페이먼츠(주)에 위탁되는 정보가 생기지 않습니다. 결제 위젯이 노출·활성화되는 경우에는 위 표와
              같이 위탁이 적용될 수 있어 연동 시점에 맞춰 본 방침을 갱신합니다.
            </p>
          </div>
        </Section>

        <Section title="6. 개인정보의 파기 절차 및 방법">
          <ul className="ml-4 list-disc space-y-1.5">
            <li><strong>파기 절차:</strong> 수집 목적 달성 후 별도 데이터베이스(DB) 또는 서류함으로 옮겨 내부 방침 및 관련 법령에 따라 일정 기간 보관 후 파기합니다.</li>
            <li><strong>파기 방법:</strong> 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</li>
          </ul>
        </Section>

        <Section title="7. 이용자의 권리와 행사 방법">
          <p>이용자(및 법정대리인)는 언제든지 다음 권리를 행사할 수 있습니다.</p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>개인정보 열람 요청</li>
            <li>오류 등이 있을 경우 정정 요청</li>
            <li>삭제 요청</li>
            <li>처리 정지 요청</li>
          </ul>
          <p className="mt-2">
            권리 행사는 이메일({EMAIL})로 요청하실 수 있으며, 요청 후 10영업일 이내에 처리합니다.
          </p>
        </Section>

        <Section title="8. 개인정보의 안전성 확보 조치">
          <ul className="ml-4 list-disc space-y-1.5">
            <li><strong>접근 제한:</strong> 개인정보를 처리하는 인원을 최소화하며, 접근 권한을 엄격히 관리합니다.</li>
            <li><strong>암호화:</strong> HTTPS(SSL/TLS)를 통해 개인정보를 암호화하여 전송합니다.</li>
            <li><strong>보안 취약점 관리:</strong> 정기적으로 보안 점검을 실시합니다.</li>
          </ul>
        </Section>

        <Section title="9. 만 14세 미만 아동의 개인정보">
          <p>
            서비스는 만 14세 미만 아동의 개인정보를 수집·이용하지 않는 것을 원칙으로 합니다.
            다만, 서비스 특성상 아이의 그림 이미지(아동의 개인정보가 포함될 수 있음)를
            부모님(법정대리인)이 직접 제공하는 경우, 이는 법정대리인의 동의 및 제공으로 간주합니다.
            서비스 신청 행위 자체가 해당 동의를 포함합니다.
          </p>
        </Section>

        <Section title="10. 쿠키(Cookie) 사용">
          <p>
            서비스는 원활한 이용과 보안을 위해 쿠키 및 이와 유사한 기술을 사용할 수 있습니다. 예를 들어
            로그인 세션 유지, 리포트 열람 권한과 관련된 쿠키, 사이트 이용 분석(Google Analytics 4),
            호스팅사 제공 접속 분석(Vercel Analytics) 등이 있습니다. 브라우저 설정에서 쿠키 저장을
            거부할 수 있으나, 일부 기능이 제한될 수 있습니다.
          </p>
        </Section>

        <Section title="11. 개인정보 보호 책임자">
          <Table rows={[
            ['책임자', `${BUSINESS_INFO.privacyOfficer} (${BUSINESS_INFO.tradeNameKo})`],
            ['이메일', EMAIL],
            ['처리 시간', '영업일 기준 10일 이내 회신'],
          ]} />
          <p className="mt-3">
            개인정보 침해로 인한 신고나 상담이 필요한 경우 아래 기관에 문의하실 수 있습니다.
          </p>
          <ul className="ml-4 mt-1.5 list-disc space-y-1 text-xs text-[#6B6B6B]">
            <li>개인정보침해신고센터: <a href="https://privacy.kisa.or.kr" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#7C9070]">privacy.kisa.or.kr</a> (국번없이 118)</li>
            <li>대검찰청 사이버범죄수사단: <a href="https://www.spo.go.kr" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#7C9070]">www.spo.go.kr</a> (02-3480-3573)</li>
            <li>경찰청 사이버안전국: <a href="https://cyberbureau.police.go.kr" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#7C9070]">cyberbureau.police.go.kr</a> (국번없이 182)</li>
          </ul>
        </Section>

        <Section title="12. 개인정보처리방침의 변경">
          <p>
            이 방침은 {EFFECTIVE_DATE}부터 시행됩니다. 법령, 정책 또는 보안 기술의 변경에 따라
            내용이 변경될 경우, 변경 사항을 서비스 내 공지사항 또는 이메일로 사전 고지합니다.
          </p>
        </Section>

        <Section title="13. 전자상거래법상 사업자 정보">
          <Table rows={[
            ['상호', `${BUSINESS_INFO.tradeNameKo} (${BUSINESS_INFO.tradeNameEn})`],
            ['대표자', BUSINESS_INFO.representative],
            ['사업자등록번호', BUSINESS_INFO.bizRegNo],
            ['통신판매업 신고번호', BUSINESS_INFO.mailOrderReportNo],
            ['사업장 소재지', getBusinessPremisesAddress()],
            ['대표번호', getBusinessPhone() || '고객지원 이메일로 문의 시 안내'],
            [
              '사업자 정보 확인',
              <a
                key="ftc"
                href={BUSINESS_INFO.ftcBizVerifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#7C9070] underline"
              >
                공정거래위원회 사업자정보확인
              </a>,
            ],
          ]} />
        </Section>

        <div className="mt-14 border-t border-[#EDE8E0] pt-8 text-center text-xs text-[#8A8A8A]">
          <p>
            © {new Date().getFullYear()} {BUSINESS_INFO.tradeNameKo} ({BUSINESS_INFO.tradeNameEn}). All rights reserved.
          </p>
          <div className="mt-3 flex justify-center gap-4">
            <Link href="/terms" className="hover:text-[#7C9070]">이용약관</Link>
            <Link href="/" className="hover:text-[#7C9070]">메인으로</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
