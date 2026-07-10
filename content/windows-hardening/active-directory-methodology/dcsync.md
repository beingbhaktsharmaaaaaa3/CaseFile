# DCSync

## Concept
DCSync abuses the Directory Replication Service (DRS) Remote Protocol — the same protocol real Domain Controllers use to replicate data with each other. Any account holding the `Replicating Directory Changes` and `Replicating Directory Changes All` extended rights can impersonate a Domain Controller and request password hash data for any account, including `krbtgt`, without ever touching the actual DC's disk or running code on it.

## Requirements
Both of these AD extended rights, typically granted to Domain Admins/Enterprise Admins by default, but sometimes over-delegated to service accounts or "helpdesk" groups by mistake:
- `DS-Replication-Get-Changes`
- `DS-Replication-Get-Changes-All`

## Checking If Your Compromised Account Has These Rights
```powershell
Get-DomainObjectAcl -DistinguishedName "DC=domain,DC=local" | Where-Object {$_.ObjectType -match 'Replication'}
```
Or visually via BloodHound — the "Owned" account's outbound edges will show a `DCSync` capability directly if applicable, often as the final step of a longer ACL-abuse attack path.

## Executing DCSync
```bash
# Impacket
secretsdump.py domain.local/user:pass@<dc-ip> -just-dc

# Mimikatz (Windows, run from any domain-joined host as the privileged account)
mimikatz # lsadump::dcsync /domain:domain.local /user:domain\krbtgt
```

## What You Get
- NTLM hashes for every account in the domain, in one request.
- The `krbtgt` hash specifically — this is the direct path to forging a Golden Ticket.
- Kerberos keys (AES128/256) alongside NTLM, useful for building tickets that avoid the weaker/more detectable RC4 encryption type.

## Targeted DCSync (Stealthier Than Dumping the Whole Domain)
```bash
secretsdump.py domain.local/user:pass@<dc-ip> -just-dc-user targetuser
```
Pulling a single high-value account's hash generates far less anomalous replication traffic than a full-domain dump, reducing detection likelihood while still achieving the objective for a targeted attack path.

## Why This Is Such a Critical Finding
Unlike most credential-theft techniques, DCSync requires no code execution on the DC and no direct file access to NTDS.dit — it looks, at the protocol level, exactly like normal DC-to-DC replication traffic. This makes it one of the quieter ways to achieve full domain compromise once the necessary ACL rights are obtained (whether legitimately over-delegated, or via prior ACL abuse as described in ACL/ACE abuse techniques).

## Detection Awareness (for defensive reports)
- Event ID 4662 with the specific GUIDs for `DS-Replication-Get-Changes`/`DS-Replication-Get-Changes-All`, sourced from a **non-Domain-Controller** IP address — this is the single clearest DCSync detection signal, since legitimate replication only ever originates from actual DCs.
- Recommend: audit which accounts hold these replication rights (should be an extremely short, tightly controlled list), and alert specifically on replication requests originating from non-DC hosts.