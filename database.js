var sqlite3 = require('sqlite3').verbose()
var md5 = require('md5')

const DBSOURCE = "db.sqlite"


let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message)
        throw err
    } else {
        console.log('Connected to the SQlite database.')
        db.run(`CREATE TABLE phone (
            phone int
            )`, (err) => {
            if (err) {
                // Table already created
            } else {
                // Table just created, creating some rows
                var insert = 'INSERT INTO phone (phone) VALUES (?)'
                db.run(insert, ["603421431"])
                db.run(insert, ["655987070"])
                db.run(insert, ["618740740"])
            }
        })
        db.run(`CREATE TABLE phoneAction (
            acceptPhoneActionType text,
            acceptId int,
            errorPhoneActionType text,
            errorId int
            )`, (err) => {
            if (err) {
                // Table already created
            } else {
                // Table just created, creating some rows
                var insert = 'INSERT INTO phoneAction (acceptPhoneActionType, acceptId,errorPhoneActionType, errorId) VALUES (?,?,?,?)'
                db.run(insert, ["QUEUE", "6", "IVR", "3"])
            }
        })
        db.run(`CREATE TABLE log (
            action text,
            phone text,
            status text,
            time text
            )`, (err) => {
            if (err) {
                // Table already created
            } else {
                // Table just created, creating some rows
            }
        })
        db.run(`CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text, 
            email text UNIQUE, 
            password text, 
            CONSTRAINT email_unique UNIQUE (email)
            )`, (err) => {
            if (err) {
                // Table already created
            } else {
                // Table just created, creating some rows
                var insert = 'INSERT INTO user (name, email, password) VALUES (?,?,?)'
                db.run(insert, ["admin", "admin@example.com", "admin123456"])
                db.run(insert, ["user", "user@example.com", "user123456"])
            }
        })  
    }
})


module.exports = db

