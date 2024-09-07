import { jsPDF } from "jspdf";

// Type definition for the function parameters
interface AlignedTextOptions {
    pdf: jsPDF;
    text: string;
    fontSize: number;
    alignment?: "left" | "right" | "center";
    leftMargin?: number;
    rightMargin?: number;
    yPosition: number;
    underline?: boolean;
    underlineWidth?: number;
}

// Function to add aligned and formatted text to a PDF
export const addAlignedText = ({
    pdf,
    text,
    fontSize,
    alignment = "center",
    leftMargin = 20,
    rightMargin = 20,
    yPosition,
    underline = false,
    underlineWidth = 0.5,
}: AlignedTextOptions): void => {
    // Set font size
    pdf.setFontSize(fontSize);

    // Get the text width and page width
    const textWidth = pdf.getTextWidth(text);
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Calculate x position based on alignment
    let x: number;
    switch (alignment) {
        case "left":
            x = leftMargin;
            break;
        case "right":
            x = pageWidth - rightMargin - textWidth;
            break;
        case "center":
        default:
            x = (pageWidth - textWidth) / 2;
            break;
    }

    // Add the text to the PDF
    pdf.text(text, x, yPosition);

    // Draw underline if enabled
    if (underline) {
        const underlineY = yPosition + 2; // y position of the underline (slightly below the text)
        pdf.setLineWidth(underlineWidth); // width of the underline
        pdf.line(x, underlineY, x + textWidth, underlineY);
    }
};
