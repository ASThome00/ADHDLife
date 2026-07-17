// Temporary stand-in until the real screens land (Sessions 9–10).
// Exists so the tab routes resolve and release builds produce a launchable app.
import { View, Text, StyleSheet } from 'react-native'

export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>This screen is on its way.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ec',
    gap: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1d2620',
  },
  subtitle: {
    fontSize: 13,
    color: '#5b6a5f',
  },
})
