import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/users.mjs'; 
import { Student } from '../models/student.mjs';
import { Admin } from '../models/admins.mjs';
import { Lecturer } from '../models/lecturers.mjs';
import verifyToken from '../middleware/verifyJWTToken.mjs'
import restrictUser from '../middleware/restrictUser.mjs'
import jwt from 'jsonwebtoken';
import logger from '../config/logger.mjs';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.use(express.json());

router.post('/create', verifyToken, restrictUser(['admin']), async function(req, res){
    try {
        const { username, password, email, role } = req.body;
        const hashPass = await bcrypt.hash(password, 10);

        const user = await User.findOne({username: username});
        if (user)
        {
            logger.warn(`Failed adding ${username}. Already used by antoher user`);
            return res.status(400).send("User with this username already exists");
        }

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
                user: newUser._id
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

        logger.info(`Creation of user account for user: ${username} successfull`);
        res.status(200).send('User account created');
    }
    catch (err) {
        logger.info(`Error during creation of user account: ${err}`);
        res.status(500).send('Error during creation of account');
    }
});

router.get('/student/:username', async (req, res) => {
    try {
        const username = req.params.username;

        // Find the user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check if the user is a student
        if (user.role !== 'student') {
            return res.status(400).send('User is not a student');
        }

        // Find the student document associated with the user
        const student = await Student.findOne({ user: user._id })
                                     .populate('user')  // This will populate user details
                                     .populate('coursesEnrolled')

        if (!student) {
            return res.status(404).send('Student details not found');
        }

        res.status(200).json(student);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching student details');
    }
});

router.get('/lecturer/:username', async (req, res) => {
    try {
        const username = req.params.username;

        // Find the user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check if the user is a student
        if (user.role !== 'lecturer') {
            return res.status(400).send('User is not a lecturer');
        }

        // Find the student document associated with the user
        const lecturer = await Lecturer.findOne({ user: user._id })
                                     .populate('user')  // This will populate user details
                                     .populate('coursesTaught')

        if (!lecturer) {
            return res.status(404).send('Lecturer details not found');
        }

        res.status(200).json(lecturer);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching lecturer details');
    }
});

router.get('/admin/:username', async (req, res) => {
    try {
        const username = req.params.username;

        // Find the user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check if the user is a student
        if (user.role !== 'admin') {
            return res.status(400).send('User is not a admin');
        }

        // Find the student document associated with the user
        const admin = await Admin.findOne({ user: user._id })
                                     .populate('user')  // This will populate user details

        if (!admin) {
            return res.status(404).send('Admin details not found');
        }

        res.status(200).json(admin);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching admin details');
    }
});

router.post('/login', async function(req, res) {
    try {
        const { username, password } = req.body;

        // Find the user by username and password
        const user = await User.findOne({ username });

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({userId: user, role: user.role}, JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).send('Invalid username or password');
        }
        
    } catch (err) {
        res.status(500).send('Error during login');
    }
});

router.get('/logout', async (req, res) => {
    try {
        res.status(200).send('Successfully logged out');
    } catch (err) {
        res.status(500).send('Error during logout');
    }
});

router.put('/update/:username', verifyToken, restrictUser(['admin']), async (req, res) => {
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