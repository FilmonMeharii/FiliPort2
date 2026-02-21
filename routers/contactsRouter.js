const express = require('express')
const db = require('../db')


const MIN_INPUT_LENGTH = 5

function getContactValidationErrors(name, email, phoneNo, adress){
    const validationErrors = []
    if(!name || name.trim().length === 0){
        validationErrors.push("Error: Name can't be empty! Insert a name please!")
    }
    if(!email || !email.includes("@") || !email.includes(".")){
        validationErrors.push("Error: Please write a proper email address!")
    }
    if(!phoneNo || phoneNo.trim().length === 0){
        validationErrors.push("Error: Please don't forget to insert Phone Number!")
    } 
    if(!adress || adress.trim().length === 0){
        validationErrors.push("Error: Adress can't be empty!")
    } 
    return validationErrors
}

const router = express.Router()

router.get("/", function(request, response) {
    const errors =[]
    db.getAllContacts(function(error, contacts) {
        if(error){
            errors.push("Error!")
            errors.push(error)
            const model = { 
                errors,
                dbErrorOccured: true
            }
            response.render("contacts.hbs", model)
            return
        }else{
            const model = {
                contacts,
                dbErrorOccured: false
            }
            response.render("contacts.hbs", model)
        }
    })
})

router.get("/create", requireLogin, function(request, response) {
    response.render("createContact.hbs")
})
router.post("/create", requireLogin, function(request, response) {
    
    const name = (request.body.name || '').trim()
    const email = (request.body.email || '').trim()
    const phoneNo = (request.body.phoneNo || '').trim()
    const adress = (request.body.adress || '').trim()
    
    const errors = getContactValidationErrors(name, email, phoneNo, adress)
    if(errors.length > 0){
        return response.render("createContact.hbs", { errors })
    }
    db.createContact(name, email, phoneNo, adress, function(error, id){
        if(error){
            const errs = ["Internal Error!", error]
            return response.render("createContact.hbs", { errors: errs, dbErrorOccured: true })
        }
        response.redirect("/contacts")
    })
})
router.get("/update/:id", requireLogin, function(request, response) {
    const id = request.params.id
    db.getContactById(id, function(error, contact) {
        if(error){
            const errs = ["Internal Error!", error]
            return response.render("updateContact.hbs", { errors: errs, dbErrorOccured: true })
        }
        response.render("updateContact.hbs", { contact, dbErrorOccured: false })
    })
})
router.post("/update/:id", requireLogin, function(request, response){

    const id = request.params.id
    
    const newName = (request.body.name || '').trim()
    const newEmail = (request.body.email || '').trim()
    const newPhoneNo = (request.body.phoneNo || '').trim()
    const newAdress = (request.body.adress || '').trim()

    const errors = getContactValidationErrors(newName, newEmail, newPhoneNo, newAdress)
    if(errors.length > 0){
        return response.render("updateContact.hbs", {
            errors,
            contact: { id, name: newName, email: newEmail, phoneNo: newPhoneNo, adress: newAdress }
        })
    }
    db.updateContactById(id, newName, newEmail, newPhoneNo, newAdress, function(error){
        if(error){
            const errs = ["Internal Error!", error]
            return response.render("updateContact.hbs", { errors: errs, dbErrorOccured: true })
        }
        response.redirect("/contacts")
    })
})
router.post("/delete/:id", requireLogin, function(request, response) {

    const id = request.params.id

    db.deleteContactById(id, function(error){
        if(error){
            const errs = ["Internal Error!", error]
            return response.render("contact.hbs", { errors: errs, dbErrorOccured: true })
        }
        response.redirect("/contacts")
    })
})
router.get("/:id", function(request, response){

    const id = request.params.id
    db.getContactById(id, function(error, contact){
        if(error){
            return response.render("contact.hbs", { errors: ["Internal Error!", error], dbErrorOccured: true })
        }
        response.render("contact.hbs", { contact, dbErrorOccured: false })
    })
})

// helper to require authentication
function requireLogin(req, res, next) {
    if (req.session && req.session.isLoggedIn) {
        return next()
    }
    res.status(401).render('login.hbs', { errors: ['You must log in to access that page.'] })
}

module.exports = router
