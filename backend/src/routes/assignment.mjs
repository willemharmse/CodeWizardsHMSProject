import express from 'express';

const router = express.Router();

router.get('/api/assignment', function(req, res){
    res.send('No Asssignments created yet');
});

export default router;