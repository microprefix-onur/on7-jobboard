import { z } from 'zod';
import { emailField } from './fields';

export const registerSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Bitte gib deinen Namen ein.')
		.max(100, 'Der Name darf höchstens 100 Zeichen lang sein.'),
	email: emailField,
	password: z
		.string()
		.min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.')
		.max(128, 'Das Passwort darf höchstens 128 Zeichen lang sein.')
});

export const loginSchema = z.object({
	email: emailField,
	password: z.string().min(1, 'Bitte gib dein Passwort ein.')
});
