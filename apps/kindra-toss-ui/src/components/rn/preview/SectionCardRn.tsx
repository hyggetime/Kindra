import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

export function SectionCardRn({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string
  title: string
  children: ReactNode
}) {
  return (
    <View style={styles.card}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  )
}

export function ProseRn({ children }: { children: string }) {
  return <Text style={styles.prose}>{children}</Text>
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8e4dc',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 20,
    shadowColor: '#373023',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#7c9070',
  },
  title: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700',
    color: '#2f3d2e',
  },
  body: {
    marginTop: 12,
  },
  prose: {
    fontSize: 14,
    lineHeight: 24,
    color: '#3d3d3d',
  },
})
