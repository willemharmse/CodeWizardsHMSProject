import express from 'express';
import passport from '../config/passport.mjs';

const router = express.Router();

router.get('/login', passport.authenticate('openidconnect'));

router.get('/callback', 
  passport.authenticate('openidconnect', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/dashboard');
  }
);

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

export default router;