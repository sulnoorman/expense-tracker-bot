const { createCanvas, loadImage } = require("canvas");

const transactions = [
    {
        address: "1234 Lorem Ipsum, Dolor",
        tel: "123-456-7890",
        date: "01-01-2018",
        time: "10:35",
        items: [
            { name: "Lorem", price: 6.50 },
            { name: "Ipsum", price: 7.50 },
            { name: "Dolor Sit", price: 48.00 },
            { name: "Amet", price: 9.30 },
            { name: "Consectetur", price: 11.90 },
            { name: "Adipiscing Elit", price: 1.20 },
            { name: "Sed Do", price: 0.40 },
        ],
        amount: 84.80,
        subtotal: 76.80,
        tax: 8.00,
        balance: 84.80,
        barcode: "12345678901234567890"
    },
    {
        address: "5678 Another St, City",
        tel: "987-654-3210",
        date: "02-01-2018",
        time: "11:00",
        items: [
            { name: "Product A", price: 15.00 },
            { name: "Product B", price: 25.00 },
        ],
        amount: 40.00,
        subtotal: 40.00,
        tax: 0.00,
        balance: 40.00,
        barcode: "09876543210987654321"
    },
    {
        address: "9101 Main Ave, Town",
        tel: "111-222-3333",
        date: "03-01-2018",
        time: "12:30",
        items: [
            { name: "Service X", price: 100.00 },
            { name: "Service Y", price: 50.00 },
        ],
        amount: 150.00,
        subtotal: 150.00,
        tax: 0.00,
        balance: 150.00,
        barcode: "11223344556677889900"
    }
];

const generateClassicReceiptReport = async () => {
    const width = 600; // Narrower for a receipt feel
    let currentY = 0;
    const receiptPadding = 30;

    // Estimate total height needed
    const estimatedReceiptHeight = 500; // A rough estimate for one receipt
    const totalHeight = (transactions.length * estimatedReceiptHeight) + (transactions.length * receiptPadding) + 100;

    const canvas = createCanvas(width, totalHeight);
    const context = canvas.getContext("2d");

    // A transparent background to match the example
    context.clearRect(0, 0, width, totalHeight);

    for (const transactionData of transactions) {
        const startY = currentY;

        // Draw the receipt paper background
        context.fillStyle = "#f0f0f0"; // Light grey paper color
        context.shadowColor = "rgba(0, 0, 0, 0.3)";
        context.shadowBlur = 10;
        context.shadowOffsetX = 5;
        context.shadowOffsetY = 5;
        context.fillRect(50, startY + 20, width - 100, estimatedReceiptHeight - 40);
        context.shadowColor = "transparent"; // Reset shadow

        // Jagged edges (simplified)
        const drawJaggedEdge = (y) => {
            context.beginPath();
            context.moveTo(50, y);
            for (let i = 50; i < width - 50; i += 10) {
                context.lineTo(i + 5, y + (i % 20 === 0 ? 5 : 0));
            }
            context.lineTo(width - 50, y);
            context.strokeStyle = "#e0e0e0";
            context.stroke();
        };
        drawJaggedEdge(startY + 20);
        drawJaggedEdge(startY + estimatedReceiptHeight - 20);

        currentY += 50;

        // Header - "Receipt"
        context.font = "italic 30px 'Times New Roman'";
        context.fillStyle = "#000000";
        context.textAlign = "center";
        context.fillText("Receipt", width / 2, currentY);
        currentY += 40;

        // Address and Tel
        context.font = "16px 'Courier New'";
        context.textAlign = "center";
        context.fillText(transactionData.address, width / 2, currentY);
        currentY += 20;
        context.fillText(`Tel: ${transactionData.tel}`, width / 2, currentY);
        currentY += 30;

        // Date and Time
        context.textAlign = "left";
        context.fillText(`Date: ${transactionData.date}`, 70, currentY);
        context.textAlign = "right";
        context.fillText(transactionData.time, width - 70, currentY);
        currentY += 20;

        // Dashed line
        context.setLineDash([5, 3]);
        context.beginPath();
        context.moveTo(70, currentY);
        context.lineTo(width - 70, currentY);
        context.strokeStyle = "#888888";
        context.stroke();
        context.setLineDash([]);
        currentY += 30;

        // Items
        context.textAlign = "left";
        transactionData.items.forEach(item => {
            context.fillText(item.name, 70, currentY);
            context.textAlign = "right";
            context.fillText(item.price.toFixed(2), width - 70, currentY);
            context.textAlign = "left";
            currentY += 25;
        });
        currentY += 10;

        // Dashed line
        context.setLineDash([5, 3]);
        context.beginPath();
        context.moveTo(70, currentY);
        context.lineTo(width - 70, currentY);
        context.stroke();
        context.setLineDash([]);
        currentY += 30;

        // Totals
        context.font = "bold 16px 'Courier New'";
        context.textAlign = "left";
        context.fillText("AMOUNT", 70, currentY);
        context.textAlign = "right";
        context.fillText(transactionData.amount.toFixed(2), width - 70, currentY);
        currentY += 25;

        context.font = "16px 'Courier New'";
        context.textAlign = "left";
        context.fillText("Sub-total", 70, currentY);
        context.textAlign = "right";
        context.fillText(transactionData.subtotal.toFixed(2), width - 70, currentY);
        currentY += 25;

        context.fillText("Sales Tax", 70, currentY);
        context.textAlign = "right";
        context.fillText(transactionData.tax.toFixed(2), width - 70, currentY);
        currentY += 25;

        context.fillText("Balance", 70, currentY);
        context.textAlign = "right";
        context.fillText(transactionData.balance.toFixed(2), width - 70, currentY);
        currentY += 40;

        // Simple barcode representation (using rectangles)
        const drawSimpleBarcode = (x, y, width, height) => {
            context.fillStyle = "#000000";
            const barWidth = 3;
            const spaceWidth = 2;
            for (let i = 0; i < width; i += barWidth + spaceWidth) {
                if (Math.random() > 0.5) { // Random pattern for demonstration
                    context.fillRect(x + i, y, barWidth, height);
                }
            }
        };
        drawSimpleBarcode((width - 200) / 2, currentY - 20, 200, 30);

        currentY = startY + estimatedReceiptHeight + receiptPadding;
    }

    // Final resize to fit content
    const finalCanvas = createCanvas(width, currentY);
    const finalContext = finalCanvas.getContext("2d");
    finalContext.drawImage(canvas, 0, 0);

    return finalCanvas.toBuffer("image/png");
};

module.exports = generateClassicReceiptReport;