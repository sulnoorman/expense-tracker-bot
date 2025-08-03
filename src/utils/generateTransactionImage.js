const { createCanvas, registerFont, loadImage } = require("canvas");
const { formatRupiah } = require("./utils");

// Register your fonts
registerFont('./fonts/CourierPrime/CourierPrime-Regular.ttf', { family: 'Courier Prime' });
registerFont('./fonts/Share_Tech_Mono/ShareTechMono-Regular.ttf', { family: 'Share Tech Mono' });

// const transactions = [
//     {
//         description: 'Listrik Bulan Agustus',
//         amount: 275000,
//         id: 34,
//         userId: 2,
//         categoryId: 5,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Jajan cilok',
//         amount: 5000,
//         id: 33,
//         userId: 2,
//         categoryId: 1,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Belanja Bulanan',
//         amount: 618000,
//         id: 32,
//         userId: 2,
//         categoryId: 3,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'CO tas sepatu & case stb akrilik shopee',
//         amount: 200000,
//         id: 31,
//         userId: 2,
//         categoryId: 3,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Kuota Cadangan Bulanan',
//         amount: 56000,
//         id: 30,
//         userId: 2,
//         categoryId: 5,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Jajan martabak',
//         amount: 83000,
//         id: 29,
//         userId: 2,
//         categoryId: 1,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Ngasih ibu❤️',
//         amount: 1800000,
//         id: 28,
//         userId: 2,
//         categoryId: 8,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Celana jeans',
//         amount: 200000,
//         id: 27,
//         userId: 2,
//         categoryId: 3,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Paylater shopee & gopay',
//         amount: 500000,
//         id: 26,
//         userId: 2,
//         categoryId: 5,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Nabung Bulanan',
//         amount: 500000,
//         id: 25,
//         userId: 2,
//         categoryId: 16,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Nabung UKT UT',
//         amount: 500000,
//         id: 24,
//         userId: 2,
//         categoryId: 7,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Gaji bulan Juli',
//         amount: 5000000,
//         id: 23,
//         userId: 2,
//         categoryId: 9,
//         type: 'INCOME',
//     },
//     {
//         description: 'Listrik Bulan Agustus',
//         amount: 275000,
//         id: 34,
//         userId: 2,
//         categoryId: 5,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Jajan cilok',
//         amount: 5000,
//         id: 33,
//         userId: 2,
//         categoryId: 1,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Belanja Bulanan',
//         amount: 618000,
//         id: 32,
//         userId: 2,
//         categoryId: 3,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'CO tas sepatu & case stb akrilik shopee',
//         amount: 200000,
//         id: 31,
//         userId: 2,
//         categoryId: 3,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Kuota Cadangan Bulanan',
//         amount: 56000,
//         id: 30,
//         userId: 2,
//         categoryId: 5,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Jajan martabak',
//         amount: 83000,
//         id: 29,
//         userId: 2,
//         categoryId: 1,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Ngasih ibu❤️',
//         amount: 1800000,
//         id: 28,
//         userId: 2,
//         categoryId: 8,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Celana jeans',
//         amount: 200000,
//         id: 27,
//         userId: 2,
//         categoryId: 3,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Paylater shopee & gopay',
//         amount: 500000,
//         id: 26,
//         userId: 2,
//         categoryId: 5,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Nabung Bulanan',
//         amount: 500000,
//         id: 25,
//         userId: 2,
//         categoryId: 16,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Nabung UKT UT',
//         amount: 500000,
//         id: 24,
//         userId: 2,
//         categoryId: 7,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Gaji bulan Juli',
//         amount: 5000000,
//         id: 23,
//         userId: 2,
//         categoryId: 9,
//         type: 'INCOME',
//     },
//     {
//         description: 'Jajan martabak',
//         amount: 83000,
//         id: 29,
//         userId: 2,
//         categoryId: 1,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Ngasih ibu❤️',
//         amount: 1800000,
//         id: 28,
//         userId: 2,
//         categoryId: 8,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Celana jeans',
//         amount: 200000,
//         id: 27,
//         userId: 2,
//         categoryId: 3,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Paylater shopee & gopay',
//         amount: 500000,
//         id: 26,
//         userId: 2,
//         categoryId: 5,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Nabung Bulanan',
//         amount: 500000,
//         id: 25,
//         userId: 2,
//         categoryId: 16,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Nabung UKT UT',
//         amount: 500000,
//         id: 24,
//         userId: 2,
//         categoryId: 7,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Gaji bulan Juli',
//         amount: 5000000,
//         id: 23,
//         userId: 2,
//         categoryId: 9,
//         type: 'INCOME',
//     },
//     {
//         description: 'Jajan martabak',
//         amount: 83000,
//         id: 29,
//         userId: 2,
//         categoryId: 1,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Ngasih ibu❤️',
//         amount: 1800000,
//         id: 28,
//         userId: 2,
//         categoryId: 8,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Celana jeans',
//         amount: 200000,
//         id: 27,
//         userId: 2,
//         categoryId: 3,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Paylater shopee & gopay',
//         amount: 500000,
//         id: 26,
//         userId: 2,
//         categoryId: 5,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Nabung Bulanan',
//         amount: 500000,
//         id: 25,
//         userId: 2,
//         categoryId: 16,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Nabung UKT UT',
//         amount: 500000,
//         id: 24,
//         userId: 2,
//         categoryId: 7,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Gaji bulan Juli',
//         amount: 5000000,
//         id: 23,
//         userId: 2,
//         categoryId: 9,
//         type: 'INCOME',
//     },
//     {
//         description: 'Jajan martabak',
//         amount: 83000,
//         id: 29,
//         userId: 2,
//         categoryId: 1,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Ngasih ibu❤️',
//         amount: 1800000,
//         id: 28,
//         userId: 2,
//         categoryId: 8,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Celana jeans',
//         amount: 200000,
//         id: 27,
//         userId: 2,
//         categoryId: 3,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Paylater shopee & gopay',
//         amount: 500000,
//         id: 26,
//         userId: 2,
//         categoryId: 5,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Nabung Bulanan',
//         amount: 500000,
//         id: 25,
//         userId: 2,
//         categoryId: 16,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Nabung UKT UT',
//         amount: 500000,
//         id: 24,
//         userId: 2,
//         categoryId: 7,
//         type: 'EXPENSE',
//     },
//     {
//         description: 'Gaji bulan Juli',
//         amount: 5000000,
//         id: 23,
//         userId: 2,
//         categoryId: 9,
//         type: 'INCOME',
//     }
// ]

const headerText = "Transaction Summary";
const dateRange = "2025-08-01 to 2025-08-31";

const generateTransactionImage = async (transactions) => {
    const width = 600; // Narrower for a receipt feel
    let currentY = 0;
    const padding = 70; // Padding for content

    // Calculate height dynamically
    const estimatedHeight = 250 + (transactions.length * 25) + 100;
    const canvas = createCanvas(width, estimatedHeight);
    const context = canvas.getContext("2d");

    // Fill background
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, width, estimatedHeight);

    // Function to draw the receipt paper with true jagged edges
    const drawReceiptShape = (x, y, w, h) => {
        context.beginPath();

        // Top zigzag
        context.moveTo(x + 50, y);
        for (let i = x + 50; i < x + w - 50; i += 10) {
            context.lineTo(i + 5, y + (i % 20 === 0 ? 5 : 0));
        }
        context.lineTo(x + w - 50, y);

        // Right edge
        context.lineTo(x + w - 50, y + h - 20);

        // Bottom zigzag (mirrored)
        for (let i = x + w - 50; i > x + 50; i -= 10) {
            context.lineTo(i - 5, y + h - 20 + (i % 20 === 0 ? -5 : 0));
        }
        context.lineTo(x + 50, y + h - 20);

        // Left edge
        context.closePath();

        // Fill paper with drop shadow
        context.fillStyle = "#f0f0f0";
        context.shadowColor = "rgba(0, 0, 0, 0.3)";
        context.shadowBlur = 10;
        context.shadowOffsetX = 5;
        context.shadowOffsetY = 5;
        context.fill();

        // Reset shadow for other drawings
        context.shadowColor = "transparent";

        // 🔹 Draw a subtle outline along the top zigzag so it's visible
        context.beginPath();
        context.moveTo(x + 50, y);
        for (let i = x + 50; i < x + w - 50; i += 10) {
            context.lineTo(i + 5, y + (i % 20 === 0 ? 5 : 0));
        }
        context.lineTo(x + w - 50, y);

        context.strokeStyle = "rgba(0, 0, 0, 0.1)"; // Light grey shadow line
        context.stroke();
    };

    // Draw receipt shape
    drawReceiptShape(0, 20, width, estimatedHeight - 40);

    currentY += 70;

    // Header Text
    context.font = "bold 30px 'Courier Prime', Arial";
    context.fillStyle = "#000000";
    context.textAlign = "center";
    context.fillText(headerText, width / 2, currentY);
    currentY += 40;

    // Date Range
    context.font = "18px Arial";
    context.fillStyle = "#555555";
    context.fillText(dateRange, width / 2, currentY);
    currentY += 30;

    // Dashed line
    context.setLineDash([5, 3]);
    context.beginPath();
    context.moveTo(padding, currentY);
    context.lineTo(width - padding, currentY);
    context.strokeStyle = "#888888";
    context.stroke();
    context.setLineDash([]);
    currentY += 30;

    // Transactions
    context.font = "16px 'Courier Prime'";
    context.textAlign = "left";
    let totalAmount = 0;
    const maxTextWidth = width - padding * 2 - 120;  // 120px maxlength of text

    transactions.forEach(transaction => {
        const desc = transaction.description;
        const words = desc.split(" ");
        let line = "";
        const lines = [];

        // Split into lines manually
        words.forEach(word => {
            const testLine = line ? `${line} ${word}` : word;
            const testWidth = context.measureText(testLine).width;
            if (testWidth > maxTextWidth && line) {
                lines.push(line);
                line = word;
            } else {
                line = testLine;
            }
        });
        if (line) lines.push(line);

        // Draw each line of description
        context.fillStyle = "#000000";
        lines.forEach((l, idx) => {
            context.textAlign = "left";
            context.fillText(l, padding, currentY + (idx * 20));
        });

        // Draw amount (only on the first line)
        context.textAlign = "right";
        context.fillText(
            `${transaction.type.toLowerCase() === 'income' ? '+' : ''}${formatRupiah(transaction.amount, false)}`,
            width - padding,
            currentY
        );

        // Move down depending on how many lines were drawn
        currentY += lines.length * 20 + 5;

        // Update total
        totalAmount = transaction.type.toLowerCase() === 'expense'
            ? totalAmount - transaction.amount
            : totalAmount + transaction.amount;

        // Reset alignment for next row
        context.textAlign = "left";
    });

    currentY += 10;

    // Dashed line
    context.setLineDash([5, 3]);
    context.beginPath();
    context.moveTo(padding, currentY);
    context.lineTo(width - padding, currentY);
    context.stroke();
    context.setLineDash([]);
    currentY += 40;

    // Total
    context.font = "bold 22px Arial";
    context.fillStyle = "#000000";
    context.fillText("Total:", padding, currentY);
    context.textAlign = "right";
    context.fillText(`${formatRupiah(totalAmount)}`, width - padding, currentY);
    currentY += 40;

    // Stamping
    const stampImage = await loadImage("./assets/stamp-1.png");
    context.save(); // Save current state
    context.globalAlpha = 0.5; // Make it slightly transparent
    context.translate(width / 1.4, currentY - 45); // Move pivot point to center of receipt
    context.rotate(-30 * Math.PI / 180); // Rotate -15 degrees
    // context.drawImage(stampImage, -stampImage.width / 4, -stampImage.height / 4, stampImage.width, stampImage.height);
    const stampSize = 100
    context.drawImage(stampImage, -stampSize / 2, -stampSize / 2, stampSize, stampSize);
    context.restore(); // Restore to avoid affecting other drawings

    currentY += 40;

    return canvas.toBuffer("image/png");
};

module.exports = generateTransactionImage;
