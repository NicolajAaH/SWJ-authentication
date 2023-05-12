const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
var User = require('./User');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const port = 3000;

const secret = Buffer.from(process.env.SECRET, 'base64').toString('ascii'); //It is encoded in base64 as environment variable

app.use(bodyParser.json());

mongoose.connect(process.env.MONGOURL, { useNewUrlParser: true });

//Register an user - returns 201 if created
app.post('/register', (req, res) => {
    console.log("Registering user: " + req.body.email);
    bcrypt.hash(req.body.password, 10, (err, hash) => { //Hash the password for security
        if (err) {
            res.status(500).json({ error: err });
        } else {
            const user = new User({
                email: req.body.email,
                password: hash,
                name: req.body.name,
                role: req.body.role,
                phone: req.body.phone
            });
            user.save()
                .then(result => {
                    res.status(201).json({
                        message: 'User created',
                        result: result
                    });
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).json({
                        error: err
                    });
                });
        }
    });
});

//Login an user - returns 200 if successful with a JWT
app.post('/login', (req, res) => {
    console.log("Logging in user: " + req.body.email);
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) { //If no user found
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => { //Compare hashed password
                if (err) {
                    return res.status(401).json({ //Not equal
                        message: 'Auth failed'
                    });
                }
                if (result) {
                    const token = jwt.sign({
                        email: user[0].email,
                        userId: user[0]._id,
                        role: user[0].role,
                        phone: user[0].phone,
                        name: user[0].name
                    }, secret, { expiresIn: '1h' }); //Create JWT with expiry of 1 hour
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token
                    });
                }
                res.status(401).json({
                    message: 'Auth failed'
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

app.post('/logout', (req, res) => {
    console.log("Logging out user: " + req.body.email);
    res.clearCookie('auth-token').send('Logged out');
});

//Get all emails for users 
app.get('/users/emails', (req, res) => {
    console.log("Getting all users emails");
    User.find()
        .exec()
        .then(users => {
            const emails = users.map(user => user.email);
            res.status(200).json(emails);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

//Get user by id
app.get('/user/:id', (req, res) => {
    console.log("Getting user: " + req.params.id);
    User.findById(req.params.id)
        .exec()
        .then(user => {
            res.status(200).json(user);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

//Update a user by id
app.put('/user/:id', (req, res) => {
    console.log("Updating user: " + req.params.id);
    //Update user
    const user = {
        email: req.body.email,
        name: req.body.name,
        phone: req.body.phone,
        updated_at: Date.now()
    };
    User.updateOne({ _id: req.params.id }, user).then(result => {
        res.status(200).json({ message: 'User updated' });
    }).catch(err => {
        res.status(500).json({ error: err });
    }
    );
});

//Delete a user by id
app.delete('/user/:id', (req, res) => {
    console.log("Deleting user: " + req.params.id);
    User.deleteOne({ _id: req.params.id }).then(result => {
        res.status(200).json({ message: 'User deleted' });
    }).catch(err => {
        res.status(500).json({ error: err });
    }
    );
});

app.listen(port, () => {
    console.log(`Auth service running on port ${port}`);
});

module.exports = app