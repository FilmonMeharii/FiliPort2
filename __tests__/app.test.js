const request = require('supertest')
let app

beforeAll(() => {
    // load app lazily to ensure .env is processed
    app = require('../app')
})

describe('GET /', () => {
    test('responds with 200', async () => {
        const resp = await request(app).get('/')
        expect(resp.statusCode).toBe(200)
    })
})
