import express from 'express';

const router = express.Router();

router.get('/api/user', function(req, res){
    res.send('No User created yet');
});

export default router;