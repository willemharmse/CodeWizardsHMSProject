import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/users.mjs'; 
import { Student } from '../models/student.mjs';
import { Admin } from '../models/admins.mjs';
import { Lecturer } from '../models/lecturers.mjs';

const router = express.Router();

router.use(express.json());

router.post('/create', async function(req, res){
    try {
        const { username, password, email, role } = req.body;
        const hashPass = await bcrypt.hash(password, 10)
        const newUser = new User({ username, password: hashPass, email, role });

        await newUser.save();
        
        if (role === 'student')
        {
            const student = new Student({
                user: newUser._id, 
                enrollmentYear: req.body.enrollmentYear
            });

            await student.save();
        }
        else if (role === 'admin')
        {
            const admin = new Admin({
                user: newUser._id, 
                permissions: req.body.permissions
            });

            await admin.save();
        }
        else if (role === 'lecturer')
        {
            const lecturer = new Lecturer({
                user: newUser._id,
                department: req.body.department
            });

            await lecturer.save();
        }

        res.status(200).send('User account created');
    }
    catch (err) {
        console.log(err);
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