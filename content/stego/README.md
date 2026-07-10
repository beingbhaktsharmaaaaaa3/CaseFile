# Steganography — Detection & Extraction

## General Approach
1. Identify the true file type first — extensions lie. `file target.jpg` and check the magic bytes match.
2. Check for appended data after the expected end-of-file marker (common trick: valid image + zip archive concatenated after it).
3. Try automated tools before manual bit-fiddling — most CTF-style stego is solvable with the standard toolkit below.

## Images
```bash
exiftool image.jpg                  # metadata often hides the flag directly
binwalk image.jpg                   # detects embedded files/archives
binwalk -e image.jpg                # extracts anything binwalk finds
steghide extract -sf image.jpg      # classic LSB steg tool, try common passwords/empty password first
zsteg image.png                     # PNG/BMP-focused, checks multiple bit-planes automatically
stegsolve.jar                       # GUI tool, cycle through bit planes and color channels visually
```

## Audio
```bash
exiftool audio.wav
sox audio.wav spectrogram.png       # spectrogram analysis — text/QR codes hidden visually in frequency domain is a classic trick
audacity audio.wav                  # manual spectrogram view + spectral analysis
```

## Documents
- Office files (`.docx`/`.xlsx`) are ZIP archives — `unzip -l file.docx` and inspect for extra embedded objects, hidden sheets, or tracked-changes revealing removed content.
- PDFs: check for embedded files (`pdfdetach -list file.pdf`), and objects hidden behind rendered content layers.

## Text-Based Stego
- Whitespace steganography: trailing spaces/tabs encoding binary data — `cat -A file.txt` reveals hidden whitespace patterns.
- Zero-width character injection (invisible Unicode characters embedding a message) — check with a hex/unicode-aware viewer, not a plain text editor.

## Network/Malware Stego
- Data hidden in unused protocol fields (IP ID, TCP sequence numbers, ICMP payload) — requires PCAP analysis, not file analysis.

## Quick Triage Checklist
- [ ] `file` and `exiftool` on the raw file
- [ ] `binwalk -e` for embedded archives
- [ ] Bit-plane inspection (`zsteg`/`stegsolve`) for images
- [ ] Spectrogram for audio
- [ ] `strings` pass regardless of file type — sometimes the flag is just sitting in plaintext