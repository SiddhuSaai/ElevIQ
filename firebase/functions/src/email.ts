/**
 * Email Service for ELEVIQ
 * 
 * Uses Nodemailer for sending transactional emails
 */

import * as nodemailer from "nodemailer";
import { defineSecret } from "firebase-functions/params";

// Define secrets (set in Firebase console)
const smtpHost = defineSecret("SMTP_HOST");
const smtpPort = defineSecret("SMTP_PORT");
const smtpUser = defineSecret("SMTP_USER");
const smtpPassword = defineSecret("SMTP_PASSWORD");
const emailFrom = defineSecret("EMAIL_FROM");

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Create email transporter
 */
function createTransporter() {
    return nodemailer.createTransport({
        host: smtpHost.value(),
        port: parseInt(smtpPort.value() || "587"),
        secure: false,
        auth: {
            user: smtpUser.value(),
            pass: smtpPassword.value(),
        },
    });
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
    try {
        const transporter = createTransporter();

        await transporter.sendMail({
            from: emailFrom.value() || "ELEVIQ <noreply@eleviq.app>",
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        });

        console.log(`Email sent to ${options.to}: ${options.subject}`);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}

/**
 * Email Templates
 */
export const emailTemplates = {
    welcome: (userName: string) => ({
        subject: "Welcome to ELEVIQ! 🎉",
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #6366F1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ELEVIQ!</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName}! 👋</h2>
            <p>Thank you for joining ELEVIQ - your AI-powered personal finance companion.</p>
            <p>Here's what you can do:</p>
            <ul>
              <li>📊 Track your expenses effortlessly</li>
              <li>🤖 Get AI-powered financial insights</li>
              <li>📈 Visualize your spending patterns</li>
              <li>🎯 Set and achieve budget goals</li>
            </ul>
            <a href="https://eleviq.letbuyy.com" class="button">Get Started</a>
            <p>If you have any questions, feel free to reach out!</p>
          </div>
          <div class="footer">
            <p>© 2024 ELEVIQ. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    }),

    budgetAlert: (category: string, spent: number, limit: number) => ({
        subject: `Budget Alert: ${category} exceeded! ⚠️`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .stat { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; display: inline-block; width: 45%; text-align: center; }
          .button { display: inline-block; background: #6366F1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Budget Alert</h1>
          </div>
          <div class="content">
            <h2>Your ${category} budget has been exceeded</h2>
            <div>
              <div class="stat">
                <strong>Spent</strong><br>
                <span style="font-size: 24px; color: #EF4444;">₹${spent.toFixed(2)}</span>
              </div>
              <div class="stat">
                <strong>Budget</strong><br>
                <span style="font-size: 24px; color: #10B981;">₹${limit.toFixed(2)}</span>
              </div>
            </div>
            <p>You've exceeded your budget by <strong>₹${(spent - limit).toFixed(2)}</strong></p>
            <a href="https://eleviq.letbuyy.com" class="button">View Details</a>
          </div>
        </div>
      </body>
      </html>
    `,
    }),

    weeklySummary: (userName: string, totalSpent: number, topCategory: string) => ({
        subject: "Your Weekly Spending Summary 📊",
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .stat-box { background: white; padding: 20px; border-radius: 8px; margin: 10px 0; text-align: center; }
          .button { display: inline-block; background: #6366F1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Weekly Summary</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName}!</h2>
            <p>Here's your spending summary for this week:</p>
            <div class="stat-box">
              <strong>Total Spent</strong><br>
              <span style="font-size: 32px; color: #6366F1;">₹${totalSpent.toFixed(2)}</span>
            </div>
            <div class="stat-box">
              <strong>Top Category</strong><br>
              <span style="font-size: 24px;">${topCategory}</span>
            </div>
            <a href="https://eleviq.letbuyy.com" class="button">View Full Report</a>
          </div>
        </div>
      </body>
      </html>
    `,
    }),
};
