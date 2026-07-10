# Windows Privilege Escalation Checklist

## System Info
```powershell
systeminfo
whoami /priv                    # look for SeImpersonatePrivilege, SeBackupPrivilege, SeDebugPrivilege
whoami /groups
```

## Automated Enumeration
```powershell
winPEAS.exe
Invoke-PrivescCheck            # PowerShell module
```

## Manual Checks
- [ ] Dangerous privileges in `whoami /priv` (`SeImpersonatePrivilege` → Potato-family exploits; `SeBackupPrivilege` → read SAM/registry directly)
- [ ] Unquoted service paths: `wmic service get name,pathname,startmode | findstr /i /v "C:\Windows"`
- [ ] Weak service permissions (can you reconfigure a service binary path?): `accesschk.exe -uwcqv "Authenticated Users" *`
- [ ] AlwaysInstallElevated registry keys set (both HKLM and HKCU) → arbitrary MSI runs as SYSTEM
- [ ] Scheduled tasks running as SYSTEM pointing to a writable script/binary
- [ ] Stored credentials: `cmdkey /list`, browser saved passwords, `unattend.xml` leftovers, PowerShell history
- [ ] DPAPI-protected secrets you can decrypt with the current user's context
- [ ] Registry autoruns writable by current user
- [ ] Token impersonation opportunities via named pipes if you have `SeImpersonatePrivilege`

## Quick Wins Table
| Finding | Exploit approach |
|---|---|
| `SeImpersonatePrivilege` enabled | PrintSpoofer / GodPotato / RoguePotato → SYSTEM shell |
| AlwaysInstallElevated = 1 (both hives) | Build malicious MSI with `msfvenom -f msi`, run it |
| Unquoted path + writable directory | Drop malicious `.exe` in the writable segment of the path |
| Service binary replaceable | Swap binary for a payload, restart service |
| `SeBackupPrivilege` | Use `robocopy /b` to read protected SAM/SYSTEM hives directly |

## Credential Hunting Locations
- `C:\Windows\Panther\Unattend.xml` and `sysprep.inf`
- PowerShell history: `(Get-PSReadlineOption).HistorySavePath`
- IIS `web.config` files for connection strings
- Group Policy Preferences (`SYSVOL\...\Groups.xml`) — historically stored a reversible-encrypted password