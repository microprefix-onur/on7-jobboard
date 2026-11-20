// Creates demo data: a recruiter you can log in as, open and closed job postings, and applications.
// Run on demand with `pnpm db:seed`, or inside the app container with `node scripts/seed.js`.
import { randomUUID } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import postgres from 'postgres';

const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'demo1234';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

const sql = postgres(url, { max: 1, onnotice: () => {} });

try {
	const [existing] = await sql`
		select u.id, exists(select 1 from job_posting p where p.recruiter_id = u.id) as has_postings
		from "user" u where u.email = ${DEMO_EMAIL}`;
	if (existing?.has_postings) {
		console.log(`Demo data already exists (${DEMO_EMAIL}); nothing to do.`);
	} else if (existing) {
		console.error(
			`${DEMO_EMAIL} is already registered without demo data. Delete that account or seed a fresh database.`
		);
		process.exitCode = 1;
	} else {
		await sql.begin(seed);
		console.log(`Demo data created. Log in as ${DEMO_EMAIL} / ${DEMO_PASSWORD}.`);
	}
} finally {
	await sql.end();
}

/** @param {import('postgres').TransactionSql} tx */
async function seed(tx) {
	// The same rows better-auth's email-and-password sign-up writes: a user and a credential account
	// (see better-auth/dist/api/routes/sign-up.mjs, checked against better-auth 1.7).
	const recruiterId = randomUUID();
	await tx`
		insert into "user" (id, name, email, email_verified)
		values (${recruiterId}, 'Demo Recruiter', ${DEMO_EMAIL}, false)`;
	await tx`
		insert into account (id, account_id, provider_id, user_id, password, updated_at)
		values (${randomUUID()}, ${recruiterId}, 'credential', ${recruiterId},
			${await hashPassword(DEMO_PASSWORD)}, now())`;

	// Status values must match postingStatuses and applicationStatuses in src/lib/schemas/.
	const postings = [
		{
			title: 'Backend-Entwickler (m/w/d)',
			description:
				'Du baust mit uns an einer SvelteKit-Anwendung mit PostgreSQL.\n\nErfahrung mit TypeScript ist ein Plus.',
			status: 'open',
			applications: [
				{
					applicantName: 'Lena Fischer',
					status: 'new',
					coverText: 'Ich arbeite seit drei Jahren mit TypeScript.'
				},
				{
					applicantName: 'Murat Yilmaz',
					status: 'invited',
					coverText: 'Postgres ist mein Lieblingswerkzeug.'
				},
				{
					applicantName: 'Sophie Wagner',
					status: 'rejected',
					coverText: 'Ich suche eine Stelle in Teilzeit.'
				}
			]
		},
		{
			title: 'UX-Designerin (m/w/d)',
			description: 'Du gestaltest einfache, klare Oberflächen.\nRemote möglich.',
			status: 'open',
			applications: [
				{
					applicantName: 'Jonas Becker',
					status: 'new',
					coverText: 'Hier ist mein Portfolio: Figma, Prototypen, Tests.'
				}
			]
		},
		{
			title: 'Werkstudent Marketing (m/w/d)',
			description: 'Diese Stelle ist bereits besetzt.',
			status: 'closed',
			applications: [
				{
					applicantName: 'Clara Hoffmann',
					status: 'invited',
					coverText: 'Ich studiere Medienwirtschaft.'
				}
			]
		}
	];

	for (const posting of postings) {
		/** @type {{ id: string }[]} */
		const [{ id }] = await tx`
			insert into job_posting (recruiter_id, title, description, status)
			values (${recruiterId}, ${posting.title}, ${posting.description}, ${posting.status})
			returning id`;
		for (const application of posting.applications) {
			const email = `${application.applicantName.toLowerCase().replaceAll(' ', '.')}@example.com`;
			await tx`
				insert into application (job_posting_id, applicant_name, applicant_email, cover_text, status)
				values (${id}, ${application.applicantName}, ${email}, ${application.coverText}, ${application.status})`;
		}
	}
}
