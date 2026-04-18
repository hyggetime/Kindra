type Props = {
  text: string
  className?: string
}

/** `**강조**` 구간을 굵게 렌더링합니다. */
export function RichParagraph({ text, className }: Props) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
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
