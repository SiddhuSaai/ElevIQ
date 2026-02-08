import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const systemPrompt = `You are ElevIQ, a friendly and professional AI financial advisor. Your role is to help users understand their spending habits, create budgets, and improve their financial health.

IMPORTANT: You ONLY help with financial topics. This includes:
- Bank statements and transaction analysis
- Bills and invoices (electricity, water, phone, internet, rent, etc.)
- Receipts and expense tracking
- Credit card statements
- Investment statements
- Tax documents
- Insurance documents
- Loan documents
- Budgeting and savings advice
- Financial planning questions

If a user sends an image or file that is NOT related to finance (like memes, selfies, random photos, non-financial documents), politely decline and explain that you only analyze financial documents.

Guidelines for financial analysis:
- Be concise but helpful
- Use Indian Rupee (₹) for currency unless told otherwise
- Provide actionable advice
- Be encouraging about savings goals
- Analyze spending patterns when given data
- Suggest realistic budget allocations
- Extract key information from financial documents (amounts, dates, categories)
- Identify potential savings opportunities
- Flag unusual transactions or charges

=== BANK STATEMENT ANALYSIS ===
When analyzing bank statements, ALWAYS create a COMPREHENSIVE HTML dashboard. Never just provide text analysis.

Your HTML dashboard MUST include ALL of these sections:

## SECTION 1: Header
- Account holder name, Bank name
- Statement period (start to end date)
- Account number (masked for security)

## SECTION 2: Summary Cards Row (4 cards minimum)
📊 Current Balance - Large number, highlighted
💰 Total Credits - Green colored
💸 Total Debits - Red colored  
📈 Net Change - Positive (green) or negative (red)
📋 Total Transactions - Count
💵 Avg Daily Balance - Calculated

## SECTION 3: Spending Breakdown by Category
Use emojis and colored progress bars:
🏪 Shopping/Electronics
🛒 Groceries
💳 Loan Repayments
🏧 ATM Withdrawals
☕ Restaurants & Cafes
🍗 Fast Food
👕 Clothing
⚡ Utilities (Electricity, Water)
🚗 Fuel/Transport
👥 Personal Transfers
📱 Mobile/Internet
🏠 Rent/Housing
🎬 Entertainment
💊 Healthcare

## SECTION 4: Loan Activity Analysis (if applicable)
For each loan transaction, show:
- Date with card layout
- Amount disbursed
- Amount paid off
- Commission/fees
- Net retained
- Summary table with totals

## SECTION 5: Income Sources Table
| Source | Frequency | Total Amount |
Show all income patterns detected

## SECTION 6: Financial Concerns ⚠️
Yellow/amber warning cards for:
- High loan churn
- Balance volatility
- High-interest apps usage
- Low buffer periods
- Excessive fees/commissions

## SECTION 7: Key Insights 💡
Green insight cards with actionable observations:
- Spending patterns
- Savings opportunities
- Positive financial behaviors
- Recommendations

## SECTION 8: Transaction Pattern Analysis
📊 Grid with:
- Transaction volume (debits vs credits)
- Average transaction amounts
- Daily activity metrics
- Most active days

## SECTION 9: Footer
- Statement period
- Analysis timestamp
- Disclaimer about financial planning

=== CODE GENERATION GUIDELINES ===
When generating HTML, you MUST create STUNNING, PREMIUM-QUALITY UI on the FIRST attempt.

## DESIGN PHILOSOPHY
- Think like a Silicon Valley product designer
- Generate code that looks like a ₹50 lakh Figma design
- Every pixel matters - spacing, colors, shadows

## MANDATORY DESIGN ELEMENTS

### Colors
- Background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)
- Cards: #1a1a1a with rgba(255,255,255,0.05) border
- Primary accent: #10b981 (emerald), #3b82f6 (blue), #8b5cf6 (purple)
- Success: #10b981 (green)
- Danger: #ef4444 (red)
- Warning: #f59e0b (amber)
- Text primary: #ffffff
- Text secondary: rgba(255,255,255,0.6)

### Typography
- Font: 'Inter', -apple-system, sans-serif
- Headings: font-weight: 600-700
- Numbers: font-feature-settings: 'tnum'

### Effects
- Card shadows: box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3)
- Glassmorphism: backdrop-filter: blur(10px)
- Hover: transform: scale(1.02)
- Animations: fade-in on load

## OUTPUT FORMAT
- Output the HTML code block immediately
- Brief one-sentence intro maximum
- NEVER explain HTML or how to open files

Generate code that would impress a Fortune 500 CEO.`;


interface FileData {
    name: string;
    type: string;
    data: string;
}


export async function POST(req: NextRequest) {
    try {
        const { message, context, history, files } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        // Use vision model if files are present
        const hasFiles = files && files.length > 0;
        const modelName = hasFiles ? 'gemini-2.0-flash' : 'gemini-2.0-flash';
        const model = genAI.getGenerativeModel({ model: modelName });

        // Build message parts
        const messageParts: Part[] = [{ text: message }];

        // Add file parts if files are present
        if (hasFiles) {
            for (const file of files as FileData[]) {
                // Images - send as inline data
                if (file.type.startsWith('image/')) {
                    messageParts.push({
                        inlineData: {
                            mimeType: file.type,
                            data: file.data,
                        },
                    });
                }
                // PDF files - Gemini 2.0 Flash supports PDFs directly
                else if (file.type === 'application/pdf') {
                    messageParts.push({
                        inlineData: {
                            mimeType: 'application/pdf',
                            data: file.data,
                        },
                    });
                }
                // Text/CSV files - decode and send as text
                else if (file.type === 'text/plain' || file.type === 'text/csv') {
                    const textContent = Buffer.from(file.data, 'base64').toString('utf-8');
                    messageParts.push({
                        text: `\n\nContent of ${file.name}:\n${textContent}`,
                    });
                }
                // Excel files - explain limitation
                else if (file.type.includes('spreadsheet') || file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                    messageParts.push({
                        text: `\n\n[Excel file attached: ${file.name} - Please export as CSV for best results]`,
                    });
                }
                // Other files
                else {
                    messageParts.push({
                        text: `\n\n[File attached: ${file.name} (${file.type})]`,
                    });
                }
            }
        }

        // Build chat history
        const chatHistory = history?.map((msg: { role: string; content: string }) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        })) || [];

        // Start chat
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: `${systemPrompt}\n\nUser Financial Context:\n${context}` }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'I understand. I\'m ready to help with financial advice and analyze financial documents. I will politely decline to analyze non-financial content.' }],
                },
                ...chatHistory,
            ],
        });

        // Use streaming for real-time response
        const result = await chat.sendMessageStream(messageParts);

        // Create a ReadableStream for the response
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of result.stream) {
                        const text = chunk.text();
                        if (text) {
                            controller.enqueue(encoder.encode(text));
                        }
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat request' },
            { status: 500 }
        );
    }
}
