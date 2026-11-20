import { z } from 'zod';

export const registerSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Bitte gib deinen Namen ein.')
		.max(100, 'Der Name darf höchstens 100 Zeichen lang sein.'),
	email: z
		.string()
		.trim()
		.toLowerCase()
		.max(254, 'Die E-Mail-Adresse ist zu lang.')
		.pipe(z.email('Bitte gib eine gültige E-Mail-Adresse ein.')),
	password: z
		.string()
		.min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.')
		.max(128, 'Das Passwort darf höchstens 128 Zeichen lang sein.')
});

export const loginSchema = z.object({
	email: z
		.string()
		.trim()
		.toLowerCase()
		.pipe(z.email('Bitte gib eine gültige E-Mail-Adresse ein.')),
	password: z.string().min(1, 'Bitte gib dein Passwort ein.')
});
