import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface ExpenseSummary {
    currentMonth: {
        total: number;
        byCategory: Record<string, number>;
        byDayOfWeek: Record<string, number>;
        count: number;
    };
    previousMonth: {
        total: number;
        byCategory: Record<string, number>;
        count: number;
    };
    daysElapsed: number;
    daysInMonth: number;
}

const insightsPrompt = `You are a financial insights AI for the ElevIQ app. Analyze the spending data and provide insights in JSON format.

Respond with this exact structure:
{
  "insights": [
    {
      "type": "spending_change" | "pattern" | "warning" | "positive",
      "title": "Short title (max 8 words)",
      "description": "Detailed insight (max 30 words)",
      "icon": "trending-up" | "trending-down" | "alert" | "check" | "calendar" | "wallet",
      "color": "green" | "red" | "yellow" | "blue" | "purple"
    }
  ],
  "recommendations": [
    {
      "title": "Action to take (max 8 words)",
      "description": "How to save money (max 25 words)",
      "potentialSavings": number (monthly savings in INR, estimate),
      "priority": "high" | "medium" | "low"
    }
  ],
  "forecast": {
    "projectedMonthEnd": number,
    "trend": "up" | "down" | "stable",
    "comparedToLastMonth": number (percentage change)
  }
}

Guidelines:
- Generate 3-5 insights based on actual patterns
- Generate 2-3 actionable recommendations
- Use Indian Rupee (₹) amounts
- Be specific with numbers from the data
- Make recommendations actionable and realistic
- Focus on the biggest spending changes
- Respond ONLY with valid JSON`;

export async function POST(req: NextRequest) {
    try {
        const { summary } = await req.json() as { summary: ExpenseSummary };

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        // Build context from summary
        const contextData = `
Current Month Spending:
- Total: ₹${summary.currentMonth.total}
- Transactions: ${summary.currentMonth.count}
- Days elapsed: ${summary.daysElapsed} of ${summary.daysInMonth}
- By Category: ${Object.entries(summary.currentMonth.byCategory)
                .map(([cat, amt]) => `${cat}: ₹${amt}`)
                .join(', ')}
- By Day of Week: ${Object.entries(summary.currentMonth.byDayOfWeek)
                .map(([day, amt]) => `${day}: ₹${amt}`)
                .join(', ')}

Previous Month:
- Total: ₹${summary.previousMonth.total}
- Transactions: ${summary.previousMonth.count}
- By Category: ${Object.entries(summary.previousMonth.byCategory)
                .map(([cat, amt]) => `${cat}: ₹${amt}`)
                .join(', ')}

Projected month-end (at current pace): ₹${Math.round((summary.currentMonth.total / summary.daysElapsed) * summary.daysInMonth)}
`;

        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: insightsPrompt + '\n\nSpending Data:\n' + contextData,
        });

        const responseText = result.text || '';

        // Parse JSON from response
        let analysisData;
        try {
            const cleanedResponse = responseText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            analysisData = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', responseText);
            return NextResponse.json(
                { error: 'Failed to generate insights' },
                { status: 422 }
            );
        }

        return NextResponse.json({
            success: true,
            data: analysisData,
        });
    } catch (error) {
        console.error('Insights API error:', error);
        return NextResponse.json(
            { error: 'Failed to generate insights' },
            { status: 500 }
        );
    }
}
