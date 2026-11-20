import { z } from 'zod';

// Email addresses are compared trimmed and lowercased everywhere.
export const emailField = z
	.string()
	.trim()
	.toLowerCase()
	.max(254, 'Die E-Mail-Adresse ist zu lang.')
	.pipe(z.email('Bitte gib eine gültige E-Mail-Adresse ein.'));
