# FiliPort2

FiliPort2 is a Node.js web application for managing projects, contacts, and comments. It uses Express, Handlebars for templating, and a modular router structure.

## Features
- Project, contact, and comment management
- RESTful routing with Express
- Handlebars-based views
- Static assets in the public directory

## Project Structure
- `app.js`: Main application entry point
- `db.js`: Database connection and logic
- `routers/`: Express routers for different resources
- `views/`: Handlebars templates for pages and layouts
- `public/`: Static files (CSS, images)

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables (create a `.env` file in the project root). **`SESSION_SECRET` is required; others are optional**:
   ```env
   SESSION_SECRET=<a long random string>
   ADMIN_USERNAME=Filmon      # optional: seeds initial admin user
   ADMIN_PASSWORD_HASH=...    # optional: hash of admin password
   PORT=8080
   NODE_ENV=development
   ```
   To generate a bcrypt hash:
   ```bash
   node -e "console.log(require('bcrypt').hashSync('yourpassword', 10))"
   ```
3. Start the application:
   ```bash
   npm start
   ```
4. Visit `http://localhost:8080` in your browser.

## New Features (Latest)
- **User Management** – registration at `/users/register`, database-backed login (no hard-coded admin)
- **Input Validation** – `express-validator` on all forms, auto-sanitization & XSS protection
- **Request Logging** – Morgan logs all HTTP requests
- **Error Handling** – centralized error middleware, console logging
- **Tests** – Jest/Supertest suite; run `npm test`
- **HTTPS Support** – set `HTTPS_KEY` and `HTTPS_CERT` env vars to enable TLS
- **Security** – CSRF tokens on all forms, secure session cookies, Helmet headers

## Scripts
- `npm start`: Start the server
- `npm test`: Run Jest test suite

## Deployment Notes
- Never commit `.env` (secrets) – only `.env.example`
- In production: set `NODE_ENV=production` for secure cookies
- Use a reverse proxy (Nginx, etc.) or the HTTPS env vars for TLS
- Ensure `SESSION_SECRET` is long and random

## License
MIT
