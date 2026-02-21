# Environment Variables Documentation

## Required

- **SESSION_SECRET** – a long random string used to sign session cookies. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

## Optional - Initial admin setup

Set these *before first run* to seed an admin user into the database:
- **ADMIN_USERNAME** – initial admin username (e.g. 'Filmon')
- **ADMIN_PASSWORD_HASH** – bcrypt hash of the admin password. Generate with `node -e "console.log(require('bcrypt').hashSync('yourpass', 10))"`.

Once seeded, subsequent registrations go through `/users/register`.

## Optional - Server & Deployment

- **PORT** – port to listen on (default 8080)
- **NODE_ENV** – set to `production` to enable secure cookies and skip verbose logging
- **HTTPS_KEY** – path to PEM private key for TLS
- **HTTPS_CERT** – path to PEM certificate for TLS
