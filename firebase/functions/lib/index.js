"use strict";
/**
 * ELEVIQ Firebase Cloud Functions
 *
 * Functions for:
 * - FCM Push Notifications
 * - Email Notifications
 * - User Management
 * - Scheduled Tasks
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsRead = exports.unregisterFcmToken = exports.registerFcmToken = exports.weeklyInsights = exports.dailyExpenseSummary = exports.onExpenseCreated = exports.onUserCreated = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-functions/v2/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
// Initialize Firebase Admin
admin.initializeApp();
// Set global options
(0, v2_1.setGlobalOptions)({
    region: "asia-south1", // Mumbai region for India
    maxInstances: 10,
});
const db = admin.firestore();
const messaging = admin.messaging();
// ==========================================
// USER MANAGEMENT
// ==========================================
/**
 * Create user profile on signup
 */
exports.onUserCreated = (0, firestore_1.onDocumentCreated)("users/{userId}", async (event) => {
    const userId = event.params.userId;
    const userData = event.data?.data();
    if (!userData)
        return;
    console.log(`New user created: ${userId}`);
    // Send welcome notification
    await sendNotificationToUser(userId, {
        title: "Welcome to ELEVIQ! 🎉",
        body: "Start tracking your expenses and get AI-powered insights.",
        type: "welcome",
    });
});
// ==========================================
// EXPENSE NOTIFICATIONS
// ==========================================
/**
 * Notify user when expense exceeds budget
 */
exports.onExpenseCreated = (0, firestore_1.onDocumentCreated)("users/{userId}/expenses/{expenseId}", async (event) => {
    const userId = event.params.userId;
    const expense = event.data?.data();
    if (!expense)
        return;
    // Check if expense exceeds budget for this category
    const budgetSnapshot = await db
        .collection("users")
        .doc(userId)
        .collection("budgets")
        .where("category", "==", expense.category)
        .limit(1)
        .get();
    if (budgetSnapshot.empty)
        return;
    const budget = budgetSnapshot.docs[0].data();
    const currentMonth = new Date().toISOString().slice(0, 7);
    // Get total spending for this category this month
    const expensesSnapshot = await db
        .collection("users")
        .doc(userId)
        .collection("expenses")
        .where("category", "==", expense.category)
        .where("date", ">=", `${currentMonth}-01`)
        .get();
    const totalSpent = expensesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
    // Check if budget exceeded
    if (totalSpent > budget.limit) {
        await sendNotificationToUser(userId, {
            title: "Budget Alert ⚠️",
            body: `You've exceeded your ${expense.category} budget by ₹${(totalSpent - budget.limit).toFixed(2)}`,
            type: "budget_alert",
            data: {
                category: expense.category,
                spent: totalSpent.toString(),
                limit: budget.limit.toString(),
            },
        });
    }
    else if (totalSpent > budget.limit * 0.8) {
        // 80% warning
        await sendNotificationToUser(userId, {
            title: "Budget Warning 📊",
            body: `You've used 80% of your ${expense.category} budget`,
            type: "budget_warning",
            data: {
                category: expense.category,
                percentage: ((totalSpent / budget.limit) * 100).toFixed(0),
            },
        });
    }
});
// ==========================================
// SCHEDULED TASKS
// ==========================================
/**
 * Daily expense summary - runs at 8 PM IST
 */
exports.dailyExpenseSummary = (0, scheduler_1.onSchedule)({
    schedule: "0 20 * * *",
    timeZone: "Asia/Kolkata",
}, async () => {
    const today = new Date().toISOString().slice(0, 10);
    // Get all users
    const usersSnapshot = await db.collection("users").get();
    for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        // Get today's expenses
        const expensesSnapshot = await db
            .collection("users")
            .doc(userId)
            .collection("expenses")
            .where("date", "==", today)
            .get();
        if (expensesSnapshot.empty)
            continue;
        const totalSpent = expensesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
        await sendNotificationToUser(userId, {
            title: "Daily Summary 📈",
            body: `You spent ₹${totalSpent.toFixed(2)} today across ${expensesSnapshot.size} transactions`,
            type: "daily_summary",
        });
    }
    console.log("Daily expense summary sent to all users");
});
/**
 * Weekly insights - runs every Sunday at 10 AM IST
 */
exports.weeklyInsights = (0, scheduler_1.onSchedule)({
    schedule: "0 10 * * 0",
    timeZone: "Asia/Kolkata",
}, async () => {
    const usersSnapshot = await db.collection("users").get();
    for (const userDoc of usersSnapshot.docs) {
        await sendNotificationToUser(userDoc.id, {
            title: "Weekly Insights Available! 📊",
            body: "Check out your spending patterns and AI-powered recommendations",
            type: "weekly_insights",
        });
    }
    console.log("Weekly insights notification sent");
});
/**
 * Send push notification to a user
 */
async function sendNotificationToUser(userId, payload) {
    try {
        // Get user's FCM tokens
        const tokensSnapshot = await db
            .collection("users")
            .doc(userId)
            .collection("fcmTokens")
            .get();
        if (tokensSnapshot.empty) {
            console.log(`No FCM tokens found for user ${userId}`);
            return;
        }
        const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);
        // Create notification in Firestore
        await db.collection("users").doc(userId).collection("notifications").add({
            title: payload.title,
            body: payload.body,
            type: payload.type,
            data: payload.data || {},
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Send FCM notification
        const message = {
            tokens,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: {
                type: payload.type,
                ...payload.data,
            },
            android: {
                priority: "high",
                notification: {
                    channelId: "eleviq_notifications",
                    icon: "ic_notification",
                },
            },
            apns: {
                payload: {
                    aps: {
                        badge: 1,
                        sound: "default",
                    },
                },
            },
        };
        const response = await messaging.sendEachForMulticast(message);
        // Remove invalid tokens
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                failedTokens.push(tokens[idx]);
            }
        });
        if (failedTokens.length > 0) {
            const batch = db.batch();
            for (const token of failedTokens) {
                const tokenDocs = await db
                    .collection("users")
                    .doc(userId)
                    .collection("fcmTokens")
                    .where("token", "==", token)
                    .get();
                tokenDocs.forEach((doc) => batch.delete(doc.ref));
            }
            await batch.commit();
            console.log(`Removed ${failedTokens.length} invalid FCM tokens`);
        }
        console.log(`Notification sent to user ${userId}: ${response.successCount} success, ${response.failureCount} failed`);
    }
    catch (error) {
        console.error(`Error sending notification to user ${userId}:`, error);
    }
}
// ==========================================
// CALLABLE FUNCTIONS
// ==========================================
/**
 * Register FCM token for user
 */
exports.registerFcmToken = (0, https_1.onCall)(async (request) => {
    const { token, platform } = request.data;
    const userId = request.auth?.uid;
    if (!userId) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
    }
    if (!token) {
        throw new https_1.HttpsError("invalid-argument", "Token is required");
    }
    // Check if token already exists
    const existingToken = await db
        .collection("users")
        .doc(userId)
        .collection("fcmTokens")
        .where("token", "==", token)
        .get();
    if (!existingToken.empty) {
        // Update existing token
        await existingToken.docs[0].ref.update({
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    else {
        // Add new token
        await db.collection("users").doc(userId).collection("fcmTokens").add({
            token,
            platform: platform || "unknown",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    return { success: true };
});
/**
 * Unregister FCM token
 */
exports.unregisterFcmToken = (0, https_1.onCall)(async (request) => {
    const { token } = request.data;
    const userId = request.auth?.uid;
    if (!userId) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
    }
    if (!token) {
        throw new https_1.HttpsError("invalid-argument", "Token is required");
    }
    const tokenDocs = await db
        .collection("users")
        .doc(userId)
        .collection("fcmTokens")
        .where("token", "==", token)
        .get();
    const batch = db.batch();
    tokenDocs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    return { success: true };
});
/**
 * Mark all notifications as read
 */
exports.markAllNotificationsRead = (0, https_1.onCall)(async (request) => {
    const userId = request.auth?.uid;
    if (!userId) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
    }
    const notificationsSnapshot = await db
        .collection("users")
        .doc(userId)
        .collection("notifications")
        .where("read", "==", false)
        .get();
    const batch = db.batch();
    notificationsSnapshot.forEach((doc) => {
        batch.update(doc.ref, { read: true });
    });
    await batch.commit();
    return { updated: notificationsSnapshot.size };
});
//# sourceMappingURL=index.js.map