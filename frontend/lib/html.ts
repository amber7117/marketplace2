import sanitize from 'sanitize-html';

const defaultOptions: sanitize.IOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'span', 'div'
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    span: ['class'],
    div: ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
};

export function sanitizeHtml(dirty: string, options?: sanitize.IOptions): string {
  return sanitize(dirty, { ...defaultOptions, ...options });
}

export function stripHtml(dirty: string): string {
  return sanitize(dirty, { allowedTags: [], allowedAttributes: {} });
}
