# Linux Forensics

## Live Response (if the box is still running)
```bash
# Volatile info first
w; who; last -a
ps auxf
netstat -tulpn 2>/dev/null || ss -tulpn
lsof -i
cat /proc/*/cmdline 2>/dev/null   # command line of every running process
```

## Key Artifact Locations
| Artifact | Location |
|---|---|
| Auth logs | `/var/log/auth.log` (Debian/Ubuntu), `/var/log/secure` (RHEL/CentOS) |
| Shell history | `~/.bash_history`, `~/.zsh_history` — check for `HISTFILE` tampering/unset |
| Cron jobs | `/etc/crontab`, `/etc/cron.*/`, `/var/spool/cron/` |
| Systemd persistence | `/etc/systemd/system/`, `systemctl list-unit-files` |
| SSH keys/config | `~/.ssh/authorized_keys`, `~/.ssh/config` |
| Package install history | `/var/log/dpkg.log`, `/var/log/yum.log` |
| Web server logs | `/var/log/apache2/`, `/var/log/nginx/` |
| Login records | `/var/log/wtmp` (`last`), `/var/log/btmp` (`lastb`, failed logins) |

## Persistence Hunting
- Compare `/etc/passwd` and `/etc/shadow` against a known-good baseline — look for unexpected UID 0 accounts.
- Check `LD_PRELOAD` and `/etc/ld.so.preload` for rootkit-style library injection.
- Enumerate SUID/SGID binaries and diff against a baseline: `find / -perm -4000 -type f 2>/dev/null`.
- Check for hidden/renamed processes: compare `ps` output against `/proc/*/exe` symlink targets.

## Timeline Building
```bash
# File system timeline via mactime (from The Sleuth Kit)
fls -r -m / /path/to/image.dd > bodyfile.txt
mactime -b bodyfile.txt -d > timeline.csv
```

## Log Analysis Tips
- `journalctl` on systemd systems preserves far more than flat log files — check `journalctl --since` / `--until` for a bounded window, and `journalctl -k` for kernel-level events (useful for detecting kernel module loads).
- Correlate `auth.log` SSH logins with `wtmp`/`btmp` — discrepancies suggest log tampering.

## Anti-Forensic Indicators
- Gaps in log files (deleted entries leave sequence-number or timestamp gaps).
- `history -c` in shell history, or a suspiciously short/empty `.bash_history` on an account clearly in active use.
- Timestomping: file MAC times that don't match surrounding filesystem activity (compare against `$MFT`/inode change times where possible).