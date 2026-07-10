# Windows Forensic Artifacts

## Core Artifact Map
| Artifact | Location | Reveals |
|---|---|---|
| Registry hives | `SYSTEM`, `SOFTWARE`, `SAM`, `SECURITY`, `NTUSER.DAT` | Installed software, USB history, user activity, account info |
| Prefetch | `C:\Windows\Prefetch\*.pf` | Program execution history + run count + last-run time |
| Amcache | `C:\Windows\AppCompat\Programs\Amcache.hve` | Executed binaries, even after deletion, with SHA1 hashes |
| ShimCache/AppCompatCache | Inside `SYSTEM` hive | Evidence of file execution (contested — presence isn't 100% proof of execution) |
| Event Logs | `C:\Windows\System32\winevt\Logs\*.evtx` | Logins (4624/4625), process creation (4688), service installs (7045) |
| Recycle Bin | `$Recycle.Bin\<SID>\` | Deleted files with original path + delete timestamp via `$I` files |
| LNK files | `%APPDATA%\Microsoft\Windows\Recent\` | Recently accessed files, even from removable media |
| Jump Lists | `%APPDATA%\...\AutomaticDestinations\` | App-specific recent file/target history |

## Key Event IDs to Filter On
- **4624/4625** — successful/failed logon (check Logon Type: 3 = network, 10 = RDP)
- **4688** — process creation (enable command-line auditing to get full command args)
- **4720** — user account created
- **7045** — new service installed (classic persistence indicator)
- **1102** — audit log cleared (huge red flag — attacker covering tracks)

## Registry Highlights
- `NTUSER.DAT\Software\Microsoft\Windows\CurrentVersion\Explorer\RunMRU` — typed commands in Run dialog.
- `SYSTEM\CurrentControlSet\Enum\USBSTOR` — USB device history.
- `SOFTWARE\Microsoft\Windows\CurrentVersion\Run` (and `RunOnce`) — classic autorun persistence location.

## Volume Shadow Copies
- Often overlooked source of historical file state. List and mount with `vssadmin list shadows` (live system) or carve from an image with tools like `vshadowmount`.

## Quick Triage Workflow
1. Pull registry hives + key `.evtx` logs + Prefetch + Amcache via a triage tool (KAPE, or manual `robocopy` with `/b`).
2. Build a timeline correlating process creation (4688) with Prefetch last-run and file-system MACB times.
3. Cross-reference any suspicious binary hash against Amcache/ShimCache to establish first-seen time.