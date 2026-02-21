const express = require('express')
const db = require('../db')

const MIN_INPUT_LENGTH = 4

function getCommentValidationErrors(username, projectTitle, comment){
    const validationErrors = []
    if(!comment || comment.trim().length < MIN_INPUT_LENGTH){
        validationErrors.push("Error: Comment must be at least "+MIN_INPUT_LENGTH+" characters!")
    }
    if(!username || username.trim().length === 0){
        validationErrors.push("Error: Username can not be empty! Please insert a Username!")
    }
    if(!projectTitle || projectTitle.trim().length === 0){
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
router.get("/create", requireLogin, function(request, response) {
    response.render("createComment.hbs")
})
router.post("/create", requireLogin, function(request, response) {
   
    const username = (request.body.username || '').trim()
    const projectTitle = (request.body.projectTitle || '').trim()
    const comment = (request.body.comment || '').trim()

    const errors = getCommentValidationErrors(username, projectTitle, comment)
    if(errors.length > 0){
        return response.render("createComment.hbs", { errors })
    }
    db.createComment(username, projectTitle, comment, function(error, id){
        if(error){
            const errs = ["Internal Error!", error]
            return response.render("createComment.hbs", { errors: errs, dbErrorOccured: true })
        }
        response.redirect("/comments")
    })
})
router.get("/update/:id", requireLogin, function(request, response) {
    const id = request.params.id
    const errors = []
    db.getCommentById(id, function(error, comment) {
        if(error){
            const errs = ["Internal Error: check connection to server!", error]
            return response.render("updateComment.hbs", { errors: errs, dbErrorOccured: true })
        }
        response.render("updateComment.hbs", { comment, dbErrorOccured: false })
    })
})
router.post("/update/:id", requireLogin, function(request, response){
    const id = request.params.id

    const projectTitle = (request.body.projectTitle || '').trim()
    const newUsername = (request.body.username || '').trim()
    const newComment = (request.body.comment || '').trim()

    const errors = getCommentValidationErrors(newUsername, projectTitle, newComment)
    if(errors.length > 0){
        return response.render("updateComment.hbs", {
            errors,
            comment: { id, username: newUsername, comment: newComment, projectTitle }
        })
    }
    db.updateCommentById(id, newUsername, projectTitle, newComment, function(error){
        if(error){
            const errs = ["Internal Error!", error]
            return response.render("updateComment.hbs", { errors: errs, dbErrorOccured: true })
        }
        response.redirect("/comments")
    })
})
router.post("/delete/:id", requireLogin, function(request, response) {
    const id = request.params.id
    db.deleteCommentById(id, function(error){
        if(error){
            const errs = ["Internal Error!", error]
            return response.render("comment.hbs", { errors: errs, dbErrorOccured: true })
        }
        response.redirect("/comments")
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

// authentication helper
function requireLogin(req, res, next) {
    if (req.session && req.session.isLoggedIn) {
        return next()
    }
    res.status(401).render('login.hbs', { errors: ['You must log in to access that page.'] })
}

module.exports = router
