/** Queue long Korean text as chained utterances so browsers do not truncate TTS. */
export function speakKoreanSequentially(
  parts: string[],
  options?: { rate?: number; onComplete?: () => void },
) {
  const cleaned = parts.map((p) => p.trim()).filter(Boolean)
  window.speechSynthesis.cancel()

  let index = 0
  const rate = options?.rate ?? 1

  const speakNext = () => {
    if (index >= cleaned.length) {
      options?.onComplete?.()
      return
    }
    const u = new SpeechSynthesisUtterance(cleaned[index])
    u.lang = 'ko-KR'
    u.rate = rate
    u.onend = () => {
      index += 1
      speakNext()
    }
    u.onerror = () => {
      index += 1
      speakNext()
    }
    window.speechSynthesis.speak(u)
  }

  speakNext()
}

export function buildReportSpeechText(data: {
  child_info: { name: string; birth_month: string; analysis_period: string }
  sections: Array<{
    category: string
    score: number
    title: string
    content: string
    evidence: string
    tip: string
  }>
  mina_insight: string
}): string[] {
  const { child_info, sections, mina_insight } = data
  const birth = formatBirthMonth(child_info.birth_month)

  const intro = [
    `리포트를 읽어 드립니다.`,
    `아이 이름은 ${child_info.name}, 생년월은 ${birth}, 분석 기간은 ${child_info.analysis_period}입니다.`,
  ]

  const blocks: string[] = [...intro]

  sections.forEach((sec, i) => {
    blocks.push(
      `섹션 ${i + 1}. ${sec.category}. 점수 ${sec.score}점.`,
      sec.title,
      sec.content,
      `관찰 근거입니다. ${sec.evidence}`,
      `육아 팁입니다. ${sec.tip}`,
    )
  })

  blocks.push(`미나 인사이트입니다. ${mina_insight}`)
  return blocks
}

function formatBirthMonth(ym: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(ym)
  if (!m) return ym
  return `${m[1]}년 ${Number(m[2])}월생`
}
