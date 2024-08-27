import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/users.mjs'; 

const router = express.Router();

router.use(express.json());

router.post('/create', async function(req, res){
    try {
        const { username, password, email, role } = req.body;
        const hashPass = await bcrypt.hash(password, 10)
        const newUser = new User({ username, password: hashPass, email, role });

        await newUser.save();

        res.status(200).send('User account created');
    }
    catch (err) {
        res.status(500).send('Error during creation of account');
    }
});

router.post('/login', async function(req, res) {
    try {
        const { username, password } = req.body;

        // Find the user by username and password
        const user = await User.findOne({ username });

        if (user && await bcrypt.compare(password, user.password)) {
            res.status(200).send('Login successful');
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (err) {
        res.status(500).send('Error during login');
    }
});

export default router;