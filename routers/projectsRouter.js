const express = require('express')
const db = require('../db')

const MIN_INPUT_LENGTH = 3

function getProjectValidationErrors(createdDate, title, description, lastUpdatedDate){
    const validationErrors = []
    if(title.length == 0){
        validationErrors.push("Error:: Title can't be empty")
    }
    if(description.length < MIN_INPUT_LENGTH){
      validationErrors.push("Error:: Description must be at least "+MIN_INPUT_LENGTH+" words!")
    }
    
    if(createdDate.length== ""){
        validationErrors.push("Error: Please enter the date you created the project!")
    }
    if(lastUpdatedDate==""){
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

router.get("/create", function(request, response) {
    response.render("createProject.hbs")
})
router.post("/create", function(request, response) {
    
    const title = request.body.title
    const description = request.body.description
    const createdDate = request.body.createdDate
    const lastUpdatedDate = request.bodylastUpdatedDate
    
    const errors = getProjectValidationErrors(title, description, createdDate, lastUpdatedDate)

    if(!request.session.isLoggedIn){
        errors.push("Must be logged in!")
    }
    if(0<errors.length){
        const model = {errors}
        response.render("createProject.hbs", model)
        return
    }else{
        db.createProject(title,description,createdDate, lastUpdatedDate,function(error, id){
            if(error){
                errors.push("Error")
                errors.push(error)
                if(0<errors.length){
                    const model ={errors}
                    response.render("createProject.hbs", model)
                    return
                }
                const model = { 
                    dbErrorOccured: true
                }
                response.render("createProject.hbs", model)
            }else{
                response.redirect("/projects")
            }
        })
    }
})

router.get("/update/:id", function(request, response) {
    const id = request.params.id
    const errors = []

    db.getProjectById(id, function(error, project) {
        if(error){
            errors.push("Error")
            errors.push(error)
            const model = { 
                errors,
                dbErrorOccured: true
            }
            response.render("updateProject.hbs", model)
        }else{
            const model = {
                project,
                dbErrorOccured: false
            }
            response.render("updateProject.hbs", model)
        }
    })
})

router.post("/update/:id", function(request, response){
    const id = request.params.id
    
    const newTitle = request.body.title
    const newDescription = request.body.description
    const newCreatedDate = request.body.createdDate
    const newLastUpdatedDate = request.body.lastUpdatedDate

    const errors = getProjectValidationErrors(newTitle, newDescription, newCreatedDate, newLastUpdatedDate)

    if(!request.session.isLoggedIn){
        errors.push("Errors:: You must log in first!")
    }
    if(0<errors.length){
        const model = {
            errors, 
            project: {
                id,
                title: newTitle,
                description: newDescription,
                createdDate: newCreatedDate,
                lastUpdatedDate: newLastUpdatedDate

            }
        }
    response.render("updateProject.hbs", model)
    return
    }
    db.updateProjectById(newTitle, newDescription, newCreatedDate, newLastUpdatedDate, id, function(error){
        if(error){
            errors.push("Error")
            errors.push(error)
            const model = { 
                errors,
                dbErrorOccured: true
            }
            response.render("updateProject.hbs", model)
        }else{
            response.redirect("/projects")
        }
    })
})

router.post("/delete/:id", function(request, response) {

    const id = request.params.id

    if(!request.session.isLoggedIn){
        errors.push("Errors:: You must log in first!")
    }

    db.deleteProjectById(id, function(error){
        if(error){
            const model = { 
                dbErrorOccured: true
            }
            response.render("project.hbs", model)
        }else{
            response.redirect("/projects")
        }
    })
})

router.get("/:id", function(request, response){

    const id = request.params.id
    const errors =[]
    db.getProjectById(id, function(error, project){
        if(error){
            errors.push("Error")
            errors.push(error)
            const model = { 
                errors,
                dbErrorOccured: true
            }
            response.render("project.hbs", model)
        }else{
            const model = {
                project,
                dbErrorOccured: false
            }
            response.render("project.hbs", model)
        }
    })
})

module.exports = router