import { toCanvas } from "html-to-image";
import { jsPDF } from "jspdf";

const CERTIFICATE_SELECTOR = "[data-certificate-canvas='true']";

const getCertificateElement = (container: HTMLDivElement | null): HTMLElement | null => {
    if (!container) return null;
    return container.querySelector(CERTIFICATE_SELECTOR);
};

const trimTransparentPadding = (sourceCanvas: HTMLCanvasElement): HTMLCanvasElement => {
    const context = sourceCanvas.getContext("2d", { willReadFrequently: true });
    if (!context) return sourceCanvas;

    const { width, height } = sourceCanvas;
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;

    let top = height;
    let bottom = -1;
    let left = width;
    let right = -1;

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const alpha = data[(y * width + x) * 4 + 3];
            if (alpha === 0) continue;

            if (x < left) left = x;
            if (x > right) right = x;
            if (y < top) top = y;
            if (y > bottom) bottom = y;
        }
    }

    if (right < left || bottom < top) return sourceCanvas;

    const trimmedWidth = right - left + 1;
    const trimmedHeight = bottom - top + 1;
    const trimmedCanvas = document.createElement("canvas");
    trimmedCanvas.width = trimmedWidth;
    trimmedCanvas.height = trimmedHeight;

    const trimmedContext = trimmedCanvas.getContext("2d");
    if (!trimmedContext) return sourceCanvas;

    trimmedContext.drawImage(
        sourceCanvas,
        left,
        top,
        trimmedWidth,
        trimmedHeight,
        0,
        0,
        trimmedWidth,
        trimmedHeight
    );

    return trimmedCanvas;
};

const toOpaqueWhiteCanvas = (sourceCanvas: HTMLCanvasElement): HTMLCanvasElement => {
    const opaqueCanvas = document.createElement("canvas");
    opaqueCanvas.width = sourceCanvas.width;
    opaqueCanvas.height = sourceCanvas.height;

    const context = opaqueCanvas.getContext("2d");
    if (!context) return sourceCanvas;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, opaqueCanvas.width, opaqueCanvas.height);
    context.drawImage(sourceCanvas, 0, 0);

    return opaqueCanvas;
};

const toCertificateCanvas = async (container: HTMLDivElement | null) => {
    const element = getCertificateElement(container);
    if (!element) return null;

    const rawCanvas = await toCanvas(element, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "rgba(0,0,0,0)",
        style: {
            margin: "0",
            boxShadow: "none",
            colorScheme: "light",
        },
    });

    const trimmedCanvas = trimTransparentPadding(rawCanvas);
    return toOpaqueWhiteCanvas(trimmedCanvas);
};

export const downloadCertificatePng = async (
    container: HTMLDivElement | null,
    certificateId: string
) => {
    const canvas = await toCertificateCanvas(container);
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.download = `certificate-${certificateId}.png`;
    link.href = dataUrl;
    link.click();
};

export const downloadCertificatePdf = async (
    container: HTMLDivElement | null,
    certificateId: string
) => {
    const canvas = await toCertificateCanvas(container);
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true,
    });

    const pageWidth = 297;
    const pageHeight = 210;
    const imageRatio = canvas.width / canvas.height;
    const pageRatio = pageWidth / pageHeight;

    let renderWidth = pageWidth;
    let renderHeight = pageHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (imageRatio > pageRatio) {
        renderHeight = pageWidth / imageRatio;
        offsetY = (pageHeight - renderHeight) / 2;
    } else {
        renderWidth = pageHeight * imageRatio;
        offsetX = (pageWidth - renderWidth) / 2;
    }

    pdf.addImage(dataUrl, "PNG", offsetX, offsetY, renderWidth, renderHeight, undefined, "FAST");
    pdf.save(`certificate-${certificateId}.pdf`);
};
