import Link from 'next/link'

const EFFECTIVE_DATE = '2025년 1월 1일'
const COMPANY = 'HYGGETIME'
const EMAIL = 'hygge.studio.dev@gmail.com'
const SERVICE = '킨드라(Kindra)'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-base font-bold text-[#3D3D3D]">{title}</h2>
      <div className="space-y-3 text-[0.9rem] leading-[1.95] text-[#5A5A5A]">{children}</div>
    </section>
  )
}

function Table({ rows }: { rows: [string, string][] }) {
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
            ['수집 항목', '신청자 이름, 이메일 주소, 아이의 그림 이미지 파일, 아이의 나이, 아이의 성별'],
            ['수집 방법', 'Google 설문 폼(Google Forms)을 통한 직접 입력 및 파일 업로드'],
            ['필수·선택 여부', '이름, 이메일, 그림 이미지: 필수 / 아이 나이·성별: 선택'],
          ]} />
          <p className="mt-3 rounded-xl bg-[#F7F5F2] px-4 py-3 text-xs text-[#6B6B6B]">
            ※ 아이의 그림 이미지에는 아동의 개인정보가 포함될 수 있습니다.
            부모님(법정대리인)이 동의하신 범위 내에서만 처리하며, 분석 목적 외에 사용하지 않습니다.
          </p>
        </Section>

        <Section title="2. 개인정보의 수집 및 이용 목적">
          <Table rows={[
            ['리포트 작성', '제공된 그림 이미지를 분석하여 아동 그림 심리 관찰 리포트를 작성하고 신청자에게 전달'],
            ['서비스 품질 향상', '서비스 개선을 위한 내부 분석 (개인 식별 불가능한 형태로 활용)'],
            ['고객 응대', '리포트 전달 및 관련 문의 응답을 위한 이메일 연락'],
          ]} />
        </Section>

        <Section title="3. 개인정보의 보유 및 이용 기간">
          <p>
            회사는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
            단, 관련 법령에 따라 보존할 필요가 있는 경우에는 아래 기간 동안 보관합니다.
          </p>
          <Table rows={[
            ['리포트 제공 완료 후', '신청자 요청 시 즉시 삭제, 별도 요청 없을 시 서비스 제공일로부터 1년'],
            ['전자상거래 기록 (결제 도입 후)', '5년 (전자상거래 등에서의 소비자보호에 관한 법률)'],
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
          <p>서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 위탁하고 있습니다.</p>
          <Table rows={[
            ['수탁자', '위탁 업무 내용'],
            ['Google LLC', '설문 폼 운영 및 데이터 수집 (Google Forms / Google Drive)'],
            ['Anthropic / OpenAI (향후 적용)', 'AI 기반 그림 분석 처리 (적용 시 별도 고지)'],
          ]} />
          <p className="mt-2 text-xs text-[#8A8A8A]">
            ※ 위탁 계약 시 개인정보 보호 관련 법규 준수, 개인정보 보호를 위한 기술적·관리적 보호조치,
            재위탁 제한, 수탁자에 대한 관리·감독 및 손해배상 등을 계약서에 명시합니다.
          </p>
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
            현재 서비스는 필수적인 세션 쿠키 외에 별도의 추적 쿠키를 사용하지 않습니다.
            향후 분석 도구(Google Analytics 등) 도입 시 해당 내용을 방침에 추가하고 별도 고지합니다.
          </p>
        </Section>

        <Section title="11. 개인정보 보호 책임자">
          <Table rows={[
            ['책임자', COMPANY],
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

        <div className="mt-14 border-t border-[#EDE8E0] pt-8 text-center text-xs text-[#8A8A8A]">
          <p>© {new Date().getFullYear()} {COMPANY}. All rights reserved.</p>
          <div className="mt-3 flex justify-center gap-4">
            <Link href="/terms" className="hover:text-[#7C9070]">이용약관</Link>
            <Link href="/" className="hover:text-[#7C9070]">메인으로</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
