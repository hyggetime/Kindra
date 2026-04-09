import { type FormEvent, useState } from 'react'

const initial = {
  parentName: '',
  childName: '',
  birthDate: '',
  analysisPeriod: '',
  email: '',
  consentRequired: false,
  consentLaunch: false,
  consentLetter: false,
}

export function ReportRequestForm() {
  const [values, setValues] = useState(initial)
  const [sent, setSent] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!values.consentRequired) return
    setSent(true)
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-[#E8E4DC] bg-[#F7F5F2] px-8 py-12 text-center shadow-sm">
        <p className="text-lg font-semibold text-[#7C9070]">신청이 접수되었습니다</p>
        <p className="mt-3 text-sm leading-relaxed text-[#6B6B6B]">
          입력해 주신 이메일로 안내를 드릴 예정이에요. (데모 화면에서는 실제 발송되지 않습니다.)
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false)
            setValues(initial)
          }}
          className="mt-8 rounded-full border border-[#D4CFC4] bg-white px-6 py-2 text-sm font-medium text-[#4A4A4A] transition hover:bg-[#FDFBF9]"
        >
          다시 작성하기
        </button>
      </div>
    )
  }

  const inputClass =
    'w-full rounded-2xl border border-[#E0D9CF] bg-[#FDFBF9] px-4 py-3 text-sm text-[#4A4A4A] outline-none transition placeholder:text-[#A8A8A8] focus:border-[#7C9070] focus:bg-white focus:ring-2 focus:ring-[#7C9070]/20'

  const checkboxRow =
    'flex cursor-pointer gap-3 rounded-2xl border border-[#EDE8E0] bg-[#FAFAF8] p-4 text-left transition hover:border-[#C8C4BC] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#7C9070]/25'

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-xl space-y-6 rounded-[28px] border border-[#E8E4DC] bg-white p-8 shadow-[0_16px_40px_-28px_rgba(74,74,74,0.2)] sm:p-10"
      noValidate
    >
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#4A4A4A]">리포트 신청</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#6B6B6B]">
          부모님과 아이 정보, 희망 관찰 기간, 이메일을 남겨 주시면 리포트 안내를 드릴게요.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="rq-parent" className="text-sm font-medium text-[#4A4A4A]">
          부모님 성함 <span className="text-[#A45C40]">*</span>
        </label>
        <input
          id="rq-parent"
          name="parentName"
          type="text"
          required
          autoComplete="name"
          placeholder="홍길동"
          value={values.parentName}
          onChange={(e) => setValues((v) => ({ ...v, parentName: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="rq-child" className="text-sm font-medium text-[#4A4A4A]">
          아이 이름 <span className="text-[#A45C40]">*</span>
        </label>
        <input
          id="rq-child"
          name="childName"
          type="text"
          required
          placeholder="예: 민지"
          value={values.childName}
          onChange={(e) => setValues((v) => ({ ...v, childName: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="rq-birth" className="text-sm font-medium text-[#4A4A4A]">
          아이 생년월일 <span className="text-[#A45C40]">*</span>
        </label>
        <input
          id="rq-birth"
          name="birthDate"
          type="date"
          required
          value={values.birthDate}
          onChange={(e) => setValues((v) => ({ ...v, birthDate: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="rq-period" className="text-sm font-medium text-[#4A4A4A]">
          관찰 · 분석 희망 기간
        </label>
        <p className="text-xs text-[#8A8A8A]">
          그림을 모아 분석하고 싶은 기간을 적어 주세요. (선택)
        </p>
        <input
          id="rq-period"
          name="analysisPeriod"
          type="text"
          placeholder="예: 최근 3~4개월"
          value={values.analysisPeriod}
          onChange={(e) => setValues((v) => ({ ...v, analysisPeriod: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="rq-email" className="text-sm font-medium text-[#4A4A4A]">
          리포트 받을 이메일 주소 <span className="text-[#A45C40]">*</span>
        </label>
        <input
          id="rq-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div className="border-t border-[#EDE8E0] pt-2">
        <h3 className="mb-4 text-sm font-semibold text-[#4A4A4A]">동의</h3>
        <div className="space-y-3">
          <label className={checkboxRow}>
            <input
              type="checkbox"
              name="consentRequired"
              checked={values.consentRequired}
              onChange={(e) =>
                setValues((v) => ({ ...v, consentRequired: e.target.checked }))
              }
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#C4B8A8] text-[#7C9070] focus:ring-[#7C9070]"
              required
            />
            <span className="text-sm leading-relaxed text-[#4A4A4A]">
              <span className="mr-1.5 inline-block rounded bg-[#A45C40]/12 px-1.5 py-0.5 text-[11px] font-semibold text-[#8B4A32]">
                필수
              </span>
              개인정보 수집 및 리포트 생성을 위한 데이터 활용 동의
            </span>
          </label>

          <label className={checkboxRow}>
            <input
              type="checkbox"
              name="consentLaunch"
              checked={values.consentLaunch}
              onChange={(e) =>
                setValues((v) => ({ ...v, consentLaunch: e.target.checked }))
              }
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#C4B8A8] text-[#7C9070] focus:ring-[#7C9070]"
            />
            <span className="text-sm leading-relaxed text-[#4A4A4A]">
              <span className="mr-1.5 inline-block rounded bg-[#E8E4DC] px-1.5 py-0.5 text-[11px] font-medium text-[#6B6B6B]">
                선택
              </span>
              킨드라 정식 런칭 안내 및 사전 예약 혜택 알림 받기
            </span>
          </label>

          <label className={checkboxRow}>
            <input
              type="checkbox"
              name="consentLetter"
              checked={values.consentLetter}
              onChange={(e) =>
                setValues((v) => ({ ...v, consentLetter: e.target.checked }))
              }
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#C4B8A8] text-[#7C9070] focus:ring-[#7C9070]"
            />
            <span className="text-sm leading-relaxed text-[#4A4A4A]">
              <span className="mr-1.5 inline-block rounded bg-[#E8E4DC] px-1.5 py-0.5 text-[11px] font-medium text-[#6B6B6B]">
                선택
              </span>
              아이의 마음 성장을 돕는 &lsquo;킨드라 레터&rsquo; 수신 동의 (마케팅 활용)
            </span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-[#7C9070] py-3.5 text-sm font-semibold text-white shadow-[0_10px_28px_-12px_rgba(124,144,112,0.55)] transition hover:bg-[#687D5D]"
      >
        리포트 신청하기
      </button>

      <p className="text-center text-xs leading-relaxed text-[#9A9A9A]">
        필수 동의 항목에 동의하셔야 신청이 완료됩니다. 선택 항목은 동의하지 않아도 신청할 수 있어요.
      </p>
    </form>
  )
}
