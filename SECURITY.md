# Security Policy

## Supported versions

Security fixes target the latest deployed version and the `main` branch. Older commits and forks are not supported.

## Report a vulnerability

Do not open a public issue for a suspected vulnerability.

Use [GitHub private vulnerability reporting](https://github.com/meowdiocre/Web/security/advisories/new) when available. If it is unavailable, email `personal@meowdiocre.net`.

Include:

- A clear description of the issue and its impact
- The affected route, component, or commit
- Reproduction steps or a minimal proof of concept
- Required account state or environment details
- A suggested fix, if known

Use test data only. Do not include credentials, access tokens, private content, or personal data in the report.

## In scope

- Authentication, sessions, and administrator authorization
- Draft previews and scheduled publishing
- Media uploads and file validation
- Cross-site scripting, request forgery, injection, and server-side request forgery
- Unauthorized access to drafts, published content, or administrator actions
- Exposure of secrets or sensitive environment data

## Out of scope

- Denial-of-service or high-volume automated testing
- Social engineering or physical attacks
- Self-XSS that cannot affect another user
- Vulnerabilities in third-party services without a project-specific exploit
- Reports based only on missing headers without a practical security impact
- Issues that require an already compromised administrator account

## Testing rules

- Test only accounts and data you own.
- Do not access, modify, or delete another person's data.
- Do not upload malware or destructive payloads.
- Stop testing if you encounter private data or gain unexpected access.
- Keep request volume low and avoid disrupting the deployed site.

## Disclosure

Allow time for investigation and a fix before public disclosure. Security reports and reporter details remain private unless disclosure is agreed upon.
