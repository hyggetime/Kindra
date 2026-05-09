'use client'

import imageCompression from 'browser-image-compression'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useMemo, useRef, useState } from 'react'
import { submitIntegratedIntake } from '@app/actions/intake-submit'
import { formatPriceWon, LIST_PRICE_WON } from '@lib/constants'
import { buildApplyPaymentPath } from '@lib/payment/parse-payment-page-params'
import { completedMonthsFromDaysSinceBirth, parseBirthDateIso } from '@lib/intake/age-months'
import {
  integratedIntakeInitialState,
  type IntegratedIntakeState,
} from '@lib/intake/form-state'
import { rotateImageFile } from '@/lib/intake/rotate-image-file'

import { ApplySubmitOverlay, type SubmitOverlayPhase } from './ApplySubmitOverlay'

const IMAGE_NAMES = ['image1', 'image2', 'image3', 'image4', 'image5'] as const

/** 가로·세로 중 긴 변 기준 (px) */
const INTAKE_IMAGE_MAX_EDGE_PX = 2048
/** JPEG 품질 0~1. 분석용 선 디테일 보존을 위해 0.8 이상 유지 */
const INTAKE_JPEG_QUALITY = 0.85

type Slot = { file: File; url: string }

async function compressDrawingForUpload(file: File, slotIndex: number): Promise<File> {
  const stem = file.name.replace(/\.[^.]+$/i, '') || `drawing-${slotIndex + 1}`
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: INTAKE_IMAGE_MAX_EDGE_PX,
    maxSizeMB: 4,
    useWebWorker: true,
    initialQuality: INTAKE_JPEG_QUALITY,
    fileType: 'image/jpeg',
  })
  if (compressed.type !== 'image/jpeg') {
    return compressed
  }
  return new File([compressed], `${stem}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  })
}

function ApplyIntegratedFormFields({
  onSuccess,
  variant = 'apply',
  onIntakeSuccess,
  onApplyPaymentRedirect,
  submitPriceHint,
}: {
  onSuccess: () => void
  variant?: 'apply' | 'intake'
  onIntakeSuccess?: (reportRowId?: string) => void
  /** `/apply` 전용: 전송 성공 시 결제 페이지로 이동 */
  onApplyPaymentRedirect?: (reportRowId?: string) => void
  submitPriceHint?: string | null
}) {
  const [state, formAction, pending] = useActionState<IntegratedIntakeState, FormData>(
    submitIntegratedIntake,
    integratedIntakeInitialState,
  )

  const [overlayPhase, setOverlayPhase] = useState<SubmitOverlayPhase>('submitting')
  const [overlayOpen, setOverlayOpen] = useState(false)
  const pendingRef = useRef(pending)
  pendingRef.current = pending
  const successEmittedRef = useRef(false)
  const doneTimerRef = useRef<number | null>(null)

  const [consentAcknowledged, setConsentAcknowledged] = useState(false)
  const [consentDeniedFlash, setConsentDeniedFlash] = useState(false)
  const [slots, setSlots] = useState<(Slot | null)[]>([null, null, null, null, null])
  const [imageBusyIndex, setImageBusyIndex] = useState<number | null>(null)
  const [birthDate, setBirthDate] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const birthPreview = useMemo(() => {
    const p = parseBirthDateIso(birthDate)
    if (!p) return { months: null as number | null }
    const today0 = new Date()
    today0.setHours(0, 0, 0, 0)
    return {
      months: completedMonthsFromDaysSinceBirth(p.y, p.m, p.d, today0),
    }
  }, [birthDate])

  useEffect(() => {
    return () => {
      slots.forEach((s) => {
        if (s?.url) URL.revokeObjectURL(s.url)
      })
    }
  }, [slots])

  useEffect(() => {
    if (pending) {
      successEmittedRef.current = false
      setOverlayOpen(true)
      setOverlayPhase('submitting')
      const timer = window.setTimeout(() => {
        if (pendingRef.current) setOverlayPhase('uploading')
      }, 2200)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [pending])

  useEffect(() => {
    if (pending) return
    if (!state.ok || !state.message) {
      successEmittedRef.current = false
      if (doneTimerRef.current) {
        window.clearTimeout(doneTimerRef.current)
        doneTimerRef.current = null
      }
      setOverlayOpen(false)
      return
    }
    if (successEmittedRef.current) return
    successEmittedRef.current = true
    setOverlayPhase('done')
    setOverlayOpen(true)
    doneTimerRef.current = window.setTimeout(() => {
      doneTimerRef.current = null
      setOverlayOpen(false)
      if (variant === 'intake' && onIntakeSuccess && state.reportRowId) {
        onIntakeSuccess(state.reportRowId)
      } else if (variant === 'apply' && onApplyPaymentRedirect && state.reportRowId) {
        onApplyPaymentRedirect(state.reportRowId)
      } else {
        onSuccess()
      }
    }, 1000)
    return () => {
      if (doneTimerRef.current) {
        window.clearTimeout(doneTimerRef.current)
        doneTimerRef.current = null
      }
    }
  }, [pending, state.ok, state.message, state.reportRowId, variant, onIntakeSuccess, onApplyPaymentRedirect, onSuccess])

  async function onPick(index: number, input: HTMLInputElement) {
    const file = input.files?.[0] ?? null
    if (!file) {
      setSlots((prev) => {
        const next = [...prev] as (Slot | null)[]
        if (next[index]?.url) URL.revokeObjectURL(next[index]!.url)
        next[index] = null
        return next
      })
      return
    }
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
      input.value = ''
      return
    }

    setImageBusyIndex(index)
    try {
      let out: File
      try {
        out = await compressDrawingForUpload(file, index)
      } catch {
        out = file
      }
      const dt = new DataTransfer()
      dt.items.add(out)
      input.files = dt.files

      setSlots((prev) => {
        const next = [...prev] as (Slot | null)[]
        if (next[index]?.url) URL.revokeObjectURL(next[index]!.url)
        next[index] = { file: out, url: URL.createObjectURL(out) }
        return next
      })
    } finally {
      setImageBusyIndex(null)
    }
  }

  async function onRotateSlot(index: number, degreesClockwise: 90 | -90) {
    const slot = slots[index]
    if (!slot?.file || pending) return
    const input = formRef.current?.querySelector(
      `input[name="${IMAGE_NAMES[index]}"]`,
    ) as HTMLInputElement | null
    if (!input) return

    setImageBusyIndex(index)
    try {
      let out: File
      try {
        out = await rotateImageFile(slot.file, degreesClockwise)
      } catch {
        return
      }
      try {
        out = await compressDrawingForUpload(out, index)
      } catch {
        /* 회전만 반영 */
      }
      const dt = new DataTransfer()
      dt.items.add(out)
      input.files = dt.files

      setSlots((prev) => {
        const next = [...prev] as (Slot | null)[]
        if (next[index]?.url) URL.revokeObjectURL(next[index]!.url)
        next[index] = { file: out, url: URL.createObjectURL(out) }
        return next
      })
    } finally {
      setImageBusyIndex(null)
    }
  }

  return (
    <>
    {consentDeniedFlash ? (
      <div
        role="status"
        className="pointer-events-none fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 rounded-full bg-[#2F2F2F]/95 px-5 py-2.5 text-sm font-medium text-white shadow-lg"
      >
        동의가 필요합니다
      </div>
    ) : null}
    <form
      ref={formRef}
      action={formAction}
      onSubmit={(e) => {
        if (!consentAcknowledged) {
          e.preventDefault()
          setConsentDeniedFlash(true)
          window.setTimeout(() => setConsentDeniedFlash(false), 3200)
        }
      }}
      className="space-y-8"
    >
      <div className="px-0.5 pt-2 sm:px-1">
        <p className="text-[13px] leading-[1.75] text-[#4A4A4A] sm:text-sm sm:leading-[1.8]">
          아이가 그린 소중한 세계를 킨드라에 맡겨주셔서 감사해요. 보내주신 그림과 정보는 아이를 위한 리포트 작성과 킨드라의
          다채로운 서비스(굿즈, 혜택 안내 등)를 준비하는 데에만 소중하고 안전하게 사용됩니다. 킨드라가 그림 속에 담긴 아이의
          마음을 조심스럽게 읽고 정성을 다해 돌려드릴게요.
        </p>

        <label className="mt-7 flex cursor-pointer items-start gap-3 sm:mt-8">
          <input
            type="checkbox"
            name="allInOneConsent"
            checked={consentAcknowledged}
            onChange={(e) => setConsentAcknowledged(e.target.checked)}
            disabled={pending}
            className="mt-1 h-4 w-4 shrink-0 rounded border-[#D4DED0] accent-[#7C9070] disabled:opacity-60"
          />
          <span className="text-[13px] leading-[1.65] text-[#3D3D3D] sm:text-sm">
            [필수] 리포트 분석 및 맞춤형 서비스(굿즈, 이벤트 알림 등) 제공을 위한 개인정보 및 콘텐츠 활용에 전체 동의합니다.
          </span>
        </label>

        <p className="mt-5 text-[11px] leading-relaxed text-[#9A9A9A] sm:text-xs">
          (그림을 받은 후 24시간 이내 발송을 목표로 해요. 꼼꼼히 살펴보느라 조금 늦어질 수 있어요.)
        </p>

        <hr className="mt-10 border-0 border-t border-[#E8E4DC] sm:mt-12" />
      </div>

      <div className="space-y-5">
        <h2 className="text-sm font-semibold text-[#4A4A4A]">신청 정보</h2>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[#5A5A5A]">
            이메일 <span className="text-[#B85C5C]">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            disabled={pending}
            className="w-full rounded-xl border border-[#E8E4DC] bg-[#FDFBF9] px-4 py-3 text-sm text-[#3D3D3D] outline-none ring-[#7C9070]/25 focus:border-[#7C9070]/50 focus:ring-2 disabled:opacity-60"
            placeholder="신청·안내에 사용할 이메일"
          />
          <p className="mt-1.5 text-[11px] leading-relaxed text-[#9A9A9A]">
            같은 이메일로 다시 신청해도 <span className="font-medium text-[#7A7A7A]">새 접수 건</span>으로 추가돼요. 이전에 받은
            리포트 링크는 그대로 유지됩니다.
          </p>
        </div>

        <div>
          <label htmlFor="parentName" className="mb-1.5 block text-xs font-medium text-[#5A5A5A]">
            보호자 이름 또는 호칭 <span className="text-[#B85C5C]">*</span>
          </label>
          <input
            id="parentName"
            name="parentName"
            type="text"
            required
            maxLength={20}
            autoComplete="name"
            disabled={pending}
            className="w-full rounded-xl border border-[#E8E4DC] bg-[#FDFBF9] px-4 py-3 text-sm text-[#3D3D3D] outline-none ring-[#7C9070]/25 focus:border-[#7C9070]/50 focus:ring-2 disabled:opacity-60"
            placeholder="예: 엄마, 아빠"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
          <div>
            <label htmlFor="childDisplayName" className="mb-1.5 block text-xs font-medium text-[#5A5A5A]">
              아이 이름 또는 호칭 <span className="text-[#B85C5C]">*</span>
            </label>
            <input
              id="childDisplayName"
              name="childDisplayName"
              type="text"
              required
              maxLength={20}
              autoComplete="nickname"
              disabled={pending}
              className="w-full rounded-xl border border-[#E8E4DC] bg-[#FDFBF9] px-4 py-3 text-sm text-[#3D3D3D] outline-none ring-[#7C9070]/25 focus:border-[#7C9070]/50 focus:ring-2 disabled:opacity-60"
              placeholder="예: 우리 아이, 민수"
            />
          </div>
          <fieldset disabled={pending} className="min-w-0">
            <legend className="mb-1.5 text-xs font-medium text-[#5A5A5A]">
              아이 성별 <span className="text-[#B85C5C]">*</span>
            </legend>
            <p className="mb-2 text-[11px] leading-relaxed text-[#9A9A9A]">
              성별에 따른 발달 특성을 고려하여 더욱 정교하고 다정한 리포트를 작성하는 데 활용됩니다.
            </p>
            <div className="flex flex-wrap items-center gap-6 rounded-xl border border-[#E8E4DC] bg-[#FDFBF9] px-4 py-3">
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg py-1 pl-0.5 pr-2 hover:bg-[#F4F7F2]">
                <input
                  id="childGender-male"
                  type="radio"
                  name="childGender"
                  value="male"
                  required
                  className="h-4 w-4 shrink-0 cursor-pointer accent-[#7C9070] ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C9070]/40"
                />
                <span className="text-sm text-[#3D3D3D]">남아</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg py-1 pl-0.5 pr-2 hover:bg-[#F4F7F2]">
                <input
                  id="childGender-female"
                  type="radio"
                  name="childGender"
                  value="female"
                  className="h-4 w-4 shrink-0 cursor-pointer accent-[#7C9070] ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C9070]/40"
                />
                <span className="text-sm text-[#3D3D3D]">여아</span>
              </label>
            </div>
          </fieldset>
        </div>

        <div>
          <label htmlFor="birthDate" className="mb-1.5 block text-xs font-medium text-[#5A5A5A]">
            아이 생년월일 <span className="text-[#B85C5C]">*</span>
          </label>
          <p className="mb-2 text-[11px] leading-relaxed text-[#9A9A9A]">
            아래 생후 개월 수 안내는 <span className="font-medium text-[#6B7568]">신청일 기준</span>이에요. 각 그림 칸에
            언제·무엇을 그렸는지 적어 주시면 리포트 맥락에 반영돼요.
          </p>
          <div className="flex flex-wrap items-end gap-3 sm:gap-4">
            <div className="min-w-[12rem] flex-1">
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                required
                value={birthDate}
                min="1995-01-01"
                disabled={pending}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-xl border border-[#E8E4DC] bg-[#FDFBF9] px-3 py-2.5 text-sm text-[#3D3D3D] outline-none ring-[#7C9070]/25 focus:border-[#7C9070]/50 focus:ring-2 disabled:opacity-60"
              />
            </div>
            <div className="flex min-h-[42px] min-w-[12rem] flex-1 flex-col justify-center rounded-xl border border-[#E8F0E4] bg-[#F4F7F2] px-4 py-2.5 sm:min-w-[11rem]">
              <p className="text-sm font-semibold tabular-nums text-[#4F6048]">
                {birthPreview.months === null ? (
                  <span className="font-normal text-[#9A9A9A]">신청일 기준 — 생후 --개월</span>
                ) : (
                  <>신청일 기준 — 생후 {String(birthPreview.months).padStart(2, '0')}개월</>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium text-[#5A5A5A]">지금 아이의 신체 (선택)</p>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-[#4A4A4A]">
            <input
              type="checkbox"
              name="bodyMetricsUnknown"
              value="on"
              disabled={pending}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[#D4DED0] accent-[#7C9070]"
            />
            <span>지금 키·몸무게를 모릅니다 (입력 안 함)</span>
          </label>
          <p className="text-[11px] leading-relaxed text-[#7A8A72] sm:text-xs">
            성장기 아이들의 개인차를 고려하여 넓은 범위를 수용하고 있습니다.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="childHeightCm" className="mb-1.5 block text-xs font-medium text-[#5A5A5A]">
                현재 키 (cm)
              </label>
              <input
                id="childHeightCm"
                name="childHeightCm"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                disabled={pending}
                placeholder="예: 108.5"
                className="w-full rounded-xl border border-[#E8E4DC] bg-[#FDFBF9] px-4 py-3 text-sm text-[#3D3D3D] outline-none ring-[#7C9070]/25 focus:border-[#7C9070]/50 focus:ring-2 disabled:opacity-60"
              />
              <p className="mt-1.5 text-[11px] leading-relaxed text-[#9A9A9A]">
                40~170cm 범위만 분석에 반영돼요. 모르실 경우 위의 &apos;모릅니다&apos; 항목을 선택해 주세요.
              </p>
            </div>
            <div>
              <label htmlFor="childWeightKg" className="mb-1.5 block text-xs font-medium text-[#5A5A5A]">
                현재 몸무게 (kg)
              </label>
              <input
                id="childWeightKg"
                name="childWeightKg"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                disabled={pending}
                placeholder="예: 18.2"
                className="w-full rounded-xl border border-[#E8E4DC] bg-[#FDFBF9] px-4 py-3 text-sm text-[#3D3D3D] outline-none ring-[#7C9070]/25 focus:border-[#7C9070]/50 focus:ring-2 disabled:opacity-60"
              />
              <p className="mt-1.5 text-[11px] leading-relaxed text-[#9A9A9A]">
                3~90kg 범위만 분석에 반영돼요.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#E8EDE6] bg-[#F7FAF6]/90 px-3.5 py-3 sm:px-4 sm:py-3.5">
        <p className="text-[11px] leading-relaxed text-[#6B7568] sm:text-xs">
          킨드라는 HTP·LMT 등 검증된 심리 분석 이론을 토대로 아이의 그림을 살펴봐요. 한국 아동 그림
          56,000건(심허브)과 국민건강보험공단 영유아 성장도표도 함께 활용해요.{' '}
          <Link
            href="/tools"
            className="font-medium text-[#5A6F52] underline decoration-[#7C9070]/30 underline-offset-[3px] transition hover:text-[#4A5C44] hover:decoration-[#7C9070]/55"
          >
            분석 원리 보기
          </Link>
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-[#4A4A4A]">아이의 그림을 올려 주세요</h2>
        <p className="text-[11px] leading-relaxed text-[#8A8A8A]">그림 5칸 · JPEG / PNG / WebP, 각 4MB 이하</p>
        <p className="text-xs leading-relaxed text-[#6B6B6B]">
          그림 1장만 필수예요. 여러 장을 올려 주실수록 아이의 이야기를 더 풍부하게 읽을 수 있어요. 방향이 어긋난 그림은
          각 칸의 회전 버튼으로 맞춰 주세요.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          {IMAGE_NAMES.map((name, i) => (
            <div key={name} className="rounded-xl border border-[#E8E4DC] bg-[#FDFBF9] p-4">
              <label className="block text-xs font-medium text-[#5A5A5A]">
                그림 {i + 1}
                {i === 0 ? <span className="text-[#B85C5C]">*</span> : null}
              </label>
              <input
                name={name}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required={i === 0}
                disabled={pending || imageBusyIndex === i}
                onChange={(e) => {
                  void onPick(i, e.currentTarget)
                }}
                className="mt-2 block w-full text-[11px] file:mr-2 file:rounded-lg file:border-0 file:bg-[#E8F0E4] file:px-2 file:py-1 file:text-xs file:font-medium file:text-[#4F6048]"
              />
              {imageBusyIndex === i ? (
                <p className="mt-2 text-[11px] text-[#7A8A72]">이미지 압축·리사이즈 중…</p>
              ) : null}
              {slots[i] ? (
                <div className="mt-3 space-y-2">
                  <div className="relative h-44 overflow-hidden rounded-lg border border-[#EDE8E0] bg-[#F7F5F2]">
                    <Image
                      src={slots[i]!.url}
                      alt={`선택한 그림 ${i + 1} 미리보기`}
                      fill
                      unoptimized
                      className="object-contain p-1"
                      sizes="(max-width: 640px) 50vw, 20rem"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={pending || imageBusyIndex === i}
                      onClick={() => {
                        void onRotateSlot(i, -90)
                      }}
                      className="rounded-lg border border-[#E0E6DC] bg-white px-2.5 py-1 text-[11px] font-medium text-[#4F6048] transition hover:border-[#7C9070]/45 hover:bg-[#F4F7F2] disabled:opacity-50"
                    >
                      ↺ 왼쪽 90°
                    </button>
                    <button
                      type="button"
                      disabled={pending || imageBusyIndex === i}
                      onClick={() => {
                        void onRotateSlot(i, 90)
                      }}
                      className="rounded-lg border border-[#E0E6DC] bg-white px-2.5 py-1 text-[11px] font-medium text-[#4F6048] transition hover:border-[#7C9070]/45 hover:bg-[#F4F7F2] disabled:opacity-50"
                    >
                      오른쪽 90° ↻
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-center text-[11px] text-[#B0B0B0]">미리보기 없음</p>
              )}
              <div className="mt-4 space-y-3 rounded-lg border border-[#EDE8E0] bg-white/90 p-3">
                <p className="text-[11px] font-medium text-[#6B6B6B]">이 그림에 대해 알려주실 내용이 있나요?</p>
                <div>
                  <label htmlFor={`drawingTimeNote-${i}`} className="mb-1 block text-[11px] text-[#6B6B6B]">
                    언제 그렸나요?
                  </label>
                  <input
                    id={`drawingTimeNote-${i}`}
                    name={`drawingTimeNote${i + 1}`}
                    type="text"
                    maxLength={120}
                    disabled={pending}
                    placeholder="3개월 전"
                    autoComplete="off"
                    className="w-full rounded-lg border border-[#E8E4DC] bg-[#FDFBF9] px-3 py-2 text-xs text-[#3D3D3D] outline-none placeholder:text-[#B8B8B8] ring-[#7C9070]/20 focus:border-[#7C9070]/45 focus:ring-1 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label htmlFor={`drawingWhatNote-${i}`} className="mb-1 block text-[11px] text-[#6B6B6B]">
                    무엇을 그렸나요?
                  </label>
                  <textarea
                    id={`drawingWhatNote-${i}`}
                    name={`drawingWhatNote${i + 1}`}
                    rows={3}
                    maxLength={500}
                    disabled={pending}
                    placeholder="동생 생일파티에요. 가족여행이에요. 길어도 돼요."
                    className="w-full resize-y rounded-lg border border-[#E8E4DC] bg-[#FDFBF9] px-3 py-2 text-xs text-[#3D3D3D] outline-none placeholder:text-[#B8B8B8] ring-[#7C9070]/20 focus:border-[#7C9070]/45 focus:ring-1 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label htmlFor="childNote" className="mb-1.5 block text-xs font-medium text-[#5A5A5A]">
            아이에 대해 알려주실 내용 <span className="font-normal text-[#9A9A9A]">(부모의 한마디, 선택)</span>
          </label>
          <textarea
            id="childNote"
            name="childNote"
            rows={5}
            maxLength={500}
            disabled={pending}
            className="w-full resize-y rounded-xl border border-[#E8E4DC] bg-[#FDFBF9] px-4 py-3 text-sm text-[#3D3D3D] outline-none ring-[#7C9070]/25 focus:border-[#7C9070]/50 focus:ring-2 disabled:opacity-60"
            placeholder="평소 아이를 두고 느끼는 점, 요즘 변화 등 자유롭게 적어 주세요. (선택)"
          />
        </div>

        <div className="space-y-5 rounded-xl border border-[#E8E4DC] bg-[#FDFBF9] px-4 py-5 sm:px-6 sm:py-6">
          <fieldset disabled={pending} className="min-w-0 border-0 p-0">
            <legend className="text-xs font-semibold text-[#4A4A4A]">
              서비스 이용료에 대한 설문조사 <span className="text-[#B85C5C]">*</span>
            </legend>
            <p className="mt-2 text-[12px] leading-relaxed text-[#5A5A5A] sm:text-sm">
              킨드라 그림 분석 서비스의 이용료는 {formatPriceWon(LIST_PRICE_WON)}입니다. 이 가격이 적당하다고 생각하십니까?
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#3D3D3D]">
                <input
                  type="radio"
                  name="pricingIntent"
                  value="yes"
                  required
                  className="h-4 w-4 shrink-0 accent-[#7C9070]"
                />
                예
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#3D3D3D]">
                <input
                  type="radio"
                  name="pricingIntent"
                  value="no_expensive"
                  className="h-4 w-4 shrink-0 accent-[#7C9070]"
                />
                아니오 (비싸요)
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#3D3D3D]">
                <input
                  type="radio"
                  name="pricingIntent"
                  value="no_uninterested"
                  className="h-4 w-4 shrink-0 accent-[#7C9070]"
                />
                아니오 (관심없음)
              </label>
            </div>
          </fieldset>

          <p className="border-t border-[#EDE8E0] pt-5 text-center text-sm font-medium leading-relaxed text-[#5A6F52]">
            우리 아이의 소중한 그림을 킨드라에 맡겨주셔서 감사합니다.
          </p>
        </div>
      </div>

      {submitPriceHint ? (
        <p className="text-center text-sm font-medium text-[#4F6048]">{submitPriceHint}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending || imageBusyIndex !== null || !consentAcknowledged}
        className="w-full rounded-full bg-[#7C9070] py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(124,144,112,0.55)] transition hover:bg-[#687D5D] disabled:opacity-60"
      >
        {pending ? '전송 중…' : '신청서와 그림 전송하기'}
      </button>

      {!state.ok && state.message ? (
        <p role="status" className="text-center text-sm text-[#B85C5C]">
          {state.message}
        </p>
      ) : null}
    </form>
    {overlayOpen ? <ApplySubmitOverlay key={overlayPhase} phase={overlayPhase} /> : null}
    </>
  )
}

export type ApplyIntegratedFormProps = {
  variant?: 'apply' | 'intake'
  onIntakeSuccess?: (reportRowId?: string) => void
  submitPriceHint?: string | null
}

export function ApplyIntegratedForm(props: ApplyIntegratedFormProps = {}) {
  const { variant = 'apply', onIntakeSuccess, submitPriceHint } = props
  const router = useRouter()

  if (variant === 'intake') {
    return (
      <ApplyIntegratedFormFields
        variant="intake"
        onSuccess={() => {}}
        onIntakeSuccess={onIntakeSuccess}
        submitPriceHint={submitPriceHint ?? null}
      />
    )
  }

  return (
    <ApplyIntegratedFormFields
      variant="apply"
      onSuccess={() => {}}
      onApplyPaymentRedirect={(reportRowId) => {
        router.push(buildApplyPaymentPath(reportRowId ?? null))
      }}
      submitPriceHint={submitPriceHint ?? null}
    />
  )
}
