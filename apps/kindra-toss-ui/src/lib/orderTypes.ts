export type MiniappOrderRow = {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | string
  email: string | null
  result: Record<string, unknown> | null
  error: string | null
  created_at?: string
}

export type AxisScores = {
  세밀_관찰력: number
  공간_구성력: number
  논리적_서사성: number
  소근육_정교성: number
  또래_상대_밀도: number
}
