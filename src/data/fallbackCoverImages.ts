/**
 * Cover-image overrides for specific published slugs that don't have a
 * real photo in the Sheet yet — dummy imagery picked for the site's warm,
 * field-photography tone until a real photo replaces it. Keyed by the
 * exact slug (see rowToArticle in lib/sheets.ts) so it only affects the
 * articles listed here; every other article without a Sheet-provided
 * image still renders as one of the plain text card variants.
 */
export const FALLBACK_COVER_IMAGES: Record<string, string> = {
  'facilitator-field-guide-running-strength-naming-sessions-in-low-resource-settings':
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
};
