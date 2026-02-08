import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

export async function POST(req: NextRequest) {
    try {
        const { expenses, dateRange, format: exportFormat } = await req.json();

        if (!expenses || !Array.isArray(expenses)) {
            return NextResponse.json({ error: 'No expenses provided' }, { status: 400 });
        }

        if (exportFormat === 'csv') {
            // Generate CSV
            const headers = ['Date', 'Description', 'Category', 'Amount', 'Payment Method'];
            const rows = expenses.map((e: any) => [
                new Date(e.date).toLocaleDateString('en-IN'),
                e.description,
                e.category,
                e.amount,
                e.paymentMethod,
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map((r: any[]) => r.map(v => `"${v}"`).join(',')),
            ].join('\n');

            return new NextResponse(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="expenses_${dateRange || 'all'}.csv"`,
                },
            });
        }

        // Generate PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Title
        doc.setFontSize(24);
        doc.setTextColor(59, 130, 246);
        doc.text('ElevIQ', pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Expense Report', pageWidth / 2, 30, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, 38, { align: 'center' });

        // Summary
        const totalAmount = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
        const categoryTotals: Record<string, number> = {};
        expenses.forEach((e: any) => {
            categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
        });

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Summary', 14, 55);

        doc.setFontSize(11);
        doc.text(`Total Expenses: ₹${totalAmount.toLocaleString()}`, 14, 65);
        doc.text(`Number of Transactions: ${expenses.length}`, 14, 72);

        // Category breakdown
        doc.setFontSize(14);
        doc.text('By Category', 14, 90);

        let yPos = 100;
        doc.setFontSize(10);
        Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .forEach(([category, amount]) => {
                const percentage = ((amount / totalAmount) * 100).toFixed(1);
                doc.text(`${category}: ₹${amount.toLocaleString()} (${percentage}%)`, 14, yPos);
                yPos += 7;
            });

        // Transactions table header
        yPos += 10;
        doc.setFontSize(14);
        doc.text('Transactions', 14, yPos);
        yPos += 10;

        // Table header
        doc.setFillColor(243, 244, 246);
        doc.rect(14, yPos - 5, pageWidth - 28, 8, 'F');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('Date', 16, yPos);
        doc.text('Description', 45, yPos);
        doc.text('Category', 100, yPos);
        doc.text('Amount', 145, yPos);
        yPos += 8;

        // Table rows
        doc.setTextColor(0, 0, 0);
        expenses.slice(0, 30).forEach((expense: any) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), 16, yPos);
            doc.text(expense.description.slice(0, 25), 45, yPos);
            doc.text(expense.category, 100, yPos);
            doc.text(`₹${expense.amount.toLocaleString()}`, 145, yPos);
            yPos += 6;
        });

        if (expenses.length > 30) {
            doc.setTextColor(128, 128, 128);
            doc.text(`... and ${expenses.length - 30} more transactions`, 14, yPos + 5);
        }

        // Footer
        const pageCount = doc.internal.pages.length - 1;
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
        }

        const pdfBuffer = doc.output('arraybuffer');

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="expenses_${dateRange || 'report'}.pdf"`,
            },
        });
    } catch (error: any) {
        console.error('Export error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate export' },
            { status: 500 }
        );
    }
}
