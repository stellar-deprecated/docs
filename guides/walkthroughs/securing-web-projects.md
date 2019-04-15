---
title: Securing Web-based Projects
---

It’s critical for any app managing the flow of cryptocurrency to architect their app to follow
security best-practices. Cryptocurrency-enabled apps are significant targets for malicious
actors in the sense they enable the attacker to realize immediate monetary gain from exploits.
The following checklist offers guidance on the most common vulnerabilities. Even if every piece
of advice is followed, security is not guaranteed. Web security is constantly evolving, which
warrants a certain degree of paranoia.

# SSL/TLS

Ensure TLS enabled (Letsencrypt allows you to do this for free). Redirect http to https where
necessary. This ensures that Man in the Middle attacks cannot occur, and sensitive data is
securely transferred between the client and browser. Learn how to get an SSL certificate for free
[here](https://letsencrypt.org/getting-started/).

*If you don’t have SSL/TLS enabled, stop everything and do this first.*

# Content Security Policy (CSP) Headers

CSP headers tell the browser where it can download static resources from. For example, if you
astralwallet.io and it requests a JavaScript file from myevilsite.com, your browser would block
it unless it was whitelisted with CSP headers. You may read about how to implement CSP headers
[here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP).

Most web frameworks have a configuration file or extensions where you may specify
your CSP policy, and the headers will be auto-generated for you. For example, see
[Helmet](https://www.npmjs.com/package/helmet) for Node.js.

This would have prevented the [Blackwallet
Hack](https://www.ccn.com/yet-another-crypto-wallet-hack-causes-users-lose-400000/).

# HTTP Strict-Transport-Security Headers

This is an HTTP header that tells the browser that all future
connections to a particular site should use HTTPS. To implement this, add the
[header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
to your website. Some web frameworks have this built in, like
[Django](https://docs.djangoproject.com/en/2.0/topics/security/#ssl-https)!

This would have prevented the [MyEtherWallet DNS
hack](https://bitcoinmagazine.com/articles/popular-ether-wallet-mew-hijacked-dns-attack/).


# Storing sensitive data

In an ideal world, you don’t have to store much sensitive data. If you must, tread
carefully. There are many strategies in storing sensitive data; start by ensuring sensitive
data is encrypted using a proven cipher like AES-256, and stored separately from application
data and always pick an AEAD mode. Any communication between the application server and secret
server should be in a private network and / or authenticated via HMAC. Your cipher strategy will
change based on whether you will be sending the ciphertext over the wire multiple times. Finally,
back up any encryption keys you may use offline, and store them only in-memory in your app.

Consult a good cryptographer and read up on best practices. A good place to start is looking
into the documentation of your favorite web framework.

Rolling your own crypto is a bad idea. Always use tried and tested libraries. A good example is
[NaCl](https://en.wikipedia.org/wiki/NaCl_(software)).

# Monitoring
Attackers often need to spend some time exploring your website for unexpected or overlooked
behavior. Examining logs defensively can help you catch on to what their trying to achieve and
ensure you’re protected. At the least, you can block their IP, or automate blocking based on
suspicious behavior you unearth.

Finally, it is worth setting up error reporting (e.g. [Sentry](https://sentry.io/welcome/)):
Oftentimes, people trigger strange bugs when they are trying to hack things.

# Authentication weaknesses

If you have logins for users, it is critical that your authentication system is built securely. Of
course, the best way to do this is to use something off the shelf. Both Ruby on Rails and Django
have robust, built-in authentication schemes.

Many JSON web token implementations are poorly done, so ensure the library you use is audited.

Hash passwords with a time-tested scheme. The winner of the last password hashing contest was
Argon2. Balloon Hashing is also worth looking into.

Strongly prefer 2FA, and require U2F or [TOTP](https://tools.ietf.org/html/rfc6238) 2FA for
sensitive actions.

2FA is really important. Email accounts are usually not very secure. Having a second factor
of authentication ensures that users who accidentally stay logged on, or have their password
guessed are still protected.

Finally, require strong passwords. Common and short passwords
can easily be brute forced. Dropbox has a [great open source
tool](https://blogs.dropbox.com/tech/2012/04/zxcvbn-realistic-password-strength-estimation/)
that gauges password strength fairly quickly, making it usable for user interactions.

# Denial of Service Attacks (DOS)

Denial of service attacks are usually accomplished by overloading your web servers with traffic. To
mitigate this risk, rate limit traffic from IPs and browser fingerprints. Sometimes people will
use proxies to bypass IP rate-limiting. In the end, malicious actors can always find ways to
spoof their identity, so the surest way to block DOS attacks are to implement proof of work checks
in your client, or use a managed service like [Cloudflare](https://www.cloudflare.com/ddos/).

# Lock down unused ports

Attackers will often scan your ports, and see if you were negligent and left any
open. Services like Heroku do this for you. Read about how to enable this on AWS
[here](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/authorizing-access-to-an-instance.html).

# Phishing and social engineering

Phishing attacks will thwart any well-formed security infrastructure. Have clear policies
published on your website, and articulate them to users when they sign up (you will never ask
for their password, etc.). Sign messages to your users. Prompt users to check the domain of
the website they are on.

# Scan your website and libraries for vulnerabilities

Use a tool like [Snyk](https://snyk.io/) to scan your third party client libraries for
vulnerabilities. Make sure you keep your third-party libraries up-to-date -- oftentimes upgrades
are triggered by security exploits.

You can use [Mozilla Observatory](https://observatory.mozilla.org/) to check your HTTP security
as well. As a shameless plug, check out [Astral Wallet](https://astralwallet.io), and [their
rating](https://observatory.mozilla.org/analyze/astralwallet.io) for an example of how to do
things right!

# Low hanging fruit: Cross-Site Request Forgery Protection (CSRF), SQL Injections

Most modern web and mobile frameworks handle both CSRF protection and SQL
injections. Ensure CSRF protection enabled, and that you are using a database ORM
instead of running raw SQL based on user input. For example, see what [Ruby on Rails
documentation](http://guides.rubyonrails.org/security.html#sql-injection) says about SQL
injections.

# Closing remarks

We hope this guide was useful! It is by no means comprehensive, but it's a good place to start if
you haven’t paid attention to security yet. Remember, security is only as strong as its weakest
link. All of this is pointless if you have bad passwords and hackers can guess your AWS password.
