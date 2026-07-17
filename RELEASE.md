# Release — ADHD Life

Automated build & release via GitHub Actions. Version increments automatically.

## Quick Release

```bash
# Auto-increment patch version
pnpm release

# Or specify exact version
pnpm release --version=1.0.0
```

The script will:
1. Read `VERSION` file (currently `0.0.1`)
2. Auto-increment patch version or use your override
3. Trigger build workflow for all platforms
4. Create GitHub Release with all artifacts
5. Update `VERSION` file for next time

---

## Version Management

**Current:** See `VERSION` file in repo root

**Auto-increment examples:**
```
0.0.1 → 0.0.2 (patch)
0.0.2 → 0.0.3 (patch)
1.2.5 → 1.2.6 (patch)
```

**Manual override:**
```bash
pnpm release --version=1.0.0    # Jump to 1.0.0
pnpm release --version=2.0.0    # Jump to 2.0.0
```

---

## How It Works

**Local side:**
```bash
pnpm release
```
↓ reads VERSION → increments patch → triggers workflow

**GitHub Actions side:**
- macOS runner: builds the desktop app (universal .dmg)
- Windows runner: builds the desktop app (-setup.exe)
- Ubuntu runner: builds the Android .apk directly on the runner
  (`expo prebuild` + Gradle, signed with our own keystore — no third-party
  build service; skipped with a warning until the signing secrets are set,
  see "Mobile setup" below)
- Final step: creates release with all artifacts

iOS is not built by the pipeline yet — planned as phase 2 (xcodebuild on the
macOS runner + TestFlight upload, using Apple Developer certificates stored
as GitHub secrets).

**Result:**
- Release page: `https://github.com/ASThome00/adhd-life/releases/tag/v0.0.2`
- Artifacts: DMG, EXE, APK
- `VERSION` file auto-updated to `0.0.3`

---

## Prerequisites

1. **gh CLI** installed & authenticated
   ```bash
   # Install
   brew install gh    # macOS
   winget install github-cli  # Windows
   
   # Authenticate
   gh auth login
   ```

2. **Mobile setup** (one-time, required before the Android job produces builds —
   until then the job skips itself with a warning and desktop releases work normally):

   1. Generate a release signing keystore (`keytool` ships with any JDK — on
      Windows, Android Studio's JBR works too). Pick one password and answer the
      identity prompts however you like:
      ```bash
      keytool -genkeypair -v -keystore adhd-life-release.keystore \
        -alias adhd-life -keyalg RSA -keysize 2048 -validity 10000
      ```
   2. Base64-encode it for GitHub (PowerShell):
      ```powershell
      [Convert]::ToBase64String([IO.File]::ReadAllBytes("adhd-life-release.keystore")) | Set-Clipboard
      ```
   3. Add four GitHub secrets (repo Settings → Secrets and variables → Actions):
      | Secret | Value |
      |---|---|
      | `ANDROID_KEYSTORE_BASE64` | the base64 string from step 2 |
      | `ANDROID_KEYSTORE_PASSWORD` | the keystore password |
      | `ANDROID_KEY_ALIAS` | `adhd-life` |
      | `ANDROID_KEY_PASSWORD` | the key password (same as keystore password unless you set one) |

   ⚠️ **Back up the keystore file + password** (password manager). Android only
   installs updates signed with the same key — if the keystore is lost, the app
   must be uninstalled/reinstalled on every phone (local data lost). Do NOT
   commit the keystore to the repo.

   The app version comes from the repo-root `VERSION` file (read by
   `app.config.ts`, which also derives the Android `versionCode` from it).
   Nothing to bump by hand.

---

## Version Format

Must be semantic: `MAJOR.MINOR.PATCH`

Valid:
- `1.0.0`
- `2.1.5`
- `0.1.0`

Invalid:
- `1.0` ❌
- `v1.0.0` ❌ (don't include 'v')
- `alpha` ❌

---

## Monitoring

Once you run the command:
1. GitHub Actions workflow starts automatically
2. Monitor at: https://github.com/ASThome00/adhd-life/actions
3. Three build jobs run in parallel
4. When done, release is created at: `https://github.com/ASThome00/adhd-life/releases/tag/v{version}`

Takes ~15-20 minutes total.

---

## Download Artifacts

### macOS
```
https://github.com/ASThome00/adhd-life/releases/download/v1.0.0/adhd-life_1.0.0_universal.dmg
```

### Windows
```
https://github.com/ASThome00/adhd-life/releases/download/v1.0.0/adhd-life_1.0.0_x64.exe
```

### Android
```
https://github.com/ASThome00/adhd-life/releases/download/v1.0.0/ADHD-Life_1.0.0_android.apk
```
Install by opening the .apk on the phone (allow "install from unknown sources"
the first time). Updates install over the top — data is kept.

### iOS
Not in the pipeline yet (phase 2: xcodebuild + TestFlight).

---

## Manual Trigger (GitHub UI)

Don't have `pnpm` or `gh`? Trigger from GitHub:

1. Go to Actions tab
2. Click "Build & Release" workflow
3. Click "Run workflow"
4. Enter version
5. Click "Run"

---

## Troubleshooting

**"gh command not found"**
- Install: `brew install gh` (macOS) or https://cli.github.com

**"Not authenticated to GitHub"**
- Run: `gh auth login`
- Select "HTTPS" when prompted

**Android job skipped with a warning**
- The four `ANDROID_*` signing secrets aren't set — see "Mobile setup" above

**Workflow fails on the Android build**
- Check the Gradle/apksigner output in the job log
- `apksigner` errors usually mean a wrong `ANDROID_KEYSTORE_PASSWORD`,
  `ANDROID_KEY_ALIAS`, or `ANDROID_KEY_PASSWORD`

---

## Version History

Track releases at: https://github.com/ASThome00/adhd-life/releases

Each release includes:
- DMG (macOS)
- EXE (Windows)
- APK (Android, once the signing secrets are configured)
