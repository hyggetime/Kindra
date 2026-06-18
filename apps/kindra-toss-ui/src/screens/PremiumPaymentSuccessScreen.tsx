import { useNavigation } from '@granite-js/react-native'
import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import {
  KINDRA_LIVE_STRUCTURED_REPORT_STORAGE_KEY,
  KINDRA_PREMIUM_INTAKE_STORAGE_KEY,
  type KindraPremiumIntakePayload,
  type KindraPremiumIntakePaymentBody,
} from '@/lib/kindraPremiumIntakeTypes'
import {
  postPremiumIntakeAfterPayment,
  runStructuredReportFromPremiumPayload,
} from '@/lib/kindraPremiumPipeline'
import { getPremiumSessionItem, setPremiumSessionItem } from '@/lib/premiumIntakeStorage'
import { readPremiumPaymentMeta } from '@/lib/tossInApp'

function readPayload(): KindraPremiumIntakePayload | null {
  const raw = getPremiumSessionItem(KINDRA_PREMIUM_INTAKE_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as KindraPremiumIntakePayload
  } catch {
    return null
  }
}

export function PremiumPaymentSuccessScreen() {
  const navigation = useNavigation()
  const [error, setError] = useState<string | null>(null)
  const [startAt] = useState(() => Date.now())

  useEffect(() => {
    const stored = readPremiumPaymentMeta()
    const paymentKey = stored?.paymentKey ?? ''
    const orderId = stored?.orderId ?? ''
    const amount = stored?.amount ?? 0

    if (!paymentKey || !orderId) {
      setError('결제 정보(paymentKey, orderId)를 찾을 수 없습니다.')
      return
    }

    const payload = readPayload()
    if (!payload) {
      setError('인테이크 데이터가 없습니다. 신청 화면에서 다시 결제를 시도해 주세요.')
      return
    }

    const body: KindraPremiumIntakePaymentBody = {
      payload,
      payment: { paymentKey, orderId, amount },
    }

    let cancelled = false
    ;(async () => {
      try {
        const serverReport = await postPremiumIntakeAfterPayment(body, { softFail: true })
        const report = serverReport ?? (await runStructuredReportFromPremiumPayload(payload))
        if (cancelled) return
        const minWaitMs = 90_000
        const elapsed = Date.now() - startAt
        if (elapsed < minWaitMs) {
          await new Promise<void>((resolve) => {
            setTimeout(resolve, minWaitMs - elapsed)
          })
        }
        if (cancelled) return
        setPremiumSessionItem(KINDRA_LIVE_STRUCTURED_REPORT_STORAGE_KEY, JSON.stringify(report))
        ;(navigation as { navigate: (name: string, params?: Record<string, string>) => void }).navigate(
          '/preview/structured-report',
          { live: '1' },
        )
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : '처리 중 오류가 났습니다.')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [startAt])

  if (error) {
    return (
      <View style={styles.root}>
        <Text style={styles.error}>{error}</Text>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color="#7c9070" />
      <Text style={styles.message}>결제가 확인되었습니다. 리포트를 준비하는 중이에요… (최대 약 90초)</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fdfbf9',
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    color: '#5c5c5c',
    textAlign: 'center',
  },
  error: {
    fontSize: 14,
    color: '#991b1b',
    textAlign: 'center',
  },
})
