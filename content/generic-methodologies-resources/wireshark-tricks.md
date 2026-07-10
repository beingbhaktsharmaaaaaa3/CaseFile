# Wireshark / PCAP Analysis Tricks

## Useful Display Filters
```
http.request                                 # all HTTP requests
tcp.flags.syn==1 && tcp.flags.ack==0         # SYN scan / connection attempts
dns && dns.flags.response==0                 # outgoing DNS queries (exfil over DNS candidate)
tcp.analysis.retransmission                  # network issues or evasive scanning
ftp.request.command=="USER" || ftp.request.command=="PASS"   # cleartext FTP creds
http.authorization                           # HTTP Basic Auth headers (base64 creds)
```

## Follow Streams
Right-click any packet → **Follow → TCP/HTTP Stream** reconstructs the full conversation — the fastest way to read cleartext protocol exchanges (HTTP, FTP, Telnet, SMTP).

## Extracting Files from a Capture
`File → Export Objects → HTTP` (or SMB/DICOM) pulls out any file transferred in-band — very effective for pulling malware droppers or exfiltrated documents straight out of a PCAP.

## Command-Line Equivalent (tshark)
```bash
tshark -r capture.pcap -Y "http.request" -T fields -e ip.src -e http.host -e http.request.uri
tshark -r capture.pcap --export-objects http,./extracted/
```

## Spotting Exfiltration
- Unusually large DNS TXT/CNAME query volume to a single domain → DNS tunneling.
- Long-lived, low-and-slow connections to a single external IP outside business hours.
- ICMP packets with abnormally large or consistently-sized payloads (covert channel indicator).

## Detecting Scanning Activity
- High volume of SYN packets with no completed handshake, spread across many destination ports/hosts in a short window = port scan.
- `tcp.flags==0x000` (null scan) or `tcp.flags==0x029` (Xmas scan) are near-certain signs of reconnaissance, not legitimate traffic.

## Statistics Menu (underused)
`Statistics → Conversations` gives a fast top-talkers view — often the quickest way to spot the one host generating abnormal traffic volume in a large capture.