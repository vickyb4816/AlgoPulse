# AlgoPulse – Android APK

Your Stitch design (8 screens) wrapped with Capacitor. GitHub Actions builds the APK for free.

## Get the APK
1. Create a new GitHub repo, upload ALL files of this folder (keep `.github/workflows/build-apk.yml`).
2. Open the **Actions** tab -> **Build Android APK** -> wait ~5-8 min (or click **Run workflow**).
3. Open the finished run -> **Artifacts** -> download **AlgoPulse-APK** (zip) -> unzip -> `AlgoPulse.apk`.
4. Copy to phone, allow "Install unknown apps", install.

## Notes
- Screens are in `www/`. Bottom tabs: Chart, Strategy, Auto Trade, Screener, Menu.
- Needs internet (Tailwind, fonts, icons load from CDN).
- This is a debug-signed APK (fine for installing on your own phone).
- Original screenshots + DESIGN.md are in `design/`.
