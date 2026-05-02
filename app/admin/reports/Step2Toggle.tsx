'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import { setStep2EnabledFlag } from './actions'

type Props = {
  adminPw: string
  initialEnabled: boolean
}

export function Step2Toggle({ adminPw, initialEnabled }: Props) {
  const router = useRouter()
  const [on, setOn] = useState(initialEnabled)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setOn(initialEnabled)
  }, [initialEnabled])

  return (
    <div className="mb-8 flex flex-col gap-3 rounded-xl border border-[#E8E4DC] bg-[#FDFBF9] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div>
        <p className="text-sm font-semibold text-[#3D3D3D]">Step 2 활성화</p>
        <p className="mt-1 text-xs leading-relaxed text-[#6B6B6B]">
          꺼 두면 1단계(무료 UI)로 고정되고, 켜면 신청 수에 따라 무료·할인·정상가가 적용됩니다.
        </p>
      </div>
      <label className="flex cursor-pointer items-center gap-2.5 self-start sm:self-center">
        <input
          type="checkbox"
          checked={on}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.checked
            setOn(next)
            startTransition(() => {
              void setStep2EnabledFlag(adminPw, next).then((r) => {
                if (!r.ok) {
                  setOn(!next)
                  return
                }
                router.refresh()
              })
            })
          }}
          className="h-4 w-4 rounded border-[#D4DED0] accent-[#7C9070]"
        />
        <span className="text-sm font-medium text-[#4A4A4A]">{on ? '켜짐' : '꺼짐'}</span>
      </label>
    </div>
  )
}
