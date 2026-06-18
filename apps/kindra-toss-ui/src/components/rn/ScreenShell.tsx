import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

export function ScreenShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children?: ReactNode
}) {
  return (
    <View style={styles.root}>
      <Text style={styles.kicker}>KINDRA</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: '#fdfbf9',
  },
  kicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2.8,
    color: '#7c9070',
  },
  title: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '700',
    color: '#2a3428',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#5c5c5c',
  },
})
