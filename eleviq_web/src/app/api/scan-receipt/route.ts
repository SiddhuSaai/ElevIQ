import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Category-specific extraction prompts for better accuracy
const EXTRACTION_PROMPTS: Record<string, string> = {
    grocery: `You are a receipt scanner for grocery shopping. Analyze this receipt image and extract the following in JSON format:
{
    "vendor": "Store name",
    "date": "YYYY-MM-DD format if visible",
    "items": [
        {
            "name": "Item name",
            "quantity": number,
            "weight": number or null (in kg),
            "unitPrice": number (price per unit/kg),
            "subtotal": number (total price for this item)
        }
    ],
    "subtotal": number (sum before tax/discount),
    "discount": number or null,
    "taxAmount": number or null,
    "taxPercent": number or null (GST %),
    "total": number (final amount paid)
}
Extract ALL items you can see. Be accurate with prices. If weight is in grams, convert to kg.`,

    fuel: `You are a fuel receipt scanner. Analyze this receipt image and extract the following in JSON format:
{
    "vendor": "Fuel station name",
    "date": "YYYY-MM-DD format if visible",
    "fuelType": "petrol" | "diesel" | "cng",
    "liters": number (quantity in liters),
    "ratePerLiter": number (price per liter),
    "total": number (total amount),
    "vehicleNumber": "Vehicle registration if visible" or null,
    "odometerReading": number if visible or null
}
Be precise with decimal values for liters and rate. CNG may show in kg instead of liters.`,

    food: `You are a restaurant receipt scanner. Analyze this receipt image and extract the following in JSON format:
{
    "vendor": "Restaurant/cafe name",
    "date": "YYYY-MM-DD format if visible",
    "items": [
        {
            "name": "Food item name",
            "quantity": number,
            "unitPrice": number,
            "subtotal": number
        }
    ],
    "subtotal": number,
    "gstAmount": number or null,
    "gstPercent": number or null,
    "serviceCharge": number or null,
    "tipAmount": number or null,
    "total": number (final bill amount)
}
Include all food and beverage items visible.`,

    healthcare: `You are a medical/pharmacy receipt scanner. Analyze this receipt image and extract the following in JSON format:
{
    "vendor": "Pharmacy/Hospital name",
    "date": "YYYY-MM-DD format if visible",
    "items": [
        {
            "name": "Medicine/Service name",
            "quantity": number,
            "unitPrice": number,
            "subtotal": number
        }
    ],
    "prescriptionId": "Prescription number if visible" or null,
    "doctorName": "Doctor name if visible" or null,
    "subtotal": number,
    "discount": number or null,
    "total": number
}
Extract medicine names carefully.`,

    utilities: `You are a utility bill scanner. Analyze this bill image and extract the following in JSON format:
{
    "vendor": "Utility provider name (electricity/water/gas company)",
    "date": "YYYY-MM-DD format if visible (bill date)",
    "unitsConsumed": number (kWh for electricity, cubic meters for gas/water),
    "ratePerUnit": number or null,
    "billingPeriodStart": "YYYY-MM-DD" or null,
    "billingPeriodEnd": "YYYY-MM-DD" or null,
    "meterNumber": "Meter number if visible" or null,
    "subtotal": number,
    "taxAmount": number or null,
    "total": number (total payable)
}`,

    shopping: `You are a shopping receipt scanner. Analyze this receipt image and extract the following in JSON format:
{
    "vendor": "Store name",
    "date": "YYYY-MM-DD format if visible",
    "items": [
        {
            "name": "Product name",
            "quantity": number,
            "unitPrice": number,
            "subtotal": number,
            "brand": "Brand name if visible" or null
        }
    ],
    "subtotal": number,
    "discount": number or null,
    "taxAmount": number or null,
    "total": number
}`,

    transport: `You are a transport/ride receipt scanner. Analyze this receipt image and extract the following in JSON format:
{
    "vendor": "Ride service (Uber/Ola/etc) or transport company",
    "date": "YYYY-MM-DD format if visible",
    "fromLocation": "Pickup location" or null,
    "toLocation": "Drop location" or null,
    "distanceKm": number or null,
    "rideId": "Ride/booking ID" or null,
    "subtotal": number,
    "taxAmount": number or null,
    "tipAmount": number or null,
    "total": number
}`,

    generic: `You are a receipt scanner. Analyze this receipt/bill image and extract the following in JSON format:
{
    "vendor": "Business/store name",
    "date": "YYYY-MM-DD format if visible",
    "items": [
        {
            "name": "Item/service name",
            "quantity": number,
            "unitPrice": number,
            "subtotal": number
        }
    ],
    "subtotal": number,
    "discount": number or null,
    "taxAmount": number or null,
    "total": number (final amount),
    "category": "grocery|food|fuel|transport|shopping|utilities|healthcare|entertainment|education|others"
}
Extract as much information as possible from the receipt. Also detect the most appropriate category.`,
};

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get('content-type') || '';

        let image: string;
        let mimeType: string;
        let category: string;

        // Handle both JSON and FormData requests
        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const file = formData.get('image') as File;
            category = (formData.get('category') as string) || 'generic';

            if (!file) {
                return NextResponse.json(
                    { error: 'No image file provided' },
                    { status: 400 }
                );
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            image = buffer.toString('base64');
            mimeType = file.type || 'image/jpeg';
        } else {
            // JSON request (legacy support)
            const body = await req.json();
            image = body.image;
            mimeType = body.mimeType || 'image/jpeg';
            category = body.category || 'generic';
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        if (!image) {
            return NextResponse.json(
                { error: 'No image provided' },
                { status: 400 }
            );
        }

        // Get category-specific prompt or use generic
        const prompt = EXTRACTION_PROMPTS[category] || EXTRACTION_PROMPTS.generic;

        // Use gemini-3-flash-preview which supports vision
        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: image,
                            },
                        },
                        { text: prompt + '\n\nIMPORTANT: Return ONLY valid JSON, no markdown formatting, no explanation. Use Indian Rupee (₹) for all amounts.' },
                    ],
                },
            ],
        });

        const responseText = result.text || '';

        // Parse JSON from response
        let extractedData;
        try {
            // Clean up response - remove markdown code blocks if present
            const cleanedResponse = responseText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            extractedData = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', responseText);
            return NextResponse.json(
                { error: 'Failed to parse receipt data', raw: responseText },
                { status: 422 }
            );
        }

        // Calculate confidence based on how much data was extracted
        let confidence = 0;
        if (extractedData.vendor) confidence += 20;
        if (extractedData.date) confidence += 10;
        if (extractedData.total) confidence += 30;
        if (extractedData.items && extractedData.items.length > 0) confidence += 30;
        if (extractedData.subtotal) confidence += 10;

        return NextResponse.json({
            success: true,
            category,
            data: extractedData,
            confidence: Math.min(confidence, 100),
            isAIExtracted: true,
        });
    } catch (error) {
        console.error('Receipt scan error:', error);
        return NextResponse.json(
            { error: 'Failed to process receipt', details: String(error) },
            { status: 500 }
        );
    }
}
