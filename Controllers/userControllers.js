import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


export function createUser(req, res) {
    const newUserData = req.body;
    if (newUserData.Type === 'Admin') {
        if (!req.user || req.user.type !== 'Admin') {
            return res.status(403).json({ error: 'Cannot create an Admin account only Admins can create an Admin account' });
        }
    }

    newUserData.password = bcrypt.hashSync(newUserData.password, 10);

    const user = new User(newUserData);
    user.save().then((savedUser) => {
        res.status(201).json(savedUser);
    }).catch((err) => {
        res.status(400).json({ error: err.message });
    });
}

export function loginUser(req, res) {
    User.find({ email: req.body.email }).then((users) => {
        if(users.length == 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        else {
            const user = users[0];
            const isPasswordValid = bcrypt.compareSync(req.body.password, user.password);
            if(isPasswordValid) {
                const token = jwt.sign(
                { firstName: user.FirstName, lastName: user.LastName, email: user.email, type: user.Type, isBlocked: user.isBlocked },
                    process.env.Secret_Key_FOR_TOKEN,
                    );
                    res.status(200).json({ token: token });
                    console.log({
                        firstName: user.FirstName,
                        lastName: user.LastName,
                        Type: user.Type,
                    })
                }
            else {
                res.status(401).json({ error: 'Invalid password' });
            }
        }
    }).catch((err) => {
        res.status(500).json({ error: err.message });
    }); 
}

 
