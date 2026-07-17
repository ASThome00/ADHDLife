import { ExpoConfig, ConfigContext } from 'expo/config'
import { readFileSync } from 'fs'
import { join } from 'path'

// Single source of truth for the app version is the repo-root VERSION file —
// the release workflow writes the resolved version there before `eas build`.
function repoVersion(): string {
  try {
    return readFileSync(join(__dirname, '..', '..', 'VERSION'), 'utf8').trim()
  } catch {
    return '0.0.0'
  }
}

// Android requires a monotonically increasing integer versionCode.
// Derived from semver so releases order correctly (assumes minor/patch < 100).
function androidVersionCode(version: string): number {
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number)
  return Math.max(1, major * 10000 + minor * 100 + patch)
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ADHD Life',
  slug: 'adhd-life',
  version: repoVersion(),
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic', // supports dark mode
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#eef2ec', // Quiet Garden --bg-page (sage)
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.asthome.adhdlife',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#eef2ec',
    },
    package: 'com.asthome.adhdlife',
    versionCode: androidVersionCode(repoVersion()),
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
})
