# Reverse Engineering — Tools & Basic Methods

## Core Toolkit
| Tool | Use case |
|---|---|
| Ghidra | Free, full-featured disassembler/decompiler — good default starting point |
| IDA Free/Pro | Industry standard disassembler, Pro has best-in-class decompiler |
| x64dbg / OllyDbg | Windows userland debugging |
| GDB + pwndbg/GEF | Linux debugging |
| Binary Ninja | Modern UI, strong scripting API |
| radare2 / Cutter | Free, scriptable, steep learning curve but powerful |

## Static Analysis First
```bash
file sample
strings -n 8 sample | less
objdump -d sample | less          # quick disassembly without a full GUI tool
readelf -h sample                 # ELF header info (Linux)
```
Look at imported functions first — they tell you *what the program is capable of* before you read a single instruction of its actual logic (network calls, crypto, file I/O, process manipulation).

## Identifying Functions of Interest
- Search for string references (error messages, format strings, license-check text) and work backward from where they're used — much faster than reading top-to-bottom.
- Look for suspiciously "boring" function names vs auto-generated ones (`sub_401230`) — real function names surviving in the binary (unstripped) are a huge head start; if stripped, focus on control-flow shape (loops, comparisons) to guess purpose.

## Common Patterns to Recognize
- **Comparison loops with an early return** → likely a license/serial validation routine.
- **XOR in a tight loop against a fixed key** → simple string/config obfuscation, easy to script a decoder for.
- **Calls into `VirtualAlloc`+`memcpy`+jump to allocated buffer** → classic unpacking/shellcode-staging behavior.

## Dynamic Analysis to Confirm Static Hypotheses
Set a breakpoint at the function you suspect handles validation/decryption, run with real and fake input, diff the register/memory state at that breakpoint — confirms your static read is correct before you invest more time.

## Scripting Repetitive Analysis
Both Ghidra and IDA support Python scripting for tasks like auto-renaming functions matching a pattern, or bulk-extracting all XOR-decoded strings across a binary — worth the setup time on any sample with more than a handful of obfuscated strings.

## Anti-Analysis to Expect
- Debugger detection (`IsDebuggerPresent`, timing checks) — patch out or use a debugger with anti-anti-debug plugins (ScyllaHide for x64dbg).
- Packing/obfuscation — identify with `DIE`/`PEiD`, unpack to a clean dump before deep analysis.