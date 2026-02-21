const express = require('express')
const db = require('../db')

const MIN_INPUT_LENGTH = 3

// validation helper keeps parameter order consistent with route handlers
function getProjectValidationErrors(title, description, createdDate, lastUpdatedDate){
    const validationErrors = []
    if(!title || title.trim().length === 0){
        validationErrors.push("Error:: Title can't be empty")
    }
    if(!description || description.trim().length < MIN_INPUT_LENGTH){
      validationErrors.push("Error:: Description must be at least "+MIN_INPUT_LENGTH+" characters!")
    }
    if(!createdDate || createdDate.trim().length === 0){
        validationErrors.push("Error: Please enter the date you created the project!")
    }
    if(!lastUpdatedDate || lastUpdatedDate.trim().length === 0){
        validationErrors.push("Error, please enter the last date you updated the project!")
    }
   return validationErrors
}

const router = express.Router()

router.get("/", function(request, response){
    const errors =[]
    db.getAllProjects(function(error, projects){
       if(error){            
            errors.push("Error")            
            errors.push(error)
            const model = { 
                errors,
                dbErrorOccured: true
            }
            response.render("projects.hbs", model)
            return
        }else{
            const model = {
                projects,
                dbErrorOccured: false
            }
            response.render("projects.hbs", model)
        }
    })
})

router.get("/create", requireLogin, function(request, response) {
    response.render("createProject.hbs")
})
router.post("/create", requireLogin, function(request, response) {
    
    const title = (request.body.title || '').trim()
    const description = (request.body.description || '').trim()
    const createdDate = (request.body.createdDate || '').trim()
    const lastUpdatedDate = (request.body.lastUpdatedDate || '').trim()
    
    const errors = getProjectValidationErrors(title, description, createdDate, lastUpdatedDate)

    if(errors.length > 0){
        return response.render("createProject.hbs", { errors })
    }

    db.createProject(title, description, createdDate, lastUpdatedDate, function(error, id){
        if(error){
            const errs = ["Database error", error]
            return response.render("createProject.hbs", { errors: errs, dbErrorOccured: true })
        }
        response.redirect("/projects")
    })
})

router.get("/update/:id", requireLogin, function(request, response) {
    const id = request.params.id
    const errors = []

    db.getProjectById(id, function(error, project) {
        if(error){
            errors.push("Error")
            errors.push(error)
            return response.render("updateProject.hbs", { errors, dbErrorOccured: true })
        }
        response.render("updateProject.hbs", { project, dbErrorOccured: false })
    })
})

router.post("/update/:id", requireLogin, function(request, response){
    const id = request.params.id
    
    const newTitle = (request.body.title || '').trim()
    const newDescription = (request.body.description || '').trim()
    const newCreatedDate = (request.body.createdDate || '').trim()
    const newLastUpdatedDate = (request.body.lastUpdatedDate || '').trim()

    const errors = getProjectValidationErrors(newTitle, newDescription, newCreatedDate, newLastUpdatedDate)

    if(errors.length > 0){
        return response.render("updateProject.hbs", {
            errors,
            project: { id, title: newTitle, description: newDescription, createdDate: newCreatedDate, lastUpdatedDate: newLastUpdatedDate }
        })
    }

    db.updateProjectById(id, newTitle, newDescription, newCreatedDate, newLastUpdatedDate, function(error){
        if(error){
            const errs = ["Database error", error]
            return response.render("updateProject.hbs", { errors: errs, dbErrorOccured: true })
        }
        response.redirect("/projects")
    })
})

router.post("/delete/:id", requireLogin, function(request, response) {

    const id = request.params.id
    const errors = []

    db.deleteProjectById(id, function(error){
        if(error){
            return response.render("project.hbs", { errors: ["Database error", error], dbErrorOccured: true })
        }
        response.redirect("/projects")
    })
})

router.get("/:id", function(request, response){

    const id = request.params.id
    const errors =[]
    db.getProjectById(id, function(error, project){
        if(error){
            return response.render("project.hbs", { errors: ["Error", error], dbErrorOccured: true })
        }
        response.render("project.hbs", { project, dbErrorOccured: false })
    })
})

// simple middleware used by several routes
function requireLogin(req, res, next) {
    if (req.session && req.session.isLoggedIn) {
        return next()
    }
    res.status(401).render('login.hbs', { errors: ['You must be logged in to access that page.'] })
}

module.exports = router