import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `You are a smart expense parser. Parse the following natural language input into expense details.
        
Input: "${text}"

Extract and return a JSON object with:
- amount: number (the expense amount in INR, if mentioned in other currencies convert to INR)
- description: string (what the expense was for)
- category: string (one of: food, transport, shopping, entertainment, bills, health, education, groceries, travel, other)
- date: string (ISO date format, default to today if not specified: ${new Date().toISOString().split('T')[0]})

Examples:
- "spent 500 on lunch today" → {"amount": 500, "description": "lunch", "category": "food", "date": "2024-02-07"}
- "bought groceries for 2000 yesterday" → {"amount": 2000, "description": "groceries", "category": "groceries", "date": "2024-02-06"}
- "uber ride 250" → {"amount": 250, "description": "uber ride", "category": "transport", "date": "2024-02-07"}

Return ONLY the JSON object, no other text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text().trim();

        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return NextResponse.json({ error: 'Could not parse expense from text' }, { status: 400 });
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return NextResponse.json({
            success: true,
            data: {
                amount: parsed.amount,
                description: parsed.description,
                category: parsed.category,
                date: parsed.date,
            },
        });
    } catch (error: any) {
        console.error('Voice parse error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to parse voice input' },
            { status: 500 }
        );
    }
}
