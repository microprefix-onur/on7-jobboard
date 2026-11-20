# Job Board

A minimal job board: recruiters publish job postings, and applicants apply to them without an account. German UI labels are given in parentheses.

## People

**Recruiter** (Recruiter):
A person with an account who owns job postings and reviews the applications to them.
_Avoid_: Employer, company, user, admin

**Applicant** (Bewerber):
A person without an account who submits an application, identified only by their email address.
_Avoid_: Candidate, user

## Job Postings

**Job Posting** (Stellenanzeige / Stelle):
An opening with a title and a description, owned by exactly one recruiter.
_Avoid_: Job, listing, ad, vacancy

**Posting Status** (offen / geschlossen):
Whether a job posting is **open** (listed publicly, accepts applications) or **closed** (accepts no applications). Closing replaces deleting.
_Avoid_: Active/inactive, published, archived

## Applications

**Application** (Bewerbung):
An applicant's name, email and cover text for one job posting. At most one per email per job posting.
_Avoid_: Submission, candidacy

**Cover Text** (Kurzer Text / Anschreiben):
The short free-text message an applicant writes in an application.
_Avoid_: Message, motivation, letter

**Application Status** (neu / eingeladen / abgelehnt):
A recruiter's decision on an application: **new**, **invited** or **rejected**. Every application starts as new.
_Avoid_: State, stage, pipeline
