# CIRCULAI Cloud Setup

Arsitektur utama aplikasi:

- Mobile app: Expo APK/AAB
- OTA JavaScript/assets update: EAS Update
- Database, Auth, Storage, dan Realtime: Supabase
- Payment backend: Supabase Edge Functions + Midtrans Snap
- `server/`: hanya fallback lokal untuk development, tidak dibutuhkan oleh APK produksi

## 1. Buat dan hubungkan project Supabase

1. Buat project baru di Supabase.
2. Di dashboard Supabase, buka **Authentication > Providers > Anonymous Sign-Ins** lalu aktifkan anonymous sign-ins. Saat ini app otomatis membuat sesi anonim; nanti sesi ini dapat di-upgrade ke email, OTP, atau OAuth.
3. Salin `.env.example` menjadi `.env`, lalu isi:

```env
EXPO_PUBLIC_DATA_BACKEND=supabase
EXPO_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

Publishable key boleh berada di app mobile. Jangan pernah memasukkan Supabase secret/service-role key atau Midtrans Server Key ke variabel `EXPO_PUBLIC_*`.
Client juga menerima alias `EXPO_PUBLIC_SUPABASE_KEY`, tetapi nama `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` lebih jelas dan direkomendasikan.

Tambahkan tiga nilai yang sama ke EAS Environment untuk `preview` dan `production` melalui dashboard Expo, atau CLI:

```bash
npx eas-cli env:create --name EXPO_PUBLIC_DATA_BACKEND --value supabase --environment preview --visibility plaintext
npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_URL --value https://PROJECT_REF.supabase.co --environment preview --visibility plaintext
npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value sb_publishable_xxx --environment preview --visibility plaintext

npx eas-cli env:create --name EXPO_PUBLIC_DATA_BACKEND --value supabase --environment production --visibility plaintext
npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_URL --value https://PROJECT_REF.supabase.co --environment production --visibility plaintext
npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value sb_publishable_xxx --environment production --visibility plaintext
```

Login dan link Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref PROJECT_REF
npm run supabase:push
```

Migration di `supabase/migrations/` akan membuat tabel, RLS, seed produk/tailor, bucket avatar dan bukti retur, serta mengaktifkan Realtime untuk order dan chat.

## 2. Deploy Midtrans Edge Functions

Gunakan **Midtrans Server Key**, bukan Client Key:

```bash
npx supabase secrets set MIDTRANS_SERVER_KEY=SB-Mid-server-xxx MIDTRANS_IS_PRODUCTION=false
npm run supabase:functions
```

Atur Payment Notification URL di dashboard Midtrans:

```text
https://PROJECT_REF.supabase.co/functions/v1/midtrans-webhook
```

Untuk production, ganti secret:

```bash
npx supabase secrets set MIDTRANS_SERVER_KEY=Mid-server-xxx MIDTRANS_IS_PRODUCTION=true
```

`create-midtrans-snap` memerlukan sesi Supabase user. `midtrans-webhook` tidak memakai JWT karena dipanggil server Midtrans, tetapi setiap notifikasi diverifikasi menggunakan `signature_key`.

## 3. Jalankan dan uji

```bash
npm install
npm run start:go
```

Pastikan laptop dan HP berada di Wi-Fi yang sama, lalu scan QR baru dari terminal.
Jika jaringan LAN memblokir koneksi ke Metro, gunakan:

```bash
npm run start:tunnel
```

Jangan membuka project lama dari riwayat Expo Go saat Metro sudah berhenti karena
Expo Go akan menampilkan `Failed to download remote update`.

Saat `.env` Supabase valid, app otomatis memakai Supabase. Tanpa konfigurasi tersebut, app dapat memakai backend Node lokal sebagai fallback:

```env
EXPO_PUBLIC_DATA_BACKEND=local
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:4000
```

## 4. Build APK/AAB

Login Expo lalu buat build:

```bash
npx eas-cli login
npx eas-cli build --profile preview --platform android
npx eas-cli build --profile production --platform android
```

- Profile `preview` menghasilkan APK internal.
- APK preview menonaktifkan pengecekan OTA otomatis saat startup agar tetap dapat terbuka ketika `u.expo.dev` tidak terjangkau.
- Profile `production` menghasilkan AAB untuk Play Store.
- APK/AAB produksi tidak membutuhkan laptop atau `npx expo start`.

## 5. Kirim OTA update

Uji update lebih dulu di channel preview:

```bash
npm run update:preview -- --message "Perbaikan UI checkout"
```

Setelah lolos pengujian:

```bash
npm run update:production -- --message "Rilis checkout terbaru"
```

EAS Update dapat memperbarui JavaScript, styling, dan assets pada build dengan runtime yang kompatibel. Perubahan native, upgrade Expo SDK, permission baru, atau dependency native baru tetap memerlukan build APK/AAB baru. Karena runtime memakai policy `appVersion`, naikkan `expo.version` sebelum membuat build native baru.

## 6. Checklist sebelum lomba/production

- Ganti anonymous auth dengan login email/OTP agar akun dapat dipulihkan di perangkat lain.
- Gunakan bucket bukti retur private dan signed URL untuk production.
- Pindahkan mutasi status order/tailor/admin ke Edge Functions agar client tidak dapat mengubah status sensitif secara langsung.
- Hitung total order dan biaya desain kustom dari sumber harga server-side sebelum membuat transaksi Midtrans; jangan mempercayai `rawPrice` atau `unit_price` dari client untuk production.
- Pisahkan role customer dan tailor, lalu batasi `sender` chat melalui RLS/Edge Function sebelum digunakan oleh pengguna nyata.
- Uji Midtrans Sandbox sampai webhook mengubah order menjadi `PAYMENT_CONFIRMED`.
- Build profile `preview`, uji OTA preview, lalu rilis ke channel `production`.

Referensi resmi:

- Supabase Expo React Native: https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native
- Supabase Auth dan RLS: https://supabase.com/docs/guides/auth
- Supabase Realtime: https://supabase.com/docs/guides/realtime
- Expo EAS Update deployment: https://docs.expo.dev/eas-update/deployment/
- Expo runtime versions: https://docs.expo.dev/eas-update/runtime-versions/
