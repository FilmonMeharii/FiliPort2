require('dotenv').config() // load .env first

const express = require('express')
const bodyParser = require('body-parser')
const expressHandlebars = require('express-handlebars')
const expressSession = require('express-session')
const SQLiteStore = require('connect-sqlite3')(expressSession)
const bcrypt = require('bcrypt')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const csurf = require('csurf')
const morgan = require('morgan')

const commentsRouter = require('./routers/commentsRouter')
const projectsRouter = require('./routers/projectsRouter')
const contactsRouter = require('./routers/contactsRouter')
const db = require('./db') // for authentication

// session secret is required; user data lives in the database
const SESSION_SECRET = process.env.SESSION_SECRET

if (!SESSION_SECRET) {
    console.error('ERROR: you must set SESSION_SECRET in your environment')
    process.exit(1)
}
// NOTE: user records (including the initial admin) are stored in the SQLite database
// Set ADMIN_USERNAME and ADMIN_PASSWORD_HASH in .env before first run to seed the admin user.

const app = express()
// if running behind a proxy (e.g. Heroku, nginx) enable trust proxy for secure cookies
app.set('trust proxy', 1)

app.engine('hbs', expressHandlebars.engine({
    defaultLayout: 'main.hbs',
}))

// security headers
app.use(helmet())

// logging
app.use(morgan('combined'))

// rate limiter for sensitive endpoints
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: "Too many login attempts from this IP, please try again later."
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(expressSession({
        saveUninitialized: false,
        resave: false,
        secret: SESSION_SECRET,
        store: new SQLiteStore({ db: "sessions.db" }),
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        }
    })
)

// CSRF protection
app.use(csurf())
// attach locals and add error handler
app.use(function(req, res, next) {
    res.locals.isLoggedIn = req.session.isLoggedIn
    res.locals.csrfToken = req.csrfToken()
    next()
})
app.use(function(err, req, res, next) {
    if (err.code === 'EBADCSRFTOKEN') {
        // token missing or invalid
        res.status(403).send('Form tampered with')
    } else {
        console.error(err.stack)
        res.status(500).send('Internal Server Error')
    }
})

app.use(express.static('public'))

app.use("/comments", commentsRouter)
app.use("/projects", projectsRouter)
app.use("/contacts", contactsRouter)

const usersRouter = require('./routers/usersRouter')
app.use('/users', usersRouter) 

function getLogInValidationErrors(username, password){
    const validationErrors = []
    if(!username || username.trim().length === 0){
        validationErrors.push("Error: Username can't be empty! Insert a username please!")
    }
    if(!password || password.trim().length === 0){
        validationErrors.push("Error: Password can't be empty!")
    }
    return validationErrors
}

app.get('/', function(request, response){
    response.render('home.hbs')
})
app.get("/about", function(req, res){
    res.render("about.hbs")
})
app.get("/contact", function(req, res){
    res.render("contact.hbs")
})
app.get("/login", function(request, response){
	response.render("login.hbs")
})
app.post("/login", loginLimiter, function(request, response){
    const username = (request.body.username || '').trim()
    const password = (request.body.password || '').trim()
    const errors = getLogInValidationErrors(username, password)

    if(errors.length === 0) {
        // fetch user from database
        db.getUserByUsername(username, (err, user) => {
            if(err) {
                errors.push("An unexpected error occurred")
                return response.render("login.hbs", { errors })
            }
            if(user) {
                bcrypt.compare(password, user.passwordHash, (error, match) => {
                    if(error) {
                        errors.push("An unexpected error occurred")
                        return response.render("login.hbs", { errors })
                    }
                    if(match) {
                        request.session.isLoggedIn = true
                        return response.redirect("/")
                    }
                    errors.push("Invalid username or password")
                    request.session.isLoggedIn = false
                    response.render("login.hbs", { errors })
                })
            } else {
                errors.push("Invalid username or password")
                response.render("login.hbs", { errors })
            }
        })
    } else {
        response.render("login.hbs", { errors })
    }
})
app.post("/logout", function(request, response) {
    request.session.isLoggedIn = false
    response.redirect("/")
})
app.get("/logout", function(request, response) {
    request.session.isLoggedIn = false
    response.redirect("/")
})

// remove development bcrypt/demo code

// start server when invoked directly (not required by tests)
const port = process.env.PORT || 8080

function startServer() {
    if (process.env.HTTPS_KEY && process.env.HTTPS_CERT) {
        const https = require('https')
        const fs = require('fs')
        const options = {
            key: fs.readFileSync(process.env.HTTPS_KEY),
            cert: fs.readFileSync(process.env.HTTPS_CERT)
        }
        https.createServer(options, app).listen(port, () => {
            console.log(`HTTPS server listening on port ${port}`)
        })
    } else {
        app.listen(port, () => {
            console.log(`HTTP server listening on port ${port}`)
        })
    }
}

if (require.main === module) {
    startServer()
}

module.exports = app

