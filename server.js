var express = require("express")
var app = express()
var db = require("./database.js")
var md_auth = require('./middlewares/authentificated')
var jwt = require('./services/jwt');


var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var HTTP_PORT = 8000

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');

    next();
});

// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT))
});

app.get("/api/phoneAction/", md_auth.ensureAuth, (req, res, next) => {
    var sql = "select * from phoneAction"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        })
    });
});

app.get("/api/log/", md_auth.ensureAuth, (req, res, next) => {
    var sql = "select * from log order by time DESC"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        })
    });
});

app.get("/api/phones/", md_auth.ensureAuth, (req, res, next) => {
    var sql = "select * from phone"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        })
    });
});

app.get("/api/users", md_auth.ensureAuth, (req, res, next) => {
    var sql = "select * from user"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        })
    });
});

app.get("/api/user/:id", md_auth.ensureAuth, (req, res, next) => {
    var sql = "select * from user where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": row
        })
    });
});


app.post("/api/phone/", md_auth.ensureAuth, (req, res, next) => {
    var data = {
        phone: req.body.did,
    }
    var sql = "select * from phoneAction"
    var params = []
    var phoneAction;
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        phoneAction = rows;
    });
    console.log(phoneAction)
    var sql = "select * from phone where phone =" + data.phone
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        if (rows.length == 0) {
            res.json({
                "phoneActionType": phoneAction.errorPhoneActionType,
                "phoneActionId": phoneAction.errorId,
            })
        } else {
            res.json({
                "phoneActionType": phoneAction.acceptPhoneActionType,
                "phoneActionId": phoneAction.errorId,
            })
        }
    });
})

app.post("/api/user/", md_auth.ensureAuth, (req, res, next) => {
    var errors = []
    if (!req.body.password) {
        errors.push("No password specified");
    }
    if (!req.body.email) {
        errors.push("No email specified");
    }
    if (errors.length) {
        res.status(400).json({ "error": errors.join(",") });
        return;
    }
    var data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    }
    var sql = 'INSERT INTO user (name, email, password) VALUES (?,?,?)'
    var params = [data.name, data.email, data.password]
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message })
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id": this.lastID
        })
    });
})

app.post("/api/log/", md_auth.ensureAuth, (req, res, next) => {
    var errors = []
    if (!req.body.action) {
        errors.push("No action specified");
    }
    if (!req.body.status) {
        errors.push("No status specified");
    }
    if (errors.length) {
        res.status(400).json({ "error": errors.join(",") });
        return;
    }
    var datetime = new Date();
    var data = {
        action: req.body.action,
        phone: req.body.phone,
        status: req.body.status,
        time: datetime.toISOString()
    }
    var sql = 'INSERT INTO log (action, phone, status, time) VALUES (?,?,?,?)'
    var params = [data.action, data.phone, data.status, data.time]
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message })
            return;
        }
        res.json({
            "message": "success",
            "data": data
        })
    });
})

app.post("/api/addPhone/", md_auth.ensureAuth, (req, res, next) => {
    var errors = []
    if (!req.body.phone) {
        errors.push("No phone specified");
    }
    if (errors.length) {
        res.status(400).json({ "error": errors.join(",") });
        return;
    }
    var data = {
        phone: req.body.phone,
    }
    var sql = "select * from phone where phone =" + data.phone
    var params = []
    db.all(sql, params, (err, rows) => {
        console.log(rows)
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        if (rows.length == 0) {
            var sql = 'INSERT INTO phone (phone) VALUES (?)'
            var params = [data.phone]
            db.run(sql, params, function (err, result) {
                if (err) {
                    var sql = 'INSERT INTO log (action, phone, status, time) VALUES (?,?,?,?)'
                    var datetime = new Date();
                    var params = ['Teléfeno añadido', data.phone, "error", datetime.toISOString()]
                    db.run(sql, params, function (err, result) {
                        if (err) {
                            res.status(400).json({ "error": err.message })
                            return;
                        }
                    });
                    res.status(400).json({ "error": err.message })
                    return;
                }
                var sql = 'INSERT INTO log (action, phone, status, time) VALUES (?,?,?,?)'
                var datetime = new Date();
                var params = ['Teléfeno añadido', data.phone, "success", datetime.toISOString()]
                db.run(sql, params, function (err, result) {
                    if (err) {
                        res.status(400).json({ "error": err.message })
                        return;
                    }
                });
                res.json({
                    "message": "success",
                    "data": data,
                })
            });
        } else {
            res.json({
                "error": "Ya existe"
            })
        }
    });
})



app.patch("/api/user/:id", md_auth.ensureAuth, (req, res, next) => {
    var data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password ? req.body.password : undefined
    }
    db.run(
        `UPDATE user set 
           name = coalesce(?,name), 
           email = COALESCE(?,email), 
           password = coalesce(?,password) 
           WHERE id = ?`,
        [data.name, data.email, data.password, req.params.id],
        (err, result) => {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({
                message: "success",
                data: data
            })
        });
})

app.put("/api/phoneAction", md_auth.ensureAuth, (req, res, next) => {
    var data = {
        acceptPhoneActionType: req.body.acceptPhoneActionType,
        acceptId: req.body.acceptId,
        errorPhoneActionType: req.body.errorPhoneActionType,
        errorId: req.body.errorId,
    }
    db.run(
        `UPDATE phoneAction set 
           acceptPhoneActionType = coalesce(?,acceptPhoneActionType), 
           acceptId = COALESCE(?,acceptId), 
           errorPhoneActionType = coalesce(?,errorPhoneActionType),
           errorId = COALESCE(?,errorId)
           `,
        [data.acceptPhoneActionType, data.acceptId, data.errorPhoneActionType, data.errorId],
        (err, result) => {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            var sql = 'INSERT INTO log (action, phone, status, time) VALUES (?,?,?,?)'
            var datetime = new Date();
            var params = ['Teléfeno añadido', data.phone, "success", datetime.toISOString()]
            db.run(sql, params, function (err, result) {
                if (err) {
                    res.status(400).json({ "error": err.message })
                    return;
                }
            });
            res.json({
                message: "success",
                data: data
            })
        });
})


app.delete("/api/phone/:phone", md_auth.ensureAuth, (req, res, next) => {
    db.run(
        'DELETE FROM phone WHERE phone = ?',
        req.params.phone,
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            var sql = 'INSERT INTO log (action, phone, status, time) VALUES (?,?,?,?)'
            var datetime = new Date();
            var params = ['Teléfeno eliminado', req.params.phone, "success", datetime.toISOString()]
            db.run(sql, params, function (err, result) {
                if (err) {
                    res.status(400).json({ "error": err.message })
                    return;
                }
            });
            res.json({ "message": "deleted", rows: this.changes })
        });
})

app.post("/api/login/", (req, res, next) => {
    var errors = []
    if (!req.body.password) {
        errors.push("No password specified");
    }
    if (!req.body.email) {
        errors.push("No email specified");
    }
    if (errors.length) {
        res.status(400).json({ "error": errors.join(",") });
        return;
    }
    var data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    }
    var sql = `select * from user 
           WHERE email = ? and password = ?`
    console.log(sql)
    var params = [data.email, data.password]
    db.all(sql, params, (err, rows) => {
        console.log(rows)
        if (err) {
            var sql = 'INSERT INTO log (action, phone, status, time) VALUES (?,?,?,?)'
            var datetime = new Date();
            var params = ['Error en login ', data.email, "error", datetime.toISOString()]
            db.run(sql, params, function (err, result) {
                if (err) {
                    res.status(400).json({ "error": err.message })
                    return;
                }
            });
            res.status(400).json({ "error": err.message });
            return;
        }
        if (rows.length == 0) {
            res.json({
                "error": "error"
            })
        } else {
            var sql = 'INSERT INTO log (action, phone, status, time) VALUES (?,?,?,?)'
            var datetime = new Date();
            var params = ['Usuario logueado ', data.email, "success", datetime.toISOString()]
            db.run(sql, params, function (err, result) {
                if (err) {
                    res.status(400).json({ "error": err.message })
                    return;
                }
            });
            rows.password = ""
            res.json({
                "token": jwt.createToken(data),
                "user": rows
            })
        }
    });
})


// Root path
app.get("/", (req, res, next) => {
    res.json({ "message": "Ok" })
});

