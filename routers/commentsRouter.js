const express = require('express')
const db = require('../db')

const MIN_INPUT_LENGTH = 4

function getCommentValidationErrors(username, projectTitle, comment){
    const validationErrors = []
    if(comment.length < MIN_INPUT_LENGTH){
        validationErrors.push("Error: Comment must be at least "+MIN_INPUT_LENGTH+" characters!")
    }
    if(username.length == 0){
        validationErrors.push("Error: Username can not be empty! Please insert a Username!")
    }
    if(projectTitle.length == 0){
        validationErrors.push("Error: Project title can not be empty!")
    } 
    return validationErrors
}
const router = express.Router()

router.get("/", function(request, response){
    const errors = []
    db.getAllComments(function(error, comments){
        if(error){
            errors.push("Internal Error: check connection to the server!")
            errors.push(error)
            const model = {
                errors,
                dbErrorOccured: true
            }
            response.render("comments.hbs", model)
            return
        }else{
            const model = {
                comments,
                dbErrorOccured: false
            }
            response.render("comments.hbs", model)
        }
    })
})
router.get("/create", function(request, response) {
    response.render("createComment.hbs")
})
router.post("/create", function(request, response) {
   
    const username = request.body.username
    const projectTitle = request.body.projectTitle
    const comment = request.body.comment

    const errors = getCommentValidationErrors(username, projectTitle, comment)
    if(0<errors.length){
        const model = {errors}
        response.render("createComment.hbs", model)
        return
    }else{
        db.createComment(username, projectTitle, comment, function(error, id){
            if(error){
                errors.push("Internal Error!")
                errors.push(error)
                if(0<errors.length){
                    const model = {errors}
                    response.render("createComment.hbs", model)
                    return
                }
                const model = {
                    dbErrorOccured: true
                }
                response.render("createComment.hbs", model)
            }else{
                response.redirect("/comments")
            }
        })
    }
})
router.get("/update/:id", function(request, response) {
    const id = request.params.id
    const errors = []
    if(!request.session.isLoggedIn){
        errors.push("Error: You must log in first!")
    }
    db.getCommentById(id, function(error, comment) {
        if(error){
            errors.push("Internal Error: check connection to server!")
            errors.push(error)
            const model = {
                errors,
                dbErrorOccured: true
            }
            res.render("updateComment.hbs", model)
        }else{
            const model = {
                comment,
                dbErrorOccured: false
            }
            response.render("updateComment.hbs", model)
        }
    })
})
router.post("/update/:id", function(request, response){
    const id = request.params.id

    const projectTitle = request.body.projectTitle
    const newUsername = request.body.username
    const newComment = request.body.comment

    const errors = getCommentValidationErrors(newUsername, projectTitle, newComment)
    if(!request.session.isLoggedIn){
        errors.push("Error:Log in first!")
    }
    if(0<errors.length){
        const model = {
            errors, 
            comment: {
                id,
                username: newUsername,
                comment: newComment,
                projectTitle: projectTitle
            }
        }
    response.render("updateComment.hbs", model)
    return
    }
    db.updateCommentById(newUsername, projectTitle, newComment, id, function(error){
        if(error){
            errors.push("Internal Error!")
            errors.push(error)
            const model = {
                errors,
                dbErrorOccured: true
            }
            response.render("updateComment.hbs", model)
        }else{
            response.redirect("/comments")
        }
    })
})
router.post("/delete/:id", function(request, response) {
    const id = request.params.id
   
    const errors = []
    if(!request.session.isLoggedIn){
        errors.push("Error: You must log in first!")
    }
    db.deleteCommentById(id, function(error){
        if(error){
            errors.push("Internal Error!")
            errors.push(error)
            const model = { 
                errors,
                dbErrorOccured: true
            }
            response.render("comment.hbs", model)
        }else{
            response.redirect("/comments")
        }
    })
})
router.get("/:id", function(request, response){

    const id = request.params.id
    const errors = []
    db.getCommentById(id, function(error, comment){
        if(error){
            errors.push("Internal Error:: check connection to server!")
            errors.push(error)
            const model = { 
                errors,
                dbErrorOccured: true
            }
            response.render("comment.hbs", model)
        }else{
            const model = {
                comment,
                dbErrorOccured: false
            }
            response.render("comment.hbs", model)
        }
    })
})

module.exports = router
