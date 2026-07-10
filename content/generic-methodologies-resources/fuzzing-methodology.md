# Fuzzing Methodology

Fuzzing = throwing structured-but-unexpected input at a target and watching for crashes, errors, or behavioral differences. Useful everywhere: web parameters, file parsers, network protocols, binaries.

## Types of Fuzzing
- **Mutation-based**: take a valid input, mutate bytes/fields, feed it back (AFL++, Radamsa).
- **Generation-based**: build inputs from a grammar/spec (good for structured protocols/file formats).
- **Dumb vs coverage-guided**: coverage-guided (AFL, libFuzzer) uses instrumentation to reach new code paths faster — vastly more effective for binaries.

## Web Fuzzing
```bash
# Directory/file discovery
ffuf -u https://target.com/FUZZ -w /path/wordlist.txt -mc 200,301,302,403

# Parameter discovery
ffuf -u https://target.com/page?FUZZ=test -w params.txt -fs <baseline_size>

# Vhost/subdomain fuzzing
ffuf -u https://FUZZ.target.com -H "Host: FUZZ.target.com" -w subdomains.txt
```

Key tuning tips:
- Always establish a **baseline response size** first (`-fs`) to filter noise from soft-404 pages.
- Rate-limit (`-p 0.1`) against fragile targets.
- Combine wordlists: raft, SecLists, and a custom list scraped from the target's own JS files.

## Binary/File Format Fuzzing
```bash
# AFL++ basic loop
afl-fuzz -i input_corpus/ -o output/ -- ./target_binary @@
```
- Seed the corpus with *valid*, diverse sample files — quality of seeds matters more than quantity.
- Watch `output/default/crashes/` for unique crashes, then triage with a debugger (GDB + `!exploitable`/`crashwalk` style triage).

## API Fuzzing
- Fuzz JSON/XML field types, not just values: send arrays where strings are expected, nested objects, huge integers, null bytes.
- Test for mass assignment by adding unexpected fields to a valid request body.

## Triage Checklist
1. Does it crash consistently or only intermittently (race condition)?
2. What's the exact input that triggers it — minimize it (`afl-tmin`).
3. Is the crash in memory-unsafe code (worth checking `EIP`/`RIP` control) or just an unhandled exception (lower severity, still worth reporting)?