import { Link } from 'react-router-dom'

const EFFECTIVE_DATE = '2025년 1월 1일'
const COMPANY = 'HYGGETIME'
const SERVICE = '킨드라(Kindra)'
const EMAIL = 'hygge.studio.dev@gmail.com'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-base font-bold text-[#3D3D3D]">{title}</h2>
      <div className="space-y-3 text-[0.9rem] leading-[1.95] text-[#5A5A5A]">{children}</div>
    </section>
  )
}

export function TermsOfServicePage() {
  return (
    <div className="min-h-svh bg-[#FDFBF9] text-[#4A4A4A]">
      {/* 헤더 */}
      <header className="border-b border-[#EDE8E0] bg-[#FDFBF9]/90 px-5 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/" className="text-lg font-semibold tracking-tight text-[#7C9070]">
            Kindra
          </Link>
          <Link to="/" className="text-xs text-[#8A8A8A] transition hover:text-[#7C9070]">
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
            이용약관
          </h1>
          <p className="mt-3 text-sm text-[#8A8A8A]">
            시행일: {EFFECTIVE_DATE} &nbsp;|&nbsp; 제공자: {COMPANY}
          </p>
        </div>

        <p className="text-[0.9rem] leading-[1.95] text-[#5A5A5A]">
          이 약관은 {COMPANY}(이하 '회사')이 제공하는 {SERVICE} 서비스(이하 '서비스')의
          이용 조건 및 절차, 회사와 이용자의 권리·의무 및 책임 사항을 규정합니다.
          서비스를 이용하면 이 약관에 동의하는 것으로 간주합니다.
        </p>

        <Section title="제1조 (목적)">
          <p>
            이 약관은 회사가 운영하는 {SERVICE} 서비스의 이용과 관련하여 회사와 이용자 간의
            권리, 의무 및 책임 사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </Section>

        <Section title="제2조 (정의)">
          <ul className="ml-4 list-disc space-y-2">
            <li><strong>서비스:</strong> 회사가 제공하는 아동 그림 심리 관찰 리포트 작성 서비스</li>
            <li><strong>이용자:</strong> 이 약관에 동의하고 서비스를 신청하거나 이용하는 자</li>
            <li><strong>리포트:</strong> 이용자가 제공한 아동 그림 이미지를 바탕으로 회사가 작성한 심리 관찰 문서</li>
            <li><strong>콘텐츠:</strong> 서비스 내 텍스트, 이미지, 디자인 등 회사가 제작한 모든 창작물</li>
          </ul>
        </Section>

        <Section title="제3조 (약관의 효력 및 변경)">
          <ul className="ml-4 list-disc space-y-2">
            <li>이 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 효력을 발생합니다.</li>
            <li>
              회사는 관련 법령을 위배하지 않는 범위에서 약관을 변경할 수 있으며,
              변경된 약관은 서비스 내 공지사항 게시 또는 이메일 통보를 통해 효력이 발생합니다.
            </li>
            <li>이용자가 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴를 요청할 수 있습니다.</li>
          </ul>
        </Section>

        <Section title="제4조 (서비스의 제공 및 변경)">
          <ul className="ml-4 list-disc space-y-2">
            <li>서비스는 아동 그림 이미지를 분석하여 심리 관찰 리포트를 제공하는 것을 주요 내용으로 합니다.</li>
            <li>
              회사는 서비스 내용, 품질, 제공 방식 등을 사전 공지 후 변경할 수 있습니다.
              단, 이용자에게 불리한 중대한 변경은 최소 7일 전 고지합니다.
            </li>
            <li>회사는 운영상·기술상 필요에 따라 서비스의 전부 또는 일부를 일시 중단하거나 종료할 수 있습니다.</li>
          </ul>
        </Section>

        <Section title="제5조 (서비스 이용 신청 및 승낙)">
          <ul className="ml-4 list-disc space-y-2">
            <li>이용자는 회사가 정한 신청 절차에 따라 서비스를 신청합니다.</li>
            <li>회사는 다음의 경우 이용 신청을 거절하거나 사후 취소할 수 있습니다.</li>
          </ul>
          <ul className="ml-8 mt-2 list-[circle] space-y-1 text-sm">
            <li>타인의 명의를 도용하거나 허위 정보를 제공한 경우</li>
            <li>이용 약관에 위반되는 목적으로 신청한 경우</li>
            <li>기타 회사가 정한 이용 기준을 충족하지 못한 경우</li>
          </ul>
        </Section>

        <Section title="제6조 (이용자의 의무)">
          <p>이용자는 서비스 이용 시 다음 행위를 하여서는 안 됩니다.</p>
          <ul className="ml-4 mt-2 list-disc space-y-2">
            <li>허위 정보 제공 및 타인의 정보 도용</li>
            <li>제3자의 저작권, 초상권, 개인정보 등 권리를 침해하는 이미지 업로드</li>
            <li>서비스 및 관련 시스템에 대한 해킹, 바이러스 유포 등 악의적 행위</li>
            <li>회사의 사전 서면 동의 없이 서비스를 상업적으로 이용하거나 복제·배포하는 행위</li>
            <li>관계 법령 및 이 약관을 위반하는 행위</li>
          </ul>
        </Section>

        <Section title="제7조 (저작권 및 지식재산권)">
          <ul className="ml-4 list-disc space-y-2">
            <li>
              서비스 내 모든 콘텐츠(텍스트, 디자인, 분석 방법론, 리포트 형식 등)의
              저작권은 {COMPANY}에 귀속됩니다.
            </li>
            <li>
              이용자가 제공한 그림 이미지의 저작권은 원 저작자(이용자 또는 아동)에게 있으며,
              회사는 리포트 작성 목적으로만 이를 이용합니다.
            </li>
            <li>
              회사가 작성한 리포트의 저작권은 회사에 있으나, 이용자는 개인적 목적으로
              자유롭게 열람·저장·공유할 수 있습니다.
            </li>
            <li>
              이용자는 서비스에서 얻은 리포트를 상업적 목적으로 사용하거나, 원출처 표시 없이
              재배포하여서는 안 됩니다.
            </li>
          </ul>
        </Section>

        <Section title="제8조 (서비스의 성격 및 면책)">
          <div className="rounded-2xl border border-[#E8E4DC] bg-[#F7F5F2] px-5 py-5">
            <p className="font-semibold text-[#3D3D3D]">중요한 안내</p>
            <ul className="ml-4 mt-3 list-disc space-y-2 text-sm">
              <li>
                킨드라의 리포트는 <strong>전문적인 심리 진단 또는 의료적 소견이 아닙니다.</strong>
                아동 발달 심리학의 그림 분석 기법을 참고한 관찰 기록이며, 참고 자료로만 활용하시기 바랍니다.
              </li>
              <li>
                리포트의 내용은 제공된 그림 이미지와 분석 시점을 기준으로 하며,
                아동의 심리 상태는 다양한 요인에 의해 변화할 수 있습니다.
              </li>
              <li>
                심리적 문제가 우려되는 경우, 반드시 <strong>공인된 전문 심리 상담사 또는 의료 전문가</strong>에게 상담하시기 바랍니다.
              </li>
            </ul>
          </div>
          <p className="mt-4">
            회사는 위 안내 사항에도 불구하고 이용자가 리포트를 전문 진단으로 오해하여 발생하는
            손해에 대해 책임을 지지 않습니다. 단, 회사의 고의 또는 중대한 과실로 인한
            손해에 대해서는 관련 법령에 따라 책임을 집니다.
          </p>
        </Section>

        <Section title="제9조 (개인정보 보호)">
          <p>
            회사는 이용자의 개인정보를 보호하기 위해 개인정보처리방침을 수립·운영합니다.
            자세한 내용은{' '}
            <Link to="/privacy" className="font-medium text-[#7C9070] underline hover:text-[#4F6048]">
              개인정보처리방침
            </Link>
            을 확인하시기 바랍니다.
          </p>
        </Section>

        <Section title="제10조 (분쟁 해결)">
          <ul className="ml-4 list-disc space-y-2">
            <li>
              서비스 이용 관련 분쟁 발생 시, 회사와 이용자는 우선 이메일({EMAIL})을 통해
              상호 협의로 해결하도록 노력합니다.
            </li>
            <li>
              협의가 이루어지지 않는 경우, 소비자기본법에 따른 소비자분쟁조정위원회의
              조정 또는 법원의 소송으로 해결합니다.
            </li>
            <li>소송 발생 시 관할 법원은 회사의 소재지를 관할하는 법원으로 합니다.</li>
          </ul>
        </Section>

        <Section title="제11조 (준거법)">
          <p>
            이 약관의 해석 및 회사와 이용자 간의 분쟁에 대해서는 대한민국 법령을 적용합니다.
          </p>
        </Section>

        <div className="mt-6 rounded-xl bg-[#F7F5F2] px-5 py-4 text-xs text-[#6B6B6B]">
          <p className="font-medium text-[#4A4A4A]">부칙</p>
          <p className="mt-1">이 약관은 {EFFECTIVE_DATE}부터 시행합니다.</p>
        </div>

        <div className="mt-14 border-t border-[#EDE8E0] pt-8 text-center text-xs text-[#8A8A8A]">
          <p>© {new Date().getFullYear()} {COMPANY}. All rights reserved.</p>
          <div className="mt-3 flex justify-center gap-4">
            <Link to="/privacy" className="hover:text-[#7C9070]">개인정보처리방침</Link>
            <Link to="/" className="hover:text-[#7C9070]">메인으로</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
