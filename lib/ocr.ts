import { createWorker } from 'tesseract.js';
import sharp from 'sharp';

/**
 * Server-side OCR engine using Sharp + Tesseract.js
 * Preprocesses poster images with grayscale normalization and contrast sharpening
 * to cleanly extract small text, dates, emails, and coordinator contact details.
 */
export async function extractTextFromImage(base64Data: string): Promise<string> {
  if (!base64Data || typeof base64Data !== 'string') {
    return '';
  }

  let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

  try {
    const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z+]+;base64,/, '').trim();
    const rawBuffer = Buffer.from(cleanBase64, 'base64');

    let processedBuffer = rawBuffer;
    try {
      processedBuffer = await sharp(rawBuffer)
        .greyscale()
        .normalize()
        .sharpen()
        .toBuffer();
    } catch (sharpError) {
      console.warn('[OCR Engine] Sharp preprocessing skipped, using raw buffer:', sharpError);
      processedBuffer = rawBuffer;
    }

    worker = await createWorker('eng');
    const result = await worker.recognize(processedBuffer);
    const extractedText = result?.data?.text ? result.data.text.trim() : '';

    return extractedText;
  } catch (error) {
    console.error('[OCR Engine] Error extracting text from image:', error);
    return '';
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // Safe cleanup
      }
    }
  }
}

