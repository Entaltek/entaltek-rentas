import type { PropertyPhoto } from '../types/property';

export function sortPhotos(photos: PropertyPhoto[]): PropertyPhoto[] {
  return [...photos].sort((a, b) => {
    if (a.isCover !== b.isCover) return a.isCover ? -1 : 1;
    return a.order - b.order;
  });
}

export function getCoverPhoto(photos: PropertyPhoto[]): PropertyPhoto | undefined {
  return sortPhotos(photos)[0];
}

export function normalizePhotoOrder(photos: PropertyPhoto[]): PropertyPhoto[] {
  return photos.map((photo, index) => ({
    ...photo,
    order: index,
    isCover: index === 0
  }));
}
