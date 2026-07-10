# Abusing Active Directory ACLs/ACEs

## Concept
Every AD object (users, groups, GPOs, OUs, computers) has an ACL controlling who can do what to it. Over years of admin turnover and delegation, these accumulate misconfigurations — a "helpdesk" group given `GenericAll` over all users for password resets, then forgotten. BloodHound's entire value proposition is finding these paths automatically.

## High-Value ACE Types
| ACE | What it lets you do |
|---|---|
| `GenericAll` | Full control — reset password, add to group, modify anything |
| `GenericWrite` | Modify most attributes — can be abused to write a Shadow Credential or SPN |
| `WriteOwner` | Change the object's owner to yourself, then grant yourself further rights |
| `WriteDACL` | Modify the object's permissions directly — grant yourself `GenericAll` |
| `AllExtendedRights` | Includes rights like force-password-reset and DCSync (on the domain object) |
| `AddMember` (on a group) | Add any account, including your own, into that group |

## Practical Abuse Examples

### GenericAll on a User → Reset Their Password
```bash
net rpc password "targetuser" "NewPassword123!" -U "domain.local"/"youruser"%"yourpass" -S <dc-ip>
```

### GenericAll on a Group → Add Yourself
```powershell
Add-DomainGroupMember -Identity "Domain Admins" -Members "youruser"
```

### WriteOwner → Take Over an Object
```powershell
Set-DomainObjectOwner -Identity targetobject -OwnerIdentity youruser
Add-DomainObjectAcl -TargetIdentity targetobject -PrincipalIdentity youruser -Rights All
```

### GenericWrite on a Computer → Resource-Based Constrained Delegation
If you have `GenericWrite` on a computer object, you can configure RBCD to let a computer account you control impersonate any user (including Domain Admins) when authenticating to that machine.

### Shadow Credentials (GenericWrite/WriteProperty on msDS-KeyCredentialLink)
Add an attacker-controlled certificate to the target's `msDS-KeyCredentialLink` attribute, then authenticate as that user via PKINIT — doesn't require knowing or resetting their password at all, which is much stealthier.
```bash
certipy shadow auto -account targetuser -u youruser@domain.local -p yourpass
```

## Finding These Paths
```bash
bloodhound-python -u user -p pass -d domain.local -ns <dc-ip> -c All
```
In the BloodHound GUI: mark your compromised account as "Owned," then use the "Shortest Path to Domain Admins" query — it will highlight every ACL abuse chain automatically, including multi-hop ones a human would take much longer to spot manually.

## Defensive Notes (for reports)
Recommend a periodic ACL audit (BloodHound itself is a great free auditing tool for blue teams too), removing stale delegated permissions, and tiering admin accounts so helpdesk-level accounts never have paths to Domain Admin.