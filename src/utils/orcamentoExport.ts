import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { runWithPdfThemeExport } from './themeService';

export interface EspelhoCaptureResult {
  pngDataUrl: string;
  width: number;
  height: number;
}

async function waitForVisualSettlement(): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore font loading timeout
    }
  }
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 24);
      });
    });
  });
}

let colorNormalizerCtx: CanvasRenderingContext2D | null = null;

function resolveCssColorToRgba(value: string): string {
  if (!value || (!value.includes('oklch') && !value.includes('oklab') && !value.includes('color-mix'))) {
    return value;
  }
  try {
    if (!colorNormalizerCtx && typeof document !== 'undefined') {
      const c = document.createElement('canvas');
      c.width = 1;
      c.height = 1;
      colorNormalizerCtx = c.getContext('2d');
    }
    if (!colorNormalizerCtx) return value;

    const probe = document.createElement('span');
    probe.style.color = value;
    probe.style.display = 'none';
    document.body.appendChild(probe);
    const computed = getComputedStyle(probe).color;
    document.body.removeChild(probe);

    if (computed && !computed.includes('oklch') && !computed.includes('oklab')) {
      return computed;
    }
    colorNormalizerCtx.fillStyle = '#000000';
    colorNormalizerCtx.fillStyle = value;
    return colorNormalizerCtx.fillStyle;
  } catch {
    return value;
  }
}

function sanitizeClonedNodeColorsForHtml2Canvas(originalRoot: HTMLElement, clonedRoot: HTMLElement): void {
  const origElements = [originalRoot, ...Array.from(originalRoot.querySelectorAll('*'))];
  const cloneElements = [clonedRoot, ...Array.from(clonedRoot.querySelectorAll('*'))];
  const props = [
    'color',
    'backgroundColor',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
    'outlineColor',
    'fill',
    'stroke',
  ] as const;

  const len = Math.min(origElements.length, cloneElements.length);
  for (let i = 0; i < len; i++) {
    const origEl = origElements[i] as HTMLElement;
    const cloneEl = cloneElements[i] as HTMLElement;
    if (!origEl || !cloneEl || !cloneEl.style) continue;
    const cs = getComputedStyle(origEl);
    for (const prop of props) {
      const val = cs[prop];
      if (val && (val.includes('oklch') || val.includes('oklab') || val.includes('color-mix'))) {
        (cloneEl.style as any)[prop] = resolveCssColorToRgba(val);
      }
    }
  }
}

export async function captureEspelhoToPng(element: HTMLElement): Promise<EspelhoCaptureResult> {
  await waitForVisualSettlement();

  const rect = element.getBoundingClientRect();
  const captureWidth = Math.max(
    Math.round(element.offsetWidth || rect.width || element.scrollWidth || 1040),
    960
  );
  const captureHeight = Math.max(
    Math.round(element.offsetHeight || element.scrollHeight || rect.height || 600),
    200
  );

  const captureStyle: Partial<CSSStyleDeclaration> = {
    margin: '0',
    transform: 'none',
    boxShadow: 'none',
    width: `${captureWidth}px`,
    minWidth: `${captureWidth}px`,
    maxWidth: `${captureWidth}px`,
    overflow: 'hidden',
  };

  try {
    const pngDataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: false,
      width: captureWidth,
      height: captureHeight,
      canvasWidth: captureWidth * 2,
      canvasHeight: captureHeight * 2,
      style: captureStyle,
    });
    return { pngDataUrl, width: captureWidth, height: captureHeight };
  } catch (errWithFonts) {
    try {
      const pngDataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: false,
        skipFonts: true,
        width: captureWidth,
        height: captureHeight,
        canvasWidth: captureWidth * 2,
        canvasHeight: captureHeight * 2,
        style: captureStyle,
      });
      return { pngDataUrl, width: captureWidth, height: captureHeight };
    } catch (errSkipFonts) {
      console.warn('toPng falhou, utilizando fallback html2canvas:', errWithFonts, errSkipFonts);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: captureWidth,
        height: captureHeight,
        windowWidth: captureWidth,
        windowHeight: captureHeight,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const clonedEl = element.id
            ? clonedDoc.getElementById(element.id)
            : (clonedDoc.body.firstElementChild as HTMLElement | null);
          if (clonedEl) {
            clonedEl.style.margin = '0';
            clonedEl.style.transform = 'none';
            clonedEl.style.boxShadow = 'none';
            clonedEl.style.width = `${captureWidth}px`;
            clonedEl.style.minWidth = `${captureWidth}px`;
            clonedEl.style.maxWidth = `${captureWidth}px`;
            clonedEl.style.overflow = 'hidden';
            sanitizeClonedNodeColorsForHtml2Canvas(element, clonedEl);
          }
        },
      });
      return {
        pngDataUrl: canvas.toDataURL('image/png'),
        width: captureWidth,
        height: captureHeight,
      };
    }
  }
}

export async function convertPngDataUrlToJpg(pngDataUrl: string, quality = 0.96): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Contexto 2D indisponível'));
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Falha ao converter imagem para JPG'));
    img.src = pngDataUrl;
  });
}

function triggerDataUrlDownload(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportEspelhoToImage(
  element: HTMLElement,
  filename: string,
  format: 'png' | 'jpg' = 'png'
): Promise<void> {
  const { pngDataUrl } = await captureEspelhoToPng(element);
  if (format === 'jpg') {
    const jpgDataUrl = await convertPngDataUrlToJpg(pngDataUrl, 0.96);
    triggerDataUrlDownload(jpgDataUrl, filename);
  } else {
    triggerDataUrlDownload(pngDataUrl, filename);
  }
}

export async function copyEspelhoImageToClipboard(element: HTMLElement): Promise<boolean> {
  const { pngDataUrl } = await captureEspelhoToPng(element);
  const res = await fetch(pngDataUrl);
  const blob = await res.blob();
  if (blob && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  }
  return false;
}

export async function exportEspelhoToPdf(element: HTMLElement, filename: string): Promise<void> {
  const { pngDataUrl, width, height } = await runWithPdfThemeExport(async () => {
    await waitForVisualSettlement();
    return captureEspelhoToPng(element);
  });

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 6;
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;

  const imgWidthMm = width * 0.264583;
  const imgHeightMm = height * 0.264583;
  const scale = Math.min(availableWidth / imgWidthMm, availableHeight / imgHeightMm);

  const renderWidth = imgWidthMm * scale;
  const renderHeight = imgHeightMm * scale;
  const posX = (pageWidth - renderWidth) / 2;
  const posY = (pageHeight - renderHeight) / 2;

  pdf.addImage(pngDataUrl, 'PNG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');
  pdf.save(filename);
}
