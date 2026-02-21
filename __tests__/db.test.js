const db = require('../db')
const bcrypt = require('bcrypt')

describe('database user operations', () => {
    const testUsername = 'unittest_' + Date.now()
    const testPassword = 'password123'

    test('creates a user', done => {
        const hash = bcrypt.hashSync(testPassword, 10)
        db.createUser(testUsername, hash, (err, id) => {
            expect(err).toBeNull()
            expect(id).toBeDefined()
            done()
        })
    }, 10000)

    test('retrieves user by username', done => {
        db.getUserByUsername(testUsername, (err, user) => {
            expect(err).toBeNull()
            expect(user).toBeDefined()
            if (user) {
                expect(user.username).toBe(testUsername)
            }
            done()
        })
    }, 10000)
})