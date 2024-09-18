import express from 'express';
import { Course } from '../models/courses.mjs';

const router = express.Router();

router.use(express.json());

router.get('/courses', function(req, res){
    res.send('No courses created yet');
});

router.post('/create', async function(req, res) {
    try {
        const { courseName, courseCode, description } = req.body;

        const course = new Course({
            courseName: courseName,
            courseCode: courseCode,
            description: description
        });

        await course.save();

        res.status(201).send('Course created successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating course');
    }
});

router.delete('/delete/:courseCode', async function(req, res){
    const courseCode = req.params.courseCode;

    try {
        const course = await Course.findOneAndDelete({ courseCode });

        if (!course) {
            return res.status(404).send('Course not found.');
        }

        res.status(200).send('Course deleted successfully.');
    } 
    catch (error) {
        console.log(error);
        res.status(500).send('Error deleting course.');
    }  
});

router.put('/update/:courseCode', async function(req, res) {
    const Code = req.params.courseCode;
    const Name = req.params.courseName;
    const desc = req.params.description; // The fields to update, sent in the request body

    try {
        const course = await Course.findOne({ courseCode });

        if (!course) {
            return res.status(404).send('Course not found.');
        }

        course.courseCode = Code;
        course.courseName = Name;
        course.description = desc;
        
        await course.save();

        res.status(200).send({ message: 'Course updated successfully.' });
    } 
    catch (error) {
        console.log(error);
        res.status(500).send('Error updating course.');
    }  
});

export default router;