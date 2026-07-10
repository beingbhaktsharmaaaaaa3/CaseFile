# Volatility 3 Cheat Sheet (Memory Forensics)

## Setup
```bash
python3 vol.py -f memory.dmp windows.info      # identify profile/OS build
```

## Process Analysis
```bash
python3 vol.py -f memory.dmp windows.pslist      # visible processes
python3 vol.py -f memory.dmp windows.psscan      # finds hidden/unlinked processes too
python3 vol.py -f memory.dmp windows.pstree      # parent/child relationships
python3 vol.py -f memory.dmp windows.cmdline     # command line of each process
```
Compare `pslist` vs `psscan` output — a process in `psscan` but missing from `pslist` is a strong rootkit indicator (unlinked from the active process list).

## Network Artifacts
```bash
python3 vol.py -f memory.dmp windows.netscan     # connections + listening sockets at capture time
```

## Malware Hunting
```bash
python3 vol.py -f memory.dmp windows.malfind     # flags injected/suspicious memory regions
python3 vol.py -f memory.dmp windows.dlllist --pid <PID>
python3 vol.py -f memory.dmp windows.handles --pid <PID>
```

## Credential/Registry
```bash
python3 vol.py -f memory.dmp windows.hashdump    # local SAM hashes (if in scope)
python3 vol.py -f memory.dmp windows.registry.printkey --key "..."
```

## File Extraction
```bash
python3 vol.py -f memory.dmp windows.filescan | grep -i target_filename
python3 vol.py -f memory.dmp windows.dumpfiles --virtaddr <offset>
```

## Linux Memory (equivalent plugins)
```bash
python3 vol.py -f memory.dmp linux.pslist
python3 vol.py -f memory.dmp linux.bash          # recovers bash history from memory, incl. cleared sessions
python3 vol.py -f memory.dmp linux.netstat
```

## Workflow Tip
Run `pslist`/`psscan` and `netscan` first — they're fast and immediately tell you where to focus (`malfind` and `dumpfiles` are slow, run them targeted at specific PIDs once you have a lead, not blindly across the whole dump).