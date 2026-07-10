# Phishing Methodology

Framework for planning an authorized phishing engagement (assumed-breach or social-engineering scope only — always confirm written authorization first).

## 1. Pretext Design
- Base the pretext on real recon: recent company news, internal tool names, org chart, IT ticketing system name.
- Match urgency/tone to what actually gets people to click: password expiry notices, shared document links, and calendar invites consistently outperform generic "you won the lottery" style lures.

## 2. Infrastructure Setup
- Register a lookalike domain (homograph or same-TLD-different-word) — check it's not already flagged by threat-intel feeds.
- Configure SPF/DKIM/DMARC on the sending domain so mail doesn't bounce or land flagged as spoofed.
- Warm up the domain's reputation for a few days before the campaign if the timeline allows.

## 3. Payload Delivery Options
| Vector | Detection risk | Notes |
|---|---|---|
| Credential harvesting page | Medium | Clone target's real login page, capture creds, redirect to real site |
| Malicious document (macro) | High (AV/EDR) | Needs signed macros or sandbox-evasion for modern environments |
| Link to "internal" file share | Low | Often bypasses attachment scanning entirely |
| OAuth consent phishing | Low | Abuses legitimate app-consent flow, no malware needed |

## 4. Tracking
- Unique tracking links per recipient to measure click-through without alerting the whole org at once.
- Log timestamp, source IP, and user-agent of every interaction for the report.

## 5. Detecting Your Own Phish (Defensive Angle)
Teach clients to look for:
- Sender domain that's *almost* right (0 vs O, rn vs m, added hyphen).
- Urgency + a link + a request for credentials, all in the same email.
- Hovering over links to check the actual destination before clicking.

## 6. Reporting
- Click rate, credential-submission rate, and report rate (how many employees flagged it to security) — report rate is the metric that actually shows security-culture maturity, not just click rate.