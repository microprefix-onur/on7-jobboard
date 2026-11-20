import { z } from 'zod';
import { emailField } from './fields';

export const applicationStatuses = ['new', 'invited', 'rejected'] as const;

export const applicationSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Bitte gib deinen Namen ein.')
		.max(100, 'Der Name darf höchstens 100 Zeichen lang sein.'),
	email: emailField,
	coverText: z
		.string()
		.trim()
		.min(1, 'Bitte schreib ein paar Sätze zu dir.')
		.max(2000, 'Der Text darf höchstens 2.000 Zeichen lang sein.')
});

export type ApplicationInput = z.input<typeof applicationSchema>;

export const applicationStatusSchema = z.object({
	status: z.enum(applicationStatuses, 'Bitte wähle einen gültigen Status.')
});
