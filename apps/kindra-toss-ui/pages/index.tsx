import { createRoute, useNavigation } from '@granite-js/react-native'
import { Pressable, StyleSheet, Text } from 'react-native'

import { ScreenShell } from '@/components/rn/ScreenShell'

export const Route = createRoute('/' as never, {
  validateParams: (params) => params ?? {},
  component: HomeScreen,
})

function HomeScreen() {
  const navigation = useNavigation()

  return (
    <ScreenShell
      title="아이의 그림이 전하는 이야기"
      subtitle="그림 5장과 아이 정보를 입력하면 맞춤 구조화 리포트를 받을 수 있어요."
    >
      <Pressable
        style={styles.primaryBtn}
        onPress={() => (navigation as { navigate: (name: string) => void }).navigate('/intake')}
      >
        <Text style={styles.primaryBtnText}>진단 시작하기</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryBtn}
        onPress={() =>
          (navigation as { navigate: (name: string) => void }).navigate('/preview/structured-report')
        }
      >
        <Text style={styles.secondaryBtnText}>샘플 리포트 보기</Text>
      </Pressable>
    </ScreenShell>
  )
}

const styles = StyleSheet.create({
  primaryBtn: {
    marginTop: 24,
    borderRadius: 999,
    backgroundColor: '#2f4a2a',
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  secondaryBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '500', color: '#4d6b46', textDecorationLine: 'underline' },
})
