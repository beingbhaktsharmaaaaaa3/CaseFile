# Password Spraying / Brute Force (Active Directory)

## Concept
Instead of brute-forcing many passwords against one account (which triggers lockout fast), password spraying tries **one or a few passwords against many accounts**, staying under the lockout threshold per account while still covering a large userbase — exploiting the statistical certainty that some fraction of any large organization uses a weak, common, or seasonally-predictable password.

## Step 1: Check the Lockout Policy First (Critical — Don't Skip This)
```bash
crackmapexec smb <dc-ip> -u '' -p '' --pass-pol
```
This tells you the lockout threshold and the observation window — your spray interval must stay safely under this to avoid locking out real users, which is both disruptive to the client and a fast way to get an engagement shut down.

## Step 2: Build a Realistic Username List
```bash
kerbrute userenum -d domain.local --dc <dc-ip> usernames.txt      # validates usernames via Kerberos pre-auth, doesn't touch lockout counter
```
Kerberos-based username validation (`kerbrute`) is preferable to guessing blindly, since invalid usernames don't count against any lockout policy — only valid-username-plus-wrong-password attempts do.

## Step 3: Spray Common/Seasonal Passwords
```bash
crackmapexec smb <dc-ip> -u usernames.txt -p 'Summer2026!' --continue-on-success
kerbrute passwordspray -d domain.local --dc <dc-ip> usernames.txt 'Welcome123!'
```
High-yield password patterns in real environments: `<Season><Year>!`, `<CompanyName>123!`, `Password1`, `Welcome1` — these consistently outperform random wordlists against a real corporate userbase.

## Step 4: Space Out Attempts
Wait at least the full lockout observation window between spray rounds against the same set of accounts — e.g., if the policy resets the failure counter every 30 minutes, don't spray a second password sooner than that against the same users.

## Kerberos Pre-Auth Spraying (Lower Noise, Avoids Some Logging)
```bash
kerbrute passwordspray -d domain.local --dc <dc-ip> usernames.txt 'Password1'
```
Kerberos pre-authentication failures are logged differently (and sometimes less prominently) than SMB/NTLM auth failures — worth using as the primary spray vector where possible, both for stealth and because it inherently respects domain lockout policy rather than each protocol tracking it independently.

## Internal vs. External Spraying
- **External** (OWA, VPN portals, O365): often has weaker/less-monitored lockout enforcement than internal AD, and successful creds there frequently also work for the internal domain (password reuse across external-facing services is extremely common).
- **Internal** (SMB/Kerberos directly): higher yield once you have network position, but higher risk of triggering internal SOC alerting if not paced carefully.

## Handling Successful Hits
Once you find valid credentials, immediately pivot to enumeration (BloodHound, `--shares`, `--users`) with that account before spraying further — a single valid low-priv credential often opens up much more efficient, targeted attack paths than continuing to spray blindly.

## Prevention (for reports)
Enforce a reasonable lockout threshold *and* observation window (not zero-tolerance, which enables trivial denial-of-service against users, but not infinite either), require MFA on all external-facing authentication points, and actively monitor/alert on failed-auth patterns spread across many accounts from a single source — the signature of a spray, distinct from normal user typos.