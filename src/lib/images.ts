// Utilidades de imágenes. Hoy las fotos se guardan como data URLs
// redimensionadas; cuando exista un storage real (S3/Cloudinary), este módulo
// es el único punto a cambiar: subir el archivo y devolver la URL pública.
const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.82;

export const MAX_PHOTOS = 10;
export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

export const PHOTO_TITLE_SUGGESTIONS = [
  'Fachada',
  'Sala',
  'Cocina',
  'Comedor',
  'Recámara principal',
  'Recámara',
  'Baño',
  'Entrada',
  'Patio',
  'Estacionamiento',
  'Vista'
];

export async function fileToOptimizedDataUrl(file: File): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);

  try {
    return await downscaleImage(dataUrl);
  } catch {
    return dataUrl;
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function downscaleImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));

      if (scale >= 1) {
        resolve(dataUrl);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);

      const context = canvas.getContext('2d');
      if (!context) {
        resolve(dataUrl);
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };

    image.onerror = () => reject(new Error('No se pudo procesar la imagen.'));
    image.src = dataUrl;
  });
}
