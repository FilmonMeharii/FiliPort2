const sqlite3 = require('sqlite3')
const db = new sqlite3.Database("my-database.db")


db.run(`
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        createdDate TEXT, 
        lastUpdatedDate TEXT
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        projectTitle TEXT,
        comment TEXT
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phoneNo int,
        adress TEXT
    )
`)

// user management
const bcrypt = require('bcrypt')

const ADMIN_USERNAME = process.env.ADMIN_USERNAME
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH

// ensure users table exists
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        passwordHash TEXT
    )
`)

// seed an admin user if provided via env and not already present
if (ADMIN_USERNAME && ADMIN_PASSWORD_HASH) {
    db.get("SELECT * FROM users WHERE username = ?", [ADMIN_USERNAME], function(err, user) {
        if (!err && !user) {
            db.run("INSERT INTO users (username, passwordHash) VALUES (?, ?)", [ADMIN_USERNAME, ADMIN_PASSWORD_HASH])
        }
    })
}


/*----------------------------------User-----------------------------------------*/

exports.getUserByUsername = function(username, callback) {
    const query = "SELECT * FROM users WHERE username = ?"
    db.get(query, [username], function(error, user) {
        callback(error, user)
    })
}

exports.createUser = function(username, passwordHash, callback) {
    const query = "INSERT INTO users (username, passwordHash) VALUES (?, ?)"
    db.run(query, [username, passwordHash], function(error) {
        callback(error, this.lastID)
    })
}


/*----------------------------------Project-----------------------------------------*/

exports.getAllProjects = function(callback) {

    const query = "SELECT * FROM projects ORDER BY id"
    
    db.all(query, function(error, projects) {
        callback(error, projects)
    })
} 

exports.createProject = function(title, description, createdDate, lastUpdatedDate, callback) {

    const query = "INSERT INTO projects (title, description, createdDate, lastUpdatedDate) VALUES (?, ?, ?, ?)"
    const values = [title, description, createdDate, lastUpdatedDate]
    
    db.run(query, values, function(error){
        callback(error, this.lastID)
    })
}

exports.getProjectById = function(id, callback) {

    const query = "SELECT * FROM projects WHERE id = ?"
    const values = [id]
    
    db.get(query, values, function(error, project){
        callback(error, project)
    })
}

exports.updateProjectById = function(id, title, description, createdDate, lastUpdatedDate, callback) {
    const query = "UPDATE projects SET title = ?, description = ?, createdDate = ?,  lastUpdatedDate= ?  WHERE id = ?"
    // order of values must match placeholders: title, description, createdDate, lastUpdatedDate, id
    const values = [title, description, createdDate, lastUpdatedDate, id]
    db.run(query, values, function(error) {
        callback(error)
    })
}

exports.deleteProjectById = function(id, callback) {
    const query = "DELETE FROM projects WHERE id = ?"
    const values = [id]
    db.run(query, values, function(error) {
        callback(error)
    })
}

/*----------------------------------Comment-----------------------------------------*/

exports.getAllComments = function(callback) {

    const query = "SELECT * FROM comments ORDER BY id"
    db.all(query, function(error, comments)  {
        callback(error, comments)
    })
}
exports.createComment = function(username, projectTitle, comment, callback) {

    const query = "INSERT INTO comments (username, projectTitle, comment) VALUES (?, ?, ?)"
    const values = [username, projectTitle, comment]
    db.run(query, values, function(error) {
        callback(error, this.lastID)
    })
}
exports.getCommentById = function(id, callback) {

    const query = "SELECT * FROM comments WHERE id = ?"
    const values = [id]
    db.get(query, values, function(error, comment) {
        callback(error, comment)
    })
}
exports.updateCommentById = function(id, username, projectTitle, comment, callback) {

    const query = "UPDATE comments SET username = ?, projectTitle = ?, comment = ? WHERE id = ?"
    // values in same order as placeholders, id comes last
    const values = [username, projectTitle, comment, id]
    db.run(query, values, function(error)  {
        callback(error)
    })
}
exports.deleteCommentById = function(id, callback) {

    const query = "DELETE FROM comments WHERE id = ?"
    const values = [id]
    db.run(query, values, function(error) {
        callback(error)
    })
}

/*----------------------------------Contact-----------------------------------------*/

exports.getAllContacts = function(callback) {

    const query = "SELECT * FROM contacts ORDER BY id"
    db.all(query, function(error, contacts) {
        callback(error, contacts)
    })
}

exports.createContact = function(name, email, phoneNo, adress, callback) {

    const query = "INSERT INTO contacts (name, email, phoneNo, adress) VALUES (?, ?, ?, ?)"
    const values = [name, email, phoneNo, adress]
    db.run(query, values, function(error) {
        callback(error, this.lastID)
    })
}

exports.getContactById = function(id, callback) {

    const query = "SELECT * FROM contacts WHERE id = ?"
    const values = [id]
    db.get(query, values, function(error, contact) {
        callback(error, contact)
    })
}

exports.updateContactById = function(id, name, email, phoneNo, adress, callback) {

    const query = "UPDATE contacts SET name = ?, email = ?, phoneNo = ?, adress = ? WHERE id = ?"
    // values ordered to match placeholders, id at end
    const values = [name, email, phoneNo, adress, id]
    db.run(query, values, function(error) {
        callback(error)
    })
}

exports.deleteContactById = function(id, callback) {

    const query = "DELETE FROM contacts WHERE id = ?"
    const values = [id]
    db.run(query, values, function(error) {
        callback(error)
    })
}
