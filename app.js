const express = require('express')
const bodyParser = require('body-parser')
const expressHandlebars = require('express-handlebars')
const expressSession =require('express-session')
const SQLiteStore = require('connect-sqlite3')(expressSession)
const bcrypt = require('bcrypt')

const commentsRouter = require('./routers/commentsRouter')
const projectsRouter = require('./routers/projectsRouter')
const contactsRouter = require('./routers/contactsRouter')

const ADMIN_USERNAME = "Filmon"
const ADMIN_PASSWORD = "$2b$10$fTNcX5YWAPX3O8qVOWMK5.I5QRcHI.c7i3H652X5gwwKFVR.DnIT."
//Password qwe123

const app = express()

app.engine('hbs', expressHandlebars.engine({
    defaultLayout: 'main.hbs',
}))

app.use(bodyParser.urlencoded({
    extended:false
}))
app.use(expressSession({
        saveUninitialized: false,
        resave:false,
        secret: "kSanlkjYo",
        store: new SQLiteStore({
            db: "sessions.db"
        })
    })
)
app.use(function(req, res, next) {
    res.locals.isLoggedIn = req.session.isLoggedIn
    next()
})

app.use(express.static('public'))

app.use("/comments", commentsRouter)
app.use("/projects", projectsRouter)
app.use("/contacts", contactsRouter)

function getLogInValidationErrors(username, password){
    const validationErrors = []
    if(username.length == 0){
        validationErrors.push("Error: Username can't be empty! Insert a username please!")
    }
    if(password.length ==0){
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
app.post("/login", function(request, response){
	
	const username = request.body.username
	const password = request.body.password
	var errors=[]
    if(getLogInValidationErrors(username, password).length > 0){
        errors = getLogInValidationErrors(username, password)
    }
	if(username != ADMIN_USERNAME){
        errors.push("Invaild Username! ")
    }
    if(errors.length == 0){
        bcrypt.compare(password, ADMIN_PASSWORD, (error, isPasswordCorrect)=>{
            if(isPasswordCorrect){
                request.session.isLoggedIn=true
                response.redirect("/")
            }
            else if(error){
                errors.push(error)
                request.session.isLoggedIn =false
                const model = {
                    errors
                }
                response.render("login.hbs", model)
            }else{
                errors.push("Invaild Password, Please try again!")
                request.session.isLoggedIn =false
                const model = {
                    errors
                }
                response.render("login.hbs", model)
            }
        })
    } else{
        const model = {
            errors
        }
        response.render("login.hbs", model)
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


//----------------Bcrypt-------------
const saltRounds = 10;
const plainTextPassword = "qwe123";
bcrypt
  .genSalt(saltRounds)
  .then(salt => {
    return bcrypt.hash(plainTextPassword, salt);
  })
  .then(hash => {
    console.log(`Hash: ${hash}`);
  })
  .catch(err => console.error(err.message));


bcrypt.compare("qwe123", ADMIN_PASSWORD, function(err, result) {
        if (result) {
            console.log("Password Matches! Correct Password = "+ result)
        }
        else {
            console.log("Wrong Password! "+ result);
        }
    });

console.log("Finally! It's working.")

app.listen(8080)

