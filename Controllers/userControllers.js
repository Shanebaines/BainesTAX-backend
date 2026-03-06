import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export function createUser(req, res) {
    const newUserData = req.body;
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
                    'BainesTAX');
                    res.status(200).json({ token: token });
                }
            else {
                res.status(401).json({ error: 'Invalid password' });
            }
        }
    }).catch((err) => {
        res.status(500).json({ error: err.message });
    }); 
}

export function deleteUser(req, res) {
    User.deleteOne({ email: req.params.email }).then(() => {
        res.status(200).json({ message: 'User deleted' });
    }).catch((err) => {
        res.status(500).json({ error: err.message });
    });
}   
