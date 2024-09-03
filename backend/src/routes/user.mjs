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

router.put('/update/:username', async (req, res) => {
    try{
        const username = req.params.username;
        const { email, role } = req.body;
        
        // Find the user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check if the role has changed
        const oldRole = user.role;
        if (role && role !== oldRole) {
            // Remove from the old role-specific collection
            if (oldRole === 'admin') {
                await Admin.findOneAndDelete({ user: user._id });
            } else if (oldRole === 'student') {
                await Student.findOneAndDelete({ user: user._id });
            }
            else if (oldRole === 'lecturer') {
                await Lecturer.findOneAndDelete({ user: user._id });
            }

            // Add to the new role-specific collection
            if (role === 'admin') {
                await new Admin({ user: user._id, permissions: "[12]"}).save();
            } else if (role === 'student') {
                await new Student({ user: user._id, enrollmentYear: 2000 }).save();
            }
            else if (role === 'lecturer') {
                await new Lecturer({ user: user._id, department: "Schools"}).save();
            }
        }

        user.email = email || user.email;
        user.role = role || user.role;
        await user.save();

        res.status(200).send('User updated successfully');
    }
    catch (err){
        res.status(500).send('Error during update');
    }
});

router.delete('/delete/:username', async function(req, res) {
    const username = req.params.username;

    try {
        const user = await User.findOneAndDelete({ username });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Also delete associated role-specific document
        if (user.role === 'admin') {
            await Admin.findOneAndDelete({ user: user._id });
        } else if (user.role === 'student') {
            await Student.findOneAndDelete({ user: user._id });
        } else if (user.role === 'lecturer') {
            await Lecturer.findOneAndDelete({ user: user._id});
        }

        res.status(200).send('User deleted successfully');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error deleting user');
    }
});

export default router;