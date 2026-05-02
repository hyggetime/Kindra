type Props = {
  text: string
  className?: string
}

/** `**강조**` 구간을 굵게 렌더링합니다. 짝이 맞지 않은 `**` 는 제거해 화면에 남기지 않습니다. */
export function RichParagraph({ text, className }: Props) {
  let normalized = text
  const boldCount = (normalized.match(/\*\*/g) ?? []).length
  if (boldCount % 2 !== 0) {
    normalized = normalized.replace(/\*\*/g, '')
  }

  const parts = normalized.split(/(\*\*[^*]+\*\*)/g)
  return (
    <p className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const inner = part.slice(2, -2)
          return (
            <strong key={i} className="font-semibold text-[#3D3D3D]">
              {inner}
            </strong>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </p>
  )
}
