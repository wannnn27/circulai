# CIRCULAI Backend

Backend MVP ini memakai Node HTTP bawaan, jadi tidak perlu install dependency tambahan.
Data disimpan lokal di `server/data/store.json` dan otomatis dibuat dari seed saat server pertama kali jalan.

## Menjalankan

```bash
npm run server
```

Default URL:

```text
http://localhost:4000
```

Jalankan Expo di terminal lain:

```bash
npx expo start --host lan
```

Untuk Android emulator, frontend otomatis memakai:

```text
http://10.0.2.2:4000
```

Untuk HP fisik, salin `.env.example` di root menjadi `.env`, lalu isi IP laptop:

```text
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:4000
```

Untuk reset data demo:

```bash
curl -X POST http://localhost:4000/api/dev/reset
```

## Endpoint Utama

- `GET /api/health`
- `GET /api/bootstrap`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/tailors`
- `GET /api/profile`
- `PATCH /api/profile`
- `GET /api/addresses`
- `POST /api/addresses`
- `PATCH /api/addresses/:id`
- `DELETE /api/addresses/:id`
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:cartItemId`
- `DELETE /api/cart/items/:cartItemId`
- `DELETE /api/cart`
- `GET /api/orders`
- `POST /api/orders`
- `GET /api/orders/:orderId`
- `PATCH /api/orders/:orderId/status`
- `POST /api/orders/:orderId/returns`
- `GET /api/returns`
- `GET /api/orders/:orderId/passports`
- `GET /api/passports/:passportId`
- `GET /api/conversations/:tailorName`
- `POST /api/conversations/:tailorName/messages`
- `POST /api/payments/midtrans/snap`
- `POST /api/payments/midtrans/webhook`

## Contoh Checkout

Tambah item:

```bash
curl -X POST http://localhost:4000/api/cart/items \
  -H "Content-Type: application/json" \
  -d "{\"productId\":1,\"quantity\":1}"
```

Buat order:

```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d "{\"addressId\":\"ADDR-001\",\"paymentMethodId\":\"BANK_TRANSFER\"}"
```

Update status:

```bash
curl -X PATCH http://localhost:4000/api/orders/ORD-003/status \
  -H "Content-Type: application/json" \
  -d "{\"nextStatus\":\"PAYMENT_CONFIRMED\",\"actor\":\"payment_gateway\"}"
```

## Midtrans

Endpoint Midtrans sudah disiapkan, tapi membutuhkan environment variable:

```bash
MIDTRANS_SERVER_KEY=SB-Mid-server-...
MIDTRANS_IS_PRODUCTION=false
```

Jangan pernah taruh Server Key Midtrans di app Expo. App cukup memanggil backend, lalu backend membuat Snap transaction dan mengembalikan `redirectUrl`.

Untuk production, webhook Midtrans wajib memverifikasi signature key sebelum update status order.
MVP ini sengaja belum mengaktifkan verifikasi signature supaya alur sandbox lebih mudah diuji saat pengembangan.
