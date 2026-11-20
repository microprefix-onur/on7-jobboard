import { z } from 'zod';

export const jobPostingSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, { error: 'Bitte gib einen Titel ein.', abort: true })
		.min(3, 'Der Titel muss mindestens 3 Zeichen lang sein.')
		.max(120, 'Der Titel darf höchstens 120 Zeichen lang sein.'),
	description: z
		.string()
		.trim()
		.min(1, 'Bitte gib eine Beschreibung ein.')
		.max(10_000, 'Die Beschreibung darf höchstens 10.000 Zeichen lang sein.')
});

export type JobPostingInput = z.input<typeof jobPostingSchema>;

export const postingStatusSchema = z.object({
	status: z.enum(['open', 'closed'], 'Bitte wähle einen gültigen Status.')
});
