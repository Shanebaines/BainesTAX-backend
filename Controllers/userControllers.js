import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '1015040911222-9175stepk3cj3ocv6pl8hq48nl4f96nm.apps.googleusercontent.com');

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildToken(user) {
    return jwt.sign(
        { firstName: user.FirstName, lastName: user.LastName, email: user.email, type: user.Type, isBlocked: user.isBlocked },
        process.env.Secret_Key_FOR_TOKEN,
    );
}

function buildUserResponse(user) {
    return {
        firstName: user.FirstName,
        lastName: user.LastName,
        email: user.email,
        type: user.Type,
        isBlocked: user.isBlocked,
        profilePicture: user.profilePicture,
    };
}


export function createUser(req, res) {
    const newUserData = { ...req.body };
    newUserData.email = normalizeEmail(newUserData.email);
    newUserData.Type = 'Customer';
    newUserData.authProvider = 'local';

    if (!newUserData.FirstName || !newUserData.LastName || !newUserData.email || !newUserData.password) {
        return res.status(400).json({ error: 'First name, last name, email, and password are required' });
    }

    if (newUserData.Type === 'Admin') {
        if (!req.user || req.user.type !== 'Admin') {
            return res.status(403).json({ error: 'Cannot create an Admin account only Admins can create an Admin account' });
        }
    }

    newUserData.password = bcrypt.hashSync(newUserData.password, 10);
    newUserData.profilePicture = newUserData.profilePicture || undefined;

    User.findOne({ email: new RegExp(`^${escapeRegExp(newUserData.email)}$`, 'i') })
        .then((existingUser) => {
            if (existingUser) {
                return res.status(409).json({ error: 'An account with this email already exists' });
            }

            const user = new User(newUserData);
            return user.save().then((savedUser) => {
                res.status(201).json({
                    token: buildToken(savedUser),
                    user: buildUserResponse(savedUser),
                    created: true,
                    message: 'Customer account created successfully',
                });
            });
        })
        .catch((err) => {
            res.status(400).json({ error: err.message });
        });
}

export function loginUser(req, res) {
    console.log('Login attempt received:', { email: req.body.email })
    const email = normalizeEmail(req.body.email)

    User.findOne({ email: new RegExp(`^${escapeRegExp(email)}$`, 'i') }).then((user) => {
        if(!user) {
            console.log('Login failed: user not found', { email })
            return res.status(404).json({ error: 'User not found' });
        }

        const isPasswordValid = bcrypt.compareSync(req.body.password, user.password);
        if(isPasswordValid) {
            const responseBody = {
                token: buildToken(user),
                user: buildUserResponse(user),
            };

            console.log('Login success response:', responseBody)
            res.status(200).json(responseBody);
            console.log({
                firstName: user.FirstName,
                lastName: user.LastName,
                Type: user.Type,
            })
        }
        else {
            console.log('Login failed: invalid password', { email })
            res.status(401).json({ error: 'Invalid password' });
        }
    }).catch((err) => {
        res.status(500).json({ error: err.message });
    }); 
}

export async function googleLoginUser(req, res) {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ error: 'Google credential is required' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID || '1015040911222-9175stepk3cj3ocv6pl8hq48nl4f96nm.apps.googleusercontent.com',
        });

        const payload = ticket.getPayload();
        const email = normalizeEmail(payload?.email);
        const googleId = payload?.sub;
        const firstName = payload?.given_name || payload?.name?.split(' ')?.[0] || 'Google';
        const lastName = payload?.family_name || payload?.name?.split(' ')?.slice(1).join(' ') || 'User';
        const profilePicture = payload?.picture;

        if (!email || !googleId) {
            return res.status(400).json({ error: 'Google account data is incomplete' });
        }

        let user = await User.findOne({ email: new RegExp(`^${escapeRegExp(email)}$`, 'i') });

        if (user && user.Type !== 'Customer') {
            return res.status(403).json({ error: 'Only customers can log in with Google' });
        }

        let created = false;

        if (!user) {
            const randomPassword = crypto.randomUUID();
            user = new User({
                email,
                FirstName: firstName,
                LastName: lastName,
                password: bcrypt.hashSync(randomPassword, 10),
                Type: 'Customer',
                profilePicture: profilePicture || undefined,
                googleId,
                authProvider: 'google',
            });
            await user.save();
            created = true;
        } else {
            user.googleId = user.googleId || googleId;
            user.authProvider = 'google';
            user.profilePicture = user.profilePicture || profilePicture;
            await user.save();
        }

        const token = buildToken(user);

        return res.status(200).json({
            token,
            user: buildUserResponse(user),
            created,
            message: created ? 'Customer account created with Google' : 'Google login successful',
        });
    } catch (error) {
        console.error('Google login failed:', error);
        return res.status(401).json({ error: 'Google login failed' });
    }
}

export async function isCustomer(req, res, next) {
    if (req.user && req.user.type === 'Customer')
        return next();
    else
        return res.status(403).json({ error: 'Access denied, only Customers can access this route' });
}

export async function isAdmin(req, res, next) {
    if (req.user && req.user.type === 'Admin')
        return next();
    else
        return res.status(403).json({ error: 'Access denied, only Admins can access this route' });
}   


