# Deploy React app at website-develop.delgoosh.com/design-react

The app is built with **base path** `/design-react/` so it works under that URL. It is served at **https://website-develop.delgoosh.com/design-react/** on the same server as the main website (port 3003).

---

## Minimal steps (Option A) — build on server

All commands below run on the server (SSH). Ensure **Node.js 18+** and **npm** are installed (e.g. `node -v`, `npm -v`).

### 1. Clone (or pull) from GitHub and build

Keep the repo **outside** the web root (e.g. under `/opt` or a deploy user’s home). Only the built output goes in `/var/www/`.

**Important:** The repo must have `base: "/design-react/"` in `vite.config.js`. After building, check that `dist/index.html` contains `/design-react/assets/...` in script/link URLs (not `/assets/...`). If you see `/assets/`, the base wasn’t applied — fix `vite.config.js` and rebuild.

```bash
# Clone once (use your repo URL and desired branch)
sudo mkdir -p /opt/delgoosh
sudo chown "$USER:$USER" /opt/delgoosh
git clone https://github.com/YOUR_ORG/delgoosh.git /opt/delgoosh/design-react
cd /opt/delgoosh/design-react

# Or if already cloned: cd /opt/delgoosh/design-react && git pull && git checkout main

# Install dependencies and build (Node 18+)
npm ci
npm run build
```

### 2. Deploy built files to web root

Only the built static files go in the web root; the repo (and .git, node_modules) stay in `/opt/delgoosh/design-react`.

```bash
sudo mkdir -p /var/www/design-react
sudo rsync -av --delete /opt/delgoosh/design-react/dist/ /var/www/design-react/
```

For **future deploys**:

```bash
cd /opt/delgoosh/design-react
git pull
npm ci
npm run build
sudo rsync -av --delete dist/ /var/www/design-react/
```

### 3. Nginx: add /design-react to website-develop.delgoosh.com

Edit the existing `website-develop.delgoosh.com` server block and add the `/design-react` locations **before** `location /`. Then:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

No new Certbot run; the existing cert for this host is used.

---

## Alternative: build locally and upload

Build on your machine, then upload:

```bash
# Local
npm run build
rsync -avz --delete dist/ user@your-server:/var/www/design-react/
```

On the server once: `sudo mkdir -p /var/www/design-react && sudo chown "$USER:$USER" /var/www/design-react`.

---

## Nginx config: website-develop.delgoosh.com/design-react

Replace (or edit) the existing **website-develop.delgoosh.com** server block with this. The `/design-react` locations must appear **before** `location /` so they take precedence:

```nginx
server {
    server_name website-develop.delgoosh.com;

    # React app at /design-react/
    location = /design-react {
        return 301 /design-react/;
    }
    location /design-react/ {
        alias /var/www/design-react/;
        index index.html;
        try_files $uri $uri/ /design-react/index.html;
    }

    # Main website (existing proxy)
    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen [::]:443 ssl; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/back-develop.delgoosh.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/back-develop.delgoosh.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
```

---

## Alternative: delgoosh.com (main domain)

If you later serve the app on the main domain **delgoosh.com/design-react**, you would add a new server block. (Requires DNS for delgoosh.com to point to this server and Certbot for that domain.)

### Option A — New server block for delgoosh.com (path /design-react)

Add this **before** the “Virtual Host configuration for example.com” comment (or in a new file under `sites-available` and symlink it in `sites-enabled`):

```nginx
# delgoosh.com — main site + design-react app
server {
    server_name delgoosh.com www.delgoosh.com;

    # React app at /design-react/
    location = /design-react {
        return 301 /design-react/;
    }
    location /design-react/ {
        alias /var/www/design-react/;
        index index.html;
        try_files $uri $uri/ /design-react/index.html;
    }

    # Optional: root location (e.g. main marketing site or 404)
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ =404;
    }

    listen 80;
    listen [::]:80;
}
```

Then get SSL for delgoosh.com and add the `listen 443 ssl` block:

```bash
sudo certbot --nginx -d delgoosh.com -d www.delgoosh.com
```

Certbot will add the `listen 443 ssl` and certificate lines. After that, add the HTTP→HTTPS redirect for delgoosh.com (same pattern as your other servers):

```nginx
server {
    if ($host = delgoosh.com) {
        return 301 https://$host$request_uri;
    }
    if ($host = www.delgoosh.com) {
        return 301 https://$host$request_uri;
    }
    listen 80;
    listen [::]:80;
    server_name delgoosh.com www.delgoosh.com;
    return 404;
}
```

(You can let Certbot generate the redirect; it often does.)

### Option B — Subdomain (e.g. design-react-develop.delgoosh.com)

If you prefer the same pattern as your other apps (one subdomain, one port), run the built app with a static server on a port (e.g. 3004) and proxy to it.

**On server:** run the app (e.g. with `npx serve`):

```bash
cd /var/www/design-react
npx serve -s . -l 3004
```

Run that under systemd or inside a container so it stays up. Then add a server block like your others:

```nginx
server {
    server_name design-react-develop.delgoosh.com;

    location / {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl;
    listen [::]:443 ssl;
    ssl_certificate /etc/letsencrypt/live/back-develop.delgoosh.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/back-develop.delgoosh.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```

Plus HTTP→HTTPS redirect on port 80 for `design-react-develop.delgoosh.com`. If your cert is `*.delgoosh.com`, no new cert is needed.

---

## 4. Apply Nginx config changes

After editing the config, test and apply:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

**Reload** applies the new config without dropping active connections. Use **restart** only if reload doesn’t pick up changes (e.g. some module or rare cases): `sudo systemctl restart nginx`.

---

## Summary

- **Vite**: `base: "/design-react/"` is set in `vite.config.js` so assets and routing work under `/design-react/`.
- **Current setup**: Static files in `/var/www/design-react/`, served at **https://website-develop.delgoosh.com/design-react/** via the existing website-develop server block (no new cert needed).
