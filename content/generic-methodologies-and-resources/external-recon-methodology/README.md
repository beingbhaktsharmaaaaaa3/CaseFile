# External Recon Methodology

Everything you can learn about a target *before* sending a single packet at the "real" infrastructure.

## Domain & DNS
```bash
whois target.com
dig target.com ANY
dig axfr @ns1.target.com target.com   # try a zone transfer, usually fails but worth it
```
- Certificate Transparency logs reveal subdomains that were never meant to be public: `crt.sh?q=%.target.com`
- Passive DNS history (SecurityTrails, VirusTotal) can reveal old IPs behind a WAF/CDN today.

## Subdomain Enumeration
```bash
subfinder -d target.com -all -o subs.txt
amass enum -passive -d target.com
cat subs.txt | httpx -title -status-code -tech-detect
```

## Source Code & Secret Leaks
- GitHub/GitLab dorking: `org:target-company password`, `org:target-company api_key`, check forks and deleted-but-cached commits.
- Check public package registries (npm, PyPI) for internal package names that leak infrastructure naming conventions.
- Pastebin-style sites and public S3/GCS bucket enumeration (`s3scanner`, `gcpbucketbrute`).

## People & Org Structure (for phishing pretext)
- LinkedIn for org chart, tech stack mentioned in job postings, recently-hired employees (less likely to recognize internal norms yet).
- Email format guessing (`first.last@`, `flast@`) validated against breach-data checkers or SMTP `VRFY`/`RCPT TO` probing (careful — noisy).

## Cloud Footprint
- Enumerate cloud assets via naming pattern guesses: `target-prod`, `target-backup`, `target-dev` against S3/Azure Blob/GCS.
- Shodan/Censys queries scoped to the org's known ASN.

## Database/Credential Leaks
- Check if the domain appears in known breach corpora (HaveIBeenPwned API, breach databases) — validates password reuse risk, informs credential-stuffing likelihood during the engagement.

## Output of This Phase
By the end you should have: a subdomain list with live hosts, a technology fingerprint per host, a list of employee emails/naming convention, any leaked secrets, and a rough map of cloud assets — all *before* active scanning begins.