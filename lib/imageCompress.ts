/**
 * Client-side image resize and compression utility using HTML5 <canvas>
 * Resizes images to max 800px width (JPEG 0.7 quality) to avoid Vercel's 4.5MB body limit.
 */
export interface CompressedImageResult {
  base64: string; // Clean base64 string or data URL
  mimeType: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  width: number;
  height: number;
}

export function compressImageFile(
  file: File,
  maxWidth = 800,
  quality = 0.7
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          let { width, height } = img;

          // Scale down if width exceeds maxWidth
          if (width > maxWidth) {
            const scale = maxWidth / width;
            width = maxWidth;
            height = Math.round(height * scale);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Failed to get 2D canvas rendering context.'));
          }

          // Optional: fill white background in case of transparent PNG converted to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);

          // Export as JPEG with 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          const compressedSizeBytes = Math.round((dataUrl.length * 3) / 4);

          // Clean up
          canvas.width = 0;
          canvas.height = 0;

          resolve({
            base64: dataUrl,
            mimeType: 'image/jpeg',
            originalSizeBytes: file.size,
            compressedSizeBytes,
            width,
            height,
          });
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image into memory for compression.'));
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        reject(new Error('Failed to read file data.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading the image file.'));
    };

    reader.readAsDataURL(file);
  });
}
