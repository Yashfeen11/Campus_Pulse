import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { extractTextFromImage } from '@/lib/ocr';
import { extractNoticeLocally } from '@/lib/localExtractor';

describe('OCR text notice extraction on check_image.jpeg', () => {
  it('reads check_image.jpeg and extracts authentic Voyager poster text', async () => {
    const imgPath = path.resolve(process.cwd(), 'check_image.jpeg');
    const imageBase64 = fs.readFileSync(imgPath).toString('base64');

    const ocrText = await extractTextFromImage(imageBase64);
    expect(ocrText.length).toBeGreaterThan(50);
    expect(ocrText).toContain('MORADABAD');

    const notice = extractNoticeLocally(ocrText, '2026-10-31');

    expect(notice.title).toContain('Voyager');
    expect(notice.title).toContain('Moradabad Institute of Technology');
    expect(notice.category).toBe('Cultural');
    expect(notice.date).toBe('2026-11-20');
    expect(notice.venue).toBe('Moradabad Institute of Technology');
    expect(notice.importantRules.some((r) => r.includes('mitvoyager1@gmail.com'))).toBe(true);
    expect(notice.importantRules.some((r) => r.includes('9719046255'))).toBe(true);
  }, 30000);
});

