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
2. Configure environment variables (create a `.env` file in the project root). **These three are required and the server will refuse to start without them**:
   ```env
   ADMIN_USERNAME=yourAdmin
   ADMIN_PASSWORD_HASH=<bcrypt hash of your password>
   SESSION_SECRET=a long random string
   ```
   optionally you can set:
   ```env
   PORT=8080       # defaults to 8080 if unset
   NODE_ENV=development
   ```
3. Install dependencies and start the application:
   ```bash
   npm install
   npm start
   ```
4. Visit `http://localhost:8080` in your browser.

## Scripts
- `npm start`: Start the server

## License
MIT
