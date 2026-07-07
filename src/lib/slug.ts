export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .slice(0, 60)
    .replace(/^-+|-+$/g, '');
}

export function generatePropertySlug(title: string, city: string): string {
  const base = slugify([title, city].filter(Boolean).join(' '));
  const suffix = Math.random().toString(36).slice(2, 7);
  return base ? `${base}-${suffix}` : `propiedad-${suffix}`;
}

export function generateId(prefix = 'prop'): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}
