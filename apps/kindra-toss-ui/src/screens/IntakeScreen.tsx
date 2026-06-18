import { useNavigation } from '@granite-js/react-native'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'

import { getKindraApiBaseUrl } from '@/lib/kindraApiEndpoints'
import { submitPremiumIntakeForReport } from '@/lib/kindraPremiumPipeline'
import {
  bindKindraPremiumIntakePayload,
  createDefaultPremiumGalleryUrls,
  type KindraChildGender,
  type KindraPremiumIntakePayload,
} from '@/lib/kindraPremiumIntakeTypes'

function emptyPayload(): KindraPremiumIntakePayload {
  return {
    childName: '',
    childAgeLabel: '',
    childGender: 'unspecified',
    imageUrls: createDefaultPremiumGalleryUrls(getKindraApiBaseUrl()),
    parentMemo: '',
    guardianEmail: '',
    marketingOptIn: false,
  }
}

const GENDER_OPTIONS: { value: KindraChildGender; label: string }[] = [
  { value: 'unspecified', label: '선택 안 함' },
  { value: 'female', label: '여아' },
  { value: 'male', label: '남아' },
]

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>
}

function CheckRow({
  checked,
  onToggle,
  children,
}: {
  checked: boolean
  onToggle: (v: boolean) => void
  children: string
}) {
  return (
    <Pressable style={styles.checkRow} onPress={() => onToggle(!checked)} accessibilityRole="checkbox">
      <Switch value={checked} onValueChange={onToggle} trackColor={{ true: '#7c9070' }} />
      <Text style={styles.checkText}>{children}</Text>
    </Pressable>
  )
}

/** 웹 `PremiumIntakeAndPayStep` 대응 — 제출 시 리포트 API 파이프라인 (결제 단계 제외) */
export function IntakeScreen() {
  const navigation = useNavigation()
  const [p, setP] = useState<KindraPremiumIntakePayload>(emptyPayload)
  const [terms, setTerms] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const setUrl = useCallback((index: number, value: string) => {
    setP((prev) => {
      const next = [...prev.imageUrls] as [string, string, string, string, string]
      next[index] = value
      return { ...prev, imageUrls: next }
    })
  }, [])

  const canSubmit =
    p.childName.trim().length > 0 &&
    p.childAgeLabel.trim().length > 0 &&
    Boolean(p.guardianEmail?.trim()) &&
    terms &&
    p.imageUrls.every((u) => u.trim().length > 0)

  const handleSubmit = async () => {
    if (!canSubmit || busy) return
    setErr(null)
    setBusy(true)
    try {
      const payload = bindKindraPremiumIntakePayload({
        childName: p.childName,
        childAgeLabel: p.childAgeLabel,
        childGender: p.childGender,
        imageUrls: p.imageUrls,
        parentMemo: p.parentMemo,
        guardianEmail: p.guardianEmail,
        marketingOptIn: p.marketingOptIn,
      })
      await submitPremiumIntakeForReport(payload)
      ;(navigation as { navigate: (name: string, params?: Record<string, string>) => void }).navigate(
        '/preview/structured-report',
        { live: '1' },
      )
    } catch (e) {
      setErr(e instanceof Error ? e.message : '제출 중 오류가 발생했습니다.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={64}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>프리미엄 5장 · 인테이크</Text>
          <Text style={styles.lead}>
            아이 정보와 그림 URL 5개를 입력한 뒤 제출하면 구조화 리포트를 생성합니다.
          </Text>

          <FieldLabel>아이 이름</FieldLabel>
          <TextInput
            value={p.childName}
            onChangeText={(childName) => setP({ ...p, childName })}
            style={styles.input}
            placeholder="아이 이름"
            placeholderTextColor="#9a9a9a"
          />

          <FieldLabel>나이 (표기)</FieldLabel>
          <TextInput
            value={p.childAgeLabel}
            onChangeText={(childAgeLabel) => setP({ ...p, childAgeLabel })}
            style={styles.input}
            placeholder="예: 만 5세 3개월"
            placeholderTextColor="#9a9a9a"
          />

          <FieldLabel>성별</FieldLabel>
          <View style={styles.genderRow}>
            {GENDER_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.genderChip, p.childGender === opt.value && styles.genderChipActive]}
                onPress={() => setP({ ...p, childGender: opt.value })}
              >
                <Text style={[styles.genderChipText, p.childGender === opt.value && styles.genderChipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <FieldLabel>그림 URL (5장)</FieldLabel>
          {p.imageUrls.map((url, i) => (
            <View key={i} style={styles.urlBlock}>
              <Text style={styles.urlIndex}>{i + 1}번</Text>
              <TextInput
                value={url}
                onChangeText={(v) => setUrl(i, v)}
                style={[styles.input, styles.urlInput]}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          ))}
          <Pressable
            onPress={() => setP({ ...p, imageUrls: createDefaultPremiumGalleryUrls(getKindraApiBaseUrl()) })}
          >
            <Text style={styles.link}>샘플 갤러리 URL로 다시 채우기</Text>
          </Pressable>

          <FieldLabel>부모 메모</FieldLabel>
          <TextInput
            value={p.parentMemo}
            onChangeText={(parentMemo) => setP({ ...p, parentMemo })}
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <FieldLabel>보호자 이메일</FieldLabel>
          <TextInput
            value={p.guardianEmail ?? ''}
            onChangeText={(guardianEmail) => setP({ ...p, guardianEmail })}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <CheckRow checked={p.marketingOptIn ?? false} onToggle={(v) => setP({ ...p, marketingOptIn: v })}>
            (선택) 이벤트·혜택 안내 수신
          </CheckRow>
          <CheckRow checked={terms} onToggle={setTerms}>
            (필수) 리포트 생성·개인정보 처리에 동의합니다.
          </CheckRow>

          {err ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{err}</Text>
            </View>
          ) : null}

          <Pressable
            style={[styles.submitBtn, (!canSubmit || busy) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || busy}
          >
            {busy ? (
              <View style={styles.submitInner}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.submitText}>리포트 생성 중… (최대 수 분)</Text>
              </View>
            ) : (
              <Text style={styles.submitText}>제출하고 리포트 보기</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.secondaryLink}
            onPress={() =>
              (navigation as { navigate: (name: string) => void }).navigate('/preview/structured-report')
            }
          >
            <Text style={styles.link}>샘플 리포트만 보기</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fbf9f5' },
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8e4dc',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
  },
  title: { fontSize: 16, fontWeight: '600', color: '#3d3d3d' },
  lead: { marginTop: 8, fontSize: 14, lineHeight: 22, color: '#6b6b6b' },
  label: { marginTop: 20, marginBottom: 8, fontSize: 14, fontWeight: '500', color: '#4a4a4a' },
  input: {
    borderWidth: 1,
    borderColor: '#e4ddd3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2a2a2a',
    backgroundColor: '#fff',
  },
  urlBlock: { marginBottom: 10 },
  urlIndex: { fontSize: 11, color: '#6b6b6b', marginBottom: 4 },
  urlInput: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11 },
  textArea: { minHeight: 88 },
  genderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  genderChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e4ddd3',
    backgroundColor: '#fff',
  },
  genderChipActive: { borderColor: '#7c9070', backgroundColor: 'rgba(124, 144, 112, 0.12)' },
  genderChipText: { fontSize: 13, color: '#4a4a4a' },
  genderChipTextActive: { color: '#4d6b46', fontWeight: '600' },
  link: { marginTop: 8, fontSize: 12, fontWeight: '500', color: '#4d6b46', textDecorationLine: 'underline' },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 16 },
  checkText: { flex: 1, fontSize: 14, lineHeight: 20, color: '#4a4a4a' },
  errorBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  errorText: { fontSize: 14, color: '#991b1b' },
  submitBtn: {
    marginTop: 24,
    borderRadius: 999,
    backgroundColor: '#2f4a2a',
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  submitText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  secondaryLink: { marginTop: 20, alignItems: 'center' },
})
