export async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  const bitmap = await createImageBitmap(file);
  const maxSize = 1500;
  let { width, height } = bitmap;
  if (width > maxSize || height > maxSize) {
    if (width > height) { height = Math.round(height * maxSize / width); width = maxSize; }
    else { width = Math.round(width * maxSize / height); height = maxSize; }
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  return { base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' };
}

export async function fileToSmallDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxSize = 400;
  let { width, height } = bitmap;
  if (width > maxSize || height > maxSize) {
    if (width > height) { height = Math.round(height * maxSize / width); width = maxSize; }
    else { width = Math.round(width * maxSize / height); height = maxSize; }
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.65);
}

export async function filesToBase64(files: File[]): Promise<Array<{ base64: string; mimeType: string }>> {
  return Promise.all(files.map(fileToBase64));
}

export function bytesToMB(bytes: number): number {
  return Math.round(bytes / 1024 / 1024 * 100) / 100;
}

export function formatMB(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.round(mb * 1024)} KB`;
}
