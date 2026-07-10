# Kerberoasting

## Concept
Any authenticated domain user can request a Kerberos service ticket (TGS) for any account with a registered Service Principal Name (SPN). Part of that ticket is encrypted with the *service account's* password hash — so you can request it, take it offline, and crack it without touching the DC again or triggering a lockout.

## Requirements
- Any valid domain credential (even a low-privilege one).
- Target accounts with an SPN set — usually service accounts, which are notorious for old, weak, rarely-rotated passwords.

## Execution
```bash
# From Linux (Impacket)
GetUserSPNs.py domain.local/user:pass -dc-ip <dc-ip> -request -outputfile hashes.txt

# From Windows (PowerView)
Get-DomainUser -SPN | Get-DomainSPNTicket -Format Hashcat
```

## Cracking
```bash
hashcat -m 13100 hashes.txt rockyou.txt      # RC4-encrypted tickets (etype 23) — fastest to crack
hashcat -m 19600 hashes.txt rockyou.txt      # AES128 tickets
hashcat -m 19700 hashes.txt rockyou.txt      # AES256 tickets — slower, but still crackable if the password is weak
```
RC4 tickets crack dramatically faster than AES ones — if you can choose, or if `msDS-SupportedEncryptionTypes` allows it, RC4-based tickets are the highest-value targets.

## Prioritizing Targets
- Check `Get-DomainUser -SPN` output for accounts with **high privilege** (nested in admin groups) — a Kerberoastable service account that's also a Domain Admin is the single highest-value target you can find in this phase.
- Old accounts with `pwdLastSet` far in the past are statistically far more likely to have weak/never-rotated passwords.

## Targeted Kerberoasting (Stealthier)
Instead of requesting tickets for every SPN account (noisy, triggers Event ID 4769 in bulk), target only the specific accounts BloodHound flagged as high-value.

## Detection Awareness (for defensive reports)
- Event ID 4769 with encryption type 0x17 (RC4) requested by an unusual account, in unusual volume, is the classic detection signature.
- Recommend: enforce AES-only encryption on service accounts, use Managed Service Accounts (gMSA) with auto-rotated 120+ character passwords, and monitor for bulk TGS requests.