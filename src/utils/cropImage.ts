export interface NormalizedCropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(imageUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load image for cropping'));
    image.src = imageUrl;
  });
}

export async function cropImageToPngFile(
  imageUrl: string,
  crop: NormalizedCropArea,
  filename = 'product-subject.png'
): Promise<File> {
  const image = await loadImage(imageUrl);
  const sourceX = Math.round(crop.x * image.naturalWidth);
  const sourceY = Math.round(crop.y * image.naturalHeight);
  const sourceWidth = Math.max(1, Math.round(crop.width * image.naturalWidth));
  const sourceHeight = Math.max(1, Math.round(crop.height * image.naturalHeight));
  const maxOutputEdge = 1800;
  const outputScale = Math.min(1, maxOutputEdge / Math.max(sourceWidth, sourceHeight));

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(sourceWidth * outputScale));
  canvas.height = Math.max(1, Math.round(sourceHeight * outputScale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable');

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Image crop failed'))),
      'image/png',
      0.96
    );
  });

  return new File([blob], filename, { type: 'image/png' });
}
