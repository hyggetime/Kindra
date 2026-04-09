import { useCallback, useId, useState } from 'react'

const SLOT_COUNT = 10

type Slot = {
  file: File | null
  preview: string | null
}

function emptySlots(): Slot[] {
  return Array.from({ length: SLOT_COUNT }, () => ({ file: null, preview: null }))
}

export function UploadZone() {
  const inputId = useId()
  const [slots, setSlots] = useState<Slot[]>(emptySlots)
  const [dragOver, setDragOver] = useState<number | null>(null)

  const assignFiles = useCallback(
    (files: FileList | File[], startIndex = 0) => {
      const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (list.length === 0) return

      setSlots((prev) => {
        const next = prev.map((s) => ({ ...s }))
        let i = startIndex
        for (const file of list) {
          while (i < SLOT_COUNT && next[i].file) i += 1
          if (i >= SLOT_COUNT) break
          const url = URL.createObjectURL(file)
          next[i] = { file, preview: url }
          i += 1
        }
        return next
      })
    },
    [],
  )

  const clearSlot = useCallback((index: number) => {
    setSlots((prev) => {
      const next = [...prev]
      const old = next[index].preview
      if (old) URL.revokeObjectURL(old)
      next[index] = { file: null, preview: null }
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setSlots((prev) => {
      prev.forEach((s) => {
        if (s.preview) URL.revokeObjectURL(s.preview)
      })
      return emptySlots()
    })
  }, [])

  const count = slots.filter((s) => s.file).length

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#4A4A4A]">그림 업로드</h2>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            최대 {SLOT_COUNT}장까지 추가할 수 있어요. JPG, PNG, WebP
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={inputId}
            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#7C9070] bg-white px-4 py-2 text-sm font-medium text-[#7C9070] transition hover:bg-[#7C9070]/10"
          >
            사진 선택
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.length) assignFiles(e.target.files, 0)
              e.target.value = ''
            }}
          />
          {count > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full px-4 py-2 text-sm text-[#A45C40] underline-offset-4 hover:underline"
            >
              모두 지우기
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
        {slots.map((slot, index) => (
          <div
            key={index}
            className={`relative aspect-square overflow-hidden rounded-2xl border-2 border-dashed transition ${
              dragOver === index
                ? 'border-[#7C9070] bg-[#7C9070]/10'
                : 'border-[#D9D4CC] bg-white/80'
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(index)
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(null)
              if (e.dataTransfer.files?.length) assignFiles(e.dataTransfer.files, index)
            }}
          >
            {slot.preview ? (
              <>
                <img
                  src={slot.preview}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => clearSlot(index)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60"
                  aria-label={`${index + 1}번 이미지 삭제`}
                >
                  ×
                </button>
                <span className="absolute bottom-2 left-2 rounded-full bg-white/85 px-2 py-0.5 text-xs font-medium text-[#4A4A4A] shadow-sm">
                  {index + 1}
                </span>
              </>
            ) : (
              <label
                htmlFor={`${inputId}-${index}`}
                className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 p-2 text-center"
              >
                <span className="text-2xl text-[#C8A47E]/90">+</span>
                <span className="text-xs text-[#8A8A8A]">{index + 1}</span>
                <input
                  id={`${inputId}-${index}`}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.files?.length) assignFiles(e.target.files, index)
                    e.target.value = ''
                  }}
                />
              </label>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-sm text-[#6B6B6B]">
        {count === 0
          ? '아직 올린 그림이 없어요. 드래그 앤 드롭도 가능해요.'
          : `${count}장이 준비되었어요.`}
      </p>
    </div>
  )
}
