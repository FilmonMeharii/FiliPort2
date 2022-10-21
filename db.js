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
    const values = [id, title, description, createdDate, lastUpdatedDate]
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
    const values = [id, username, projectTitle, comment]
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
    const values = [id, name, email, phoneNo, adress]
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
