# CIRCULAI

CIRCULAI is a sustainable circular fashion marketplace and mobile ecosystem built with React Native (Expo) and a Supabase/Node.js backend. It enables users to purchase, resell, exchange, custom-tailor, and track digital product passports and sustainability metrics for eco-friendly garments.

---

## Features

- **Eco Marketplace & Catalog**: Browse sustainable garments, view eco-scores, fabric compositions, and digital product passports.
- **AI Stylist & Virtual Assistant**: Personalized fashion recommendations, outfit suggestions, and sustainability metrics.
- **Custom Design Studio**: Request bespoke tailoring or upcycled designs directly from local artisans and tailors.
- **Circular Economy (Exchange & Return)**: Manage product returns, exchange requests, and trade-in workflows for circular lifecycles.
- **Order Tracking & Management**: Real-time delivery status, payment processing via Midtrans, and complete order history.
- **Backend & Database Services**: Database management, authentication, Row-Level Security (RLS) policies, and Edge Functions for payment webhooks.

---

## Monorepo Structure

```
CIRCULAI/
├── src/                        # React Native (Expo) Mobile Application
│   ├── components/             # Reusable UI components
│   ├── config/                 # App and API configuration
│   ├── data/                   # Initial mock dataset and domain data
│   ├── navigation/             # Navigation stacks and bottom tab routers
│   ├── screens/                # Screen components (Home, Explore, Custom, Cart, etc.)
│   ├── services/               # API clients and Supabase integrations
│   ├── state/                  # Context API state management
│   ├── theme/                  # Color tokens, typography, and spacing metrics
│   └── utils/                  # Utility helper functions
├── server/                     # Backend API & Development Server
│   ├── data/                   # Data storage and seed files
│   ├── lib/                    # Domain logic and state persistence helpers
│   ├── index.js                # Express/Node HTTP API server
│   ├── README.md               # Backend API documentation
│   └── .env.example            # Environment variable template for server
├── supabase/                   # Supabase Infrastructure
│   ├── functions/              # Deno Edge Functions (Midtrans Snap & Webhook handlers)
│   ├── migrations/             # SQL Schema and RLS policy migrations
│   └── config.toml             # Supabase CLI project configuration
├── App.js                      # Mobile App entry point
├── app.config.js               # Dynamic Expo configuration
├── package.json                # Root package manifest and workspace scripts
├── tsconfig.json               # TypeScript configuration
└── CLOUD_SETUP.md              # Cloud deployment and setup guide
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo Go application on iOS/Android or an emulator

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/wannnn27/circulai.git
   cd circulai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## Running the Applications

### 1. Mobile Application (Expo)

Start the Expo development server:
```bash
npm start
```

For Expo Go over local network:
```bash
npm run start:go
```

For Web preview:
```bash
npm run web
```

### 2. Backend Development Server

Start the Node.js API server (default port 4000):
```bash
npm run server
```

### 3. Supabase Edge Functions & Database

Push local migrations to remote database:
```bash
npm run supabase:push
```

Deploy Edge Functions:
```bash
npm run supabase:functions
```

---

## Environment Configuration

Create a `.env` file in the project root based on `.env.example`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

For backend server environment settings, refer to `server/.env.example`.

---

## Architecture Overview

1. **Client Layer**: Built using React Native with Expo, utilizing Context API for global state management and custom modular design tokens.
2. **API & Services**: REST API client (`src/services/api.js`) and Supabase SDK client (`src/services/supabaseClient.js`) providing seamless fallback between local mock API and production Supabase backend.
3. **Payments**: Midtrans Snap integration for payment token creation and automated webhook handling via Supabase Edge Functions.

---

## License

This project is licensed under the MIT License.
