const express = require('express')
const db = require('../db')


const MIN_INPUT_LENGTH = 5

function getContactValidationErrors(name, email, phoneNo, adress){
    const validationErrors = []
    if(name.length == 0){
        validationErrors.push("Error: Name can't be empty! Insert a name please!")
    }
    if(!email.includes("@") && !email.includes(".")){
        validationErrors.push("Error: Please write a proper email address!")
    }
    if(phoneNo.length ==0){
        validationErrors.push("Error: Please don't forget to insert Phone Number!")
    } 
    if(adress.length ==0){
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

router.get("/create", function(request, response) {
    response.render("createContact.hbs")
})
router.post("/create", function(request, response) {
    
    const name = request.body.name
    const email = request.body.email
    const phoneNo = request.body.phoneNo
    const adress = request.body.adress
    
    const errors = getContactValidationErrors(name, email, phoneNo, adress)
    if(0<errors.length){
        const model = {errors}
        response.render("createContact.hbs", model)
        return
    }else{
        db.createContact(name,email,phoneNo, adress, function(error, id){
            if(error){
                errors.push("Internal Error!")
                errors.push(error)
                if(0<errors.length){
                    const model = {errors}
                    response.render("createContact.hbs", model)
                    return
                }
                const model = { 
                    dbErrorOccured: true
                }
                response.render("createContact.hbs", model)
            }else{
                response.redirect("/contacts")
            }
        })
    }
})
router.get("/update/:id", function(request, response) {
    const id = request.params.id
    const errors =[]
    if(!request.session.isLoggedIn){
        errors.push("Error:: You must log in first!")
    }
    db.getContactById(id, function(error, contact) {
        if(error){
            errors.push("Internal Error!")
            errors.push(error)
            const model = { 
                errors,
                dbErrorOccured: true
            }
            response.render("updateContact.hbs", model)
        }else{
            const model = {
                contact,
                dbErrorOccured: false
            }
            response.render("updateContact.hbs", model)
        }
    })
})
router.post("/update/:id", function(request, response){

    const id = request.params.id
    
    const newName = request.body.name
    const newEmail = request.body.email
    const newPhoneNo = request.body.phoneNo
    const newAdress = request.body.adress

    const errors = getContactValidationErrors(newName, newEmail, newPhoneNo, newAdress)
    if(!request.session.isLoggedIn){
        errors.push("Errors:Log in first!")
    }
    if(0<errors.length){
        const model ={
            errors,
            contact: {
                id,
                name: newName,
                email: newEmail,
                phoneNo: newPhoneNo,
                adress: newAdress
            }
        }
        response.render("updateContact.hbs", model)
        return
    }
    db.updateContactById(newName, newEmail, newPhoneNo, newAdress, id, function(error){
        if(error){
            errors.push("Internal Error!")
            errors.push(error)
            const model = { 
                dbErrorOccured: true
            }
            response.render("updateContact.hbs", model)
        }else{
            response.redirect("/contacts")
        }
    })
})
router.post("/delete/:id", function(request, response) {

    const id = request.params.id
    const errors=[]
    if(!request.session.isLoggedIn){
      errors.push("Errors: You must log in first!")
    }

    db.deleteContactById(id, function(error){
        if(error){
            errors.push("Internal Error!")
            errors.push(error)
            const model = { 
                errors,
                dbErrorOccured: true
            }
            response.render("contact.hbs", model)
        }else{
            response.redirect("/contacts")
        }
    })
})
router.get("/:id", function(request, response){

    const id = request.params.id
    const errors=[]
    db.getContactById(id, function(error, contact){
        if(error){
            errors.push("Internal Error!")
            errors.push(error)
            const model = { 
                errors,
                dbErrorOccured: true
            }
            response.render("contact.hbs", model)
        }else{
            const model = {
                contact,
                dbErrorOccured: false
            }
            response.render("contact.hbs", model)
        }
    })
})

module.exports = router
