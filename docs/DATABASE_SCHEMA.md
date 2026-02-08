# ELEVIQ - Database Schema & Data Models

**Complete Firestore Database Design**  
**Version:** 1.0

---

## 📋 Collections Overview

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| users | User profiles & settings | email, userType, income |
| expenses | All expense transactions | amount, category, date |
| categories | Expense categories | name, icon, color |
| chat_history | AI chat conversations | userId, messages |
| budgets | User budget settings | categoryId, limit |
| notifications | User notifications | type, message, read |

---

## 👥 Users Collection

**Path:** `/users/{userId}`

```typescript
interface User {
  userId: string;              // Firebase Auth UID
  email: string;
  displayName: string;
  userType: 'student' | 'professional';
  
  // Profile
  phoneNumber?: string;
  profilePictureUrl?: string;
  
  // Financial
  monthlyIncome: number;
  currency: string;            // Default: 'INR'
  
  // Settings
  budgetAlerts: boolean;
  emailNotifications: boolean;
  darkMode: boolean;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  
  // Statistics
  totalExpenses: number;
  thisMonthExpenses: number;
}
```

---

## 💰 Expenses Collection

**Path:** `/expenses/{expenseId}`

```typescript
interface Expense {
  expenseId: string;
  userId: string;
  
  // Details
  amount: number;
  category: string;
  categoryId: string;
  description: string;
  
  // Date
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Payment
  paymentMethod: 'cash' | 'card' | 'upi' | 'netbanking' | 'other';
  
  // Optional
  receiptUrl?: string;
  location?: string;
  tags?: string[];
  notes?: string;
  isRecurring: boolean;
}
```

---

## 📂 Categories Collection

**Path:** `/categories/{categoryId}`

```typescript
interface Category {
  categoryId: string;
  name: string;
  icon: string;                // Emoji or icon name
  color: string;               // Hex color
  type: 'default' | 'custom';
  userId?: string;             // For custom categories
  isActive: boolean;
}
```

### Default Categories

| ID | Name | Icon | Color |
|----|------|------|-------|
| cat_food | Food & Dining | 🍽️ | #FF6B6B |
| cat_transport | Transportation | 🚗 | #4ECDC4 |
| cat_education | Education | 📚 | #45B7D1 |
| cat_entertainment | Entertainment | 🎬 | #F9CA24 |
| cat_healthcare | Healthcare | ⚕️ | #F38181 |
| cat_shopping | Shopping | 🛍️ | #AA96DA |
| cat_utilities | Utilities | 💡 | #95E1D3 |
| cat_rent | Rent/Housing | 🏠 | #FDCB6E |
| cat_others | Others | 📦 | #A8E6CF |

---

## 💬 Chat History Collection

**Path:** `/chat_history/{chatId}`

```typescript
interface ChatHistory {
  chatId: string;
  userId: string;
  
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Timestamp;
  }>;
  
  title: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  messageCount: number;
}
```

---

## 💵 Budgets Collection

**Path:** `/budgets/{budgetId}`

```typescript
interface Budget {
  budgetId: string;
  userId: string;
  
  categoryId: string;
  categoryName: string;
  limit: number;
  spent: number;
  remaining: number;
  
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Timestamp;
  endDate: Timestamp;
  
  alertThreshold: number;      // Alert at % (e.g., 80)
  alertSent: boolean;
  
  isActive: boolean;
}
```

---

## 🔔 Notifications Collection

**Path:** `/notifications/{notificationId}`

```typescript
interface Notification {
  notificationId: string;
  userId: string;
  
  type: 'budget_alert' | 'expense_reminder' | 'tip' | 'system';
  title: string;
  message: string;
  
  read: boolean;
  readAt?: Timestamp;
  
  actionUrl?: string;
  createdAt: Timestamp;
}
```

---

## 🔒 Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users - only owner can read/write
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
    
    // Expenses - only owner can access
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    // Categories - default readable, custom by owner
    match /categories/{categoryId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && resource.data.type == 'custom' 
        && request.auth.uid == resource.data.userId;
    }
    
    // Chat History - only owner
    match /chat_history/{chatId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // Budgets - only owner
    match /budgets/{budgetId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // Notifications - only owner
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 📑 Indexes Required

Create these composite indexes in Firebase Console:

```
Collection: expenses
Fields: userId (ASC), date (DESC)

Collection: expenses  
Fields: userId (ASC), categoryId (ASC), date (DESC)

Collection: chat_history
Fields: userId (ASC), updatedAt (DESC)

Collection: notifications
Fields: userId (ASC), read (ASC), createdAt (DESC)
```
