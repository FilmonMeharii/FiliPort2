const express = require('express')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const db = require('../db')

const router = express.Router()

// registration form
router.get('/register', function(req, res) {
    res.render('register.hbs')
})

router.post('/register',
    // validation and sanitization
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 chars long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars long'),
    async function(req, res) {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.render('register.hbs', { errors: errors.array().map(e=>e.msg) })
        }

        const username = req.body.username
        const password = req.body.password
        const hash = await bcrypt.hash(password, 10)
        db.createUser(username, hash, function(err, id) {
            if (err) {
                // probably duplicate
                return res.render('register.hbs', { errors: ['Username already exists'] })
            }
            // auto-login
            req.session.isLoggedIn = true
            res.redirect('/')
        })
    }
)

module.exports = router