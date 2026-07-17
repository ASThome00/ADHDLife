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
- Ubuntu runner: builds the Android .apk via EAS Build
  (skipped with a warning until EAS is configured — see "Mobile setup" below)
- Final step: creates release with all artifacts

iOS is not built by the pipeline yet — planned as phase 2 (EAS build + TestFlight
submit, requires Apple Developer credentials wired into EAS).

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

   1. Create/log in to an Expo account, then link the project:
      ```bash
      npm i -g eas-cli
      eas login
      cd apps/mobile && eas init
      ```
      Because the app uses a dynamic config (`app.config.ts`), `eas init` will print
      a project ID instead of writing it. Add it to `app.config.ts` and commit:
      ```ts
      owner: '<your-expo-username>',
      extra: { eas: { projectId: '<id-from-eas-init>' } },
      ```
   2. Create an access token at https://expo.dev → Account settings → Access tokens,
      and add it as a GitHub secret: repo Settings → Secrets and variables → Actions
      → New secret, name `EAS_TOKEN`.

   The app version comes from the repo-root `VERSION` file (read by `app.config.ts`);
   Android `versionCode` is managed remotely by EAS (`appVersionSource: remote` +
   `autoIncrement`). Nothing to bump by hand.

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
Not in the pipeline yet (phase 2: EAS build + TestFlight).

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

**"EAS_TOKEN not found"**
- Add to repo: Settings → Secrets and variables → Actions
- Create new secret: Name=`EAS_TOKEN`, Value=your EAS token from https://expo.dev

**Workflow fails on mobile builds**
- Check EAS_TOKEN is set correctly
- Verify EAS account is active
- Check EAS logs at https://expo.dev/accounts/your-account/builds

---

## Version History

Track releases at: https://github.com/ASThome00/adhd-life/releases

Each release includes:
- DMG (macOS)
- EXE (Windows)
- APK (Android, once EAS is configured)
