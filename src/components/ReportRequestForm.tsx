import { type FormEvent, useState } from 'react'

const initial = {
  email: '',
  childName: '',
  birthMonth: '',
  analysisPeriod: '',
}

export function ReportRequestForm() {
  const [values, setValues] = useState(initial)
  const [sent, setSent] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
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

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-xl space-y-6 rounded-[28px] border border-[#E8E4DC] bg-white p-8 shadow-[0_16px_40px_-28px_rgba(74,74,74,0.2)] sm:p-10"
      noValidate
    >
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#4A4A4A]">리포트 신청</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#6B6B6B]">
          이메일과 아이 정보를 남겨 주시면 맞춤 리포트 안내를 드릴게요.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="rq-email" className="text-sm font-medium text-[#4A4A4A]">
          이메일 <span className="text-[#A45C40]">*</span>
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
          className="w-full rounded-2xl border border-[#E0D9CF] bg-[#FDFBF9] px-4 py-3 text-sm text-[#4A4A4A] outline-none ring-0 transition placeholder:text-[#A8A8A8] focus:border-[#7C9070] focus:bg-white focus:ring-2 focus:ring-[#7C9070]/20"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="rq-child" className="text-sm font-medium text-[#4A4A4A]">
          아이 이름 또는 호칭 <span className="text-[#A45C40]">*</span>
        </label>
        <input
          id="rq-child"
          name="childName"
          type="text"
          required
          placeholder="예: 우리 아이, OO이"
          value={values.childName}
          onChange={(e) => setValues((v) => ({ ...v, childName: e.target.value }))}
          className="w-full rounded-2xl border border-[#E0D9CF] bg-[#FDFBF9] px-4 py-3 text-sm text-[#4A4A4A] outline-none transition placeholder:text-[#A8A8A8] focus:border-[#7C9070] focus:bg-white focus:ring-2 focus:ring-[#7C9070]/20"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="rq-birth" className="text-sm font-medium text-[#4A4A4A]">
          생년월
        </label>
        <input
          id="rq-birth"
          name="birthMonth"
          type="month"
          value={values.birthMonth}
          onChange={(e) => setValues((v) => ({ ...v, birthMonth: e.target.value }))}
          className="w-full rounded-2xl border border-[#E0D9CF] bg-[#FDFBF9] px-4 py-3 text-sm text-[#4A4A4A] outline-none transition focus:border-[#7C9070] focus:bg-white focus:ring-2 focus:ring-[#7C9070]/20"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="rq-period" className="text-sm font-medium text-[#4A4A4A]">
          관찰 · 분석 희망 기간
        </label>
        <input
          id="rq-period"
          name="analysisPeriod"
          type="text"
          placeholder="예: 최근 3~4개월"
          value={values.analysisPeriod}
          onChange={(e) => setValues((v) => ({ ...v, analysisPeriod: e.target.value }))}
          className="w-full rounded-2xl border border-[#E0D9CF] bg-[#FDFBF9] px-4 py-3 text-sm text-[#4A4A4A] outline-none transition placeholder:text-[#A8A8A8] focus:border-[#7C9070] focus:bg-white focus:ring-2 focus:ring-[#7C9070]/20"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-[#7C9070] py-3.5 text-sm font-semibold text-white shadow-[0_10px_28px_-12px_rgba(124,144,112,0.55)] transition hover:bg-[#687D5D]"
      >
        리포트 신청하기
      </button>

      <p className="text-center text-xs leading-relaxed text-[#9A9A9A]">
        제출하신 정보는 서비스 안내 목적으로만 사용됩니다.
      </p>
    </form>
  )
}
