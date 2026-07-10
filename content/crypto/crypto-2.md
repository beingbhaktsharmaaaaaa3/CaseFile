# Applied Cryptography for Security Testing

## What to Check First
- Is a *known-weak* algorithm in use? (MD5/SHA1 for password hashing, DES, RC4, ECB mode) — these are findings on their own regardless of exploitability.
- Is the implementation rolling its own crypto instead of using a vetted library? Huge red flag.
- Are keys/IVs hardcoded, reused, or predictable (timestamp-derived)?

## Common Weaknesses to Test For
| Weakness | How to spot it |
|---|---|
| ECB mode | Identical plaintext blocks produce identical ciphertext blocks — visible as repeating patterns in ciphertext, especially in images encrypted with ECB |
| Static IV with CBC | Same plaintext + same key always produces same ciphertext prefix |
| Predictable tokens | Session tokens that are just base64(timestamp) or sequential IDs |
| Padding oracle | Different error messages/timing for valid vs invalid padding on decryption failure |
| Weak key derivation | Passwords hashed with unsalted MD5/SHA1, or low iteration-count PBKDF2 |

## Padding Oracle Attack (Conceptual)
If a service reveals (via error message or timing) whether decrypted padding was valid, an attacker can decrypt a CBC-encrypted blob byte-by-byte without knowing the key, by manipulating the previous ciphertext block and observing the oracle's response. Tools: `padbuster`, `PadBusterJS`.

## JWT-Specific Crypto Issues
```
{"alg":"none"}                          # some libraries accept unsigned tokens if alg is "none"
{"alg":"HS256"}  # but server expects RS256 → sign with the public key as an HMAC secret (key confusion)
```
Always check: is the algorithm enforced server-side, or does the server trust whatever `alg` the client sends?

## Hash Identification & Cracking
```bash
hashid '$2a$10$...'                     # identify hash type
hashcat -m 0 -a 0 hashes.txt rockyou.txt   # MD5 dictionary attack
hashcat -m 1000 -a 3 hashes.txt ?a?a?a?a?a?a   # NTLM brute-force
john --wordlist=rockyou.txt hashes.txt
```

## TLS/Certificate Checks
```bash
testssl.sh target.com:443
openssl s_client -connect target.com:443 -tls1
```
Check for: expired/self-signed certs in production, weak cipher suites still enabled, missing HSTS, certificate CN/SAN mismatches.

## CTF-Style Crypto Recognition
- Repeating short ciphertext with letter-frequency patterns resembling English → likely a classical cipher (Vigenère/substitution).
- Base64-looking string with `==` padding → decode first, always, before assuming it's "encrypted."
- Very large numbers in pairs (n, e) → almost certainly RSA; check for small `e`, common modulus, or factorable `n` (small key size).