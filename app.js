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

const commentsRouter = require('./routers/commentsRouter')
const projectsRouter = require('./routers/projectsRouter')
const contactsRouter = require('./routers/contactsRouter')

// secrets and credentials must be supplied via environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH

// session secret is also required; we won't fall back to a hard‑coded value
const SESSION_SECRET = process.env.SESSION_SECRET

if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH || !SESSION_SECRET) {
    console.error('ERROR: you must set ADMIN_USERNAME, ADMIN_PASSWORD_HASH and SESSION_SECRET in your environment')
    process.exit(1)
}
// NOTE: never commit your .env file or plain text credentials

const app = express()
// if running behind a proxy (e.g. Heroku, nginx) enable trust proxy for secure cookies
app.set('trust proxy', 1)

app.engine('hbs', expressHandlebars.engine({
    defaultLayout: 'main.hbs',
}))

// security headers
app.use(helmet())

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
        next(err)
    }
})

app.use(express.static('public'))

app.use("/comments", commentsRouter)
app.use("/projects", projectsRouter)
app.use("/contacts", contactsRouter) 

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
        bcrypt.compare(password, ADMIN_PASSWORD_HASH, (error, isPasswordCorrect) => {
            if(error) {
                errors.push("An unexpected error occurred")
                return response.render("login.hbs", { errors })
            }
            if(isPasswordCorrect && username === ADMIN_USERNAME) {
                request.session.isLoggedIn = true
                return response.redirect("/")
            }
            errors.push("Invalid username or password")
            request.session.isLoggedIn = false
            response.render("login.hbs", { errors })
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

// start server
const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})

