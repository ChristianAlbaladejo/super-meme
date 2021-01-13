var sqlite3 = require('sqlite3').verbose()
var md5 = require('md5')

const DBSOURCE = "db.sqlite" 


let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQlite database.')
        db.run(`CREATE TABLE phone (
            phone int
            )`,(err) => {
        if (err) {
            // Table already created
        }else{
            // Table just created, creating some rows
            var insert = 'INSERT INTO phone (phone) VALUES (?)'
            db.run(insert, ["603421431"])
            db.run(insert, ["655987070"])
            db.run(insert, ["618740740"])
        }
    })  
    }
})


module.exports = db

