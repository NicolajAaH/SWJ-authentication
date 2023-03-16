const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
var User = require('./User');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(bodyParser.json());

mongoose.connect(process.env.MONGOURL, { useNewUrlParser: true });

app.post('/register', (req, res) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
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

app.post('/login', (req, res) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
                if (result) {
                    const token = jwt.sign({
                        email: user[0].email,
                        userId: user[0]._id,
                        role: user[0].role
                    }, 'secret', { expiresIn: '1h' });
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
    res.clearCookie('auth-token').send('Logged out');
});

app.get('/users/emails', (req, res) => {
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
})

app.get('/user/:id', (req, res) => {
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
})

app.put('/user/:id', (req, res) => {
    //Update user
    const user = {
        email: req.body.email,
        name: req.body.name,
        role: req.body.role,
        phone: req.body.phone
    };
    User.updateOne({ _id: req.params.id }, user).then(result => {
        res.status(200).json({ message: 'User updated' });
    }).catch(err => {
        res.status(500).json({ error: err });
    }
    );
});

app.listen(port, () => {
    console.log(`Auth service running on port ${port}`);
});

module.exports = app