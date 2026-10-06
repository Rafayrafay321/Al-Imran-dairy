# Al-Imran Dairy handover

## Android app architecture

The Android app is a Capacitor wrapper around the live application at
`https://alimrandai.netlify.app`. It requires an internet connection. Deploying
an update to Netlify updates the app immediately without reinstalling the APK.

Set this Netlify environment variable for production deployments:

```text
NEXT_PUBLIC_APP_URL=https://alimrandai.netlify.app
```

After changing native plugins or `capacitor.config.ts`, run:

```powershell
npx cap sync android
```

## Building the Android APK

Install Android Studio with its bundled JDK and Android SDK, then run:

```powershell
npx cap open android
```

For a test APK, use **Build > Build Bundle(s) / APK(s) > Build APK(s)** in
Android Studio. The output is:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

For the client release, use **Build > Generate Signed App Bundle or APK > APK**.
Create a private signing key only once, if one does not already exist:

```powershell
keytool -genkeypair -v -keystore al-imran-dairy.keystore -alias dairy -keyalg RSA -keysize 2048 -validity 10000
```

Never commit the keystore or its passwords. Back both up in a password manager
and a protected cloud folder. Losing the key prevents future upgrades over the
installed app. The signed output is normally:

```text
android/app/build/outputs/apk/release/app-release.apk
```

## Installing the app on a new phone

1. Send the signed release APK to the phone through WhatsApp or copy it into Files.
2. Open **Settings > Security > Install unknown apps**.
3. Select **WhatsApp** or **Files**, depending on where the APK will be opened.
4. Enable **Allow from this source**.
5. Open `app-release.apk`, tap **Install**, and then open **Al-Imran Dairy**.
6. On the login screen, select **Remember me** before signing in so the session
   cookie can persist after closing and reopening the app.

## Real-device acceptance checklist

- [ ] Login remains active after the app is closed and reopened.
- [ ] Generating an invoice and tapping Share opens Android's native share sheet.
- [ ] Selecting WhatsApp sends the PDF successfully into a chat.
- [ ] A balance reminder opens WhatsApp rather than navigating inside the app.
- [ ] Android Back navigates through the app's browser history before exiting.
- [ ] The status bar is blue (`#2563EB`) with readable white icons.

The PDF is written only to the Capacitor cache directory before sharing, so
modern Android versions do not require broad storage access. Legacy storage
permissions remain limited by the manifest for compatibility with older phones.
