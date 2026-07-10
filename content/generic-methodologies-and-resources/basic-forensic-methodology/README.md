# Digital Forensics Methodology

Core process for any forensic investigation, regardless of the specific artifact type involved.

## 1. Preparation
- Confirm legal authority to investigate (warrant, company policy, incident-response retainer).
- Prepare write-blockers, sterile/wiped storage for images, and a chain-of-custody form template before touching evidence.

## 2. Identification
- Identify all potential evidence sources: disks, RAM, network logs, cloud service logs, mobile devices, removable media.
- Photograph the scene/device state before any interaction if this is a physical seizure.

## 3. Preservation (Chain of Custody)
- Every person who touches the evidence, every timestamp, every transfer — logged. This is what makes evidence admissible later.
- Hash everything immediately after acquisition (MD5 *and* SHA256 — MD5 for legacy tool compatibility, SHA256 for integrity going forward).

```bash
sha256sum evidence.dd > evidence.dd.sha256
md5sum evidence.dd > evidence.dd.md5
```

## 4. Acquisition
- **Disk**: bit-for-bit image via `dd`/`dc3dd`/FTK Imager, never work on the original.
```bash
dc3dd if=/dev/sdb of=evidence.dd hash=sha256 log=acquisition.log
```
- **RAM**: acquire *before* disk if the machine is live — RAM is far more volatile (order of volatility: registers → cache → RAM → disk → backups). Tools: `WinPmem`, `LiME` (Linux), `Magnet RAM Capture`.
- **Network**: pull relevant firewall/proxy/NetFlow logs and any full-packet-capture available for the incident window.

## 5. Analysis
- Work only on a verified copy (re-hash after imaging, compare to original hash).
- Build a timeline — file MACB (Modify/Access/Change/Birth) timestamps, log timestamps, registry timestamps, all normalized to one timezone (UTC recommended).
- Look for the "patient zero": initial access vector, then trace lateral movement / persistence outward from there.

## 6. Documentation & Reporting
- Every finding needs: what you found, where, how you found it (tool + version), and why it matters.
- Write for two audiences simultaneously: a technical appendix or another examiner could reproduce your steps, and an executive summary a non-technical stakeholder can act on.

## Order of Volatility (memorize this)
1. CPU registers, cache
2. RAM (routing table, ARP cache, process table, kernel stats)
3. Network state
4. Running processes
5. Disk
6. Remote logging/monitoring data
7. Physical configuration/network topology
8. Archival media/backups

## Common Pitfalls
- Booting the original suspect disk before imaging (alters timestamps).
- Analyzing on the live/original evidence instead of a working copy.
- Forgetting timezone normalization — a timeline built from mismatched timezones will send you chasing ghosts.