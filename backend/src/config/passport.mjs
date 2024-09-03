import passport from 'passport';
import { Strategy as OpenIDConnectStrategy } from 'passport-openidconnect';
import dotenv from 'dotenv';
import User from '../models/User.mjs';

dotenv.config();

passport.use(new OpenIDConnectStrategy({
  issuer: process.env.OIDC_ISSUER_URL,
  clientID: process.env.OIDC_CLIENT_ID,
  clientSecret: process.env.OIDC_CLIENT_SECRET,
  callbackURL: process.env.OIDC_CALLBACK_URL,
  authorizationURL: `${process.env.OIDC_ISSUER_URL}/protocol/openid-connect/auth`,
  tokenURL: `${process.env.OIDC_ISSUER_URL}/protocol/openid-connect/token`,
  userInfoURL: `${process.env.OIDC_ISSUER_URL}/protocol/openid-connect/userinfo`,
  scope: 'openid profile email'
},
function(issuer, sub, profile, accessToken, refreshToken, done) {
  User.findOne({ oauthID: sub }, function(err, user) {
    if (err) return done(err);

    if (user) {
      return done(null, user);
    } else {
      const newUser = new User({
        oauthID: sub,
        name: profile.displayName,
        email: profile.emails[0].value,
        profilePicture: profile.photos[0].value
      });

      newUser.save(function(err) {
        if (err) throw err;
        return done(null, newUser);
      });
    }
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

export default passport;