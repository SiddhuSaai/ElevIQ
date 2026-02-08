# ELEVIQ Quick Reference Guide

**Essential Commands & Information** 📱

---

## 🚀 Quick Start Commands

### Flutter (Android)
```bash
cd eleviq_flutter

# Install dependencies
flutter pub get

# Run on device/emulator
flutter run

# Build APK
flutter build apk --release

# Build App Bundle
flutter build appbundle --release

# Clean build
flutter clean && flutter pub get
```

### Next.js (Web)
```bash
cd eleviq_web

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Firebase
```bash
# Login
firebase login

# Deploy functions
firebase deploy --only functions

# Deploy hosting
firebase deploy --only hosting

# Deploy rules
firebase deploy --only firestore:rules

# View logs
firebase functions:log
```

---

## 📁 Project Structure

```
ElevIQ/
├── eleviq_flutter/        # Flutter Android app
│   ├── lib/
│   │   ├── features/      # Feature modules
│   │   ├── core/          # Shared utilities
│   │   └── main.dart
│   └── pubspec.yaml
│
├── eleviq_web/            # Next.js web app
│   ├── src/
│   │   ├── app/           # Pages (App Router)
│   │   ├── components/    # UI components
│   │   └── lib/           # Utilities
│   └── package.json
│
├── firebase/              # Firebase config
│   ├── functions/         # Cloud Functions
│   └── firestore.rules
│
└── docs/                  # Documentation
```

---

## 🔑 Environment Variables

### Flutter (.env)
```env
GEMINI_API_KEY=your_key
```

### Next.js (.env.local)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_GEMINI_API_KEY=
```

---

## 🎨 16 Core Features

| # | Feature | Priority |
|---|---------|----------|
| 1 | 🔐 Authentication | ✅ Done |
| 2 | 👤 User Profiles | High |
| 3 | 💰 Expense Tracking | High |
| 4 | 📊 Category Analysis | High |
| 5 | 📅 Monthly Analysis | Medium |
| 6 | 🥧 Visual Charts | Medium |
| 7 | 🤖 AI Chatbot | High |
| 8 | 🎯 Savings Tips | Medium |
| 9 | 📈 Income vs Expense | Medium |
| 10 | 📋 Monthly Summary | Medium |
| 11 | 🔔 Alerts | Low |
| 12 | 💬 Chat History | Low |
| 13 | 🧮 Calculators | Low |
| 14 | 🌐 Cross-Platform | ✅ Done |
| 15 | 🔐 Cloud Storage | ✅ Done |
| 16 | ⚖️ Ethical Design | ✅ Done |

---

## 🔗 Important URLs

| Service | URL |
|---------|-----|
| Firebase Console | https://console.firebase.google.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| Google AI Studio | https://aistudio.google.com |
| Flutter Docs | https://docs.flutter.dev |
| Next.js Docs | https://nextjs.org/docs |

---

## 🐛 Common Issues

### Flutter
```bash
# Gradle issues
cd android && ./gradlew clean && cd ..

# Pod issues (iOS)
cd ios && pod install && cd ..

# Dependencies conflict
flutter pub upgrade --major-versions
```

### Next.js
```bash
# Module not found
rm -rf node_modules && npm install

# Build errors
rm -rf .next && npm run build
```

### Firebase
```bash
# Permission denied
firebase logout && firebase login

# Functions deploy fail
cd functions && npm install && cd ..
```

---

## 📅 Development Timeline

| Week | Phase | Focus |
|------|-------|-------|
| 1-2 | Foundation | Setup, Auth ✅ |
| 3-5 | Core | Expenses, Profiles |
| 6-7 | Visualization | Charts, Dashboard |
| 8-10 | AI | Gemini, Chat |
| 11-12 | Advanced | Calculators, Alerts |
| 13-14 | Testing | Bug fixes, Polish |
| 15-16 | Deploy | Play Store, Web |

---

## ✅ Current Status

**Phase:** Core Features  
**Next Task:** Expense Tracking Module  
**Blockers:** None

---

**Last Updated:** February 2026
