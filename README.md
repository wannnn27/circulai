# CIRCULAI 🌿👗

**CIRCULAI** is a sustainable circular fashion marketplace and mobile ecosystem built with React Native (Expo) and Supabase backend. It empowers users to buy, sell, exchange, custom-tailor, and track the digital passport / sustainability metrics of eco-friendly garments.

---

## ✨ Features

- **🛍️ Eco Marketplace & Catalog**: Explore sustainable garments, check eco-scores, fabric compositions, and digital product passports.
- **✨ AI Stylist & Virtual Assistant**: Personalized fashion recommendations, outfit suggestions, and sustainability tips.
- **🎨 Custom Design Studio & Customization**: Request bespoke tailoring or upcycled designs directly with local tailors.
- **🔄 Circular Economy (Exchange & Return)**: Easy product returns, exchange requests, and trade-in workflows for circular lifecycle.
- **📍 Order Tracking & History**: Live delivery tracking status, payment confirmation via Midtrans, and history.
- **⚡ Supabase Backend Integration**: Real-time database, Authentication, RLS policies, and Edge Functions for payment webhooks.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Expo CLI (`npm i -g expo-cli`)
- Expo Go app (on iOS / Android device or simulator)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/wannnn27/circulai.git
cd circulai

# Install dependencies
npm install
```

### 3. Running the App
```bash
# Start Expo development server
npx expo start
```

---

## 🛠️ Project Structure

```
CIRCULAI/
├── src/
│   ├── components/     # Reusable UI components
│   ├── config/         # App & Supabase configurations
│   ├── data/           # Mock data and initial state
│   ├── navigation/     # React Navigation stacks & tabs
│   ├── screens/        # Screen components (Home, Explore, Custom, Cart, etc.)
│   ├── services/       # API services & Supabase integration
│   ├── state/          # Context API state management
│   ├── theme/          # Color tokens, typography, and spacing
│   └── utils/          # Utility helper functions
├── server/             # Express mock server / seed scripts
├── supabase/           # Migrations, Edge Functions & RLS setup
└── App.js              # Entry point
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
