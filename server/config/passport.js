const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || `${backendUrl}/api/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();

          if (!email) {
            return done(new Error('No email returned from Google'));
          }

          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            user = await User.findOne({ email });
          }

          if (user) {
            if (!user.googleId) {
              user.googleId = profile.id;
              user.authProvider = 'google';
            }

            if (!user.name && profile.displayName) {
              user.name = profile.displayName;
            }

            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }

            await user.save();
            return done(null, user);
          }

          user = await User.create({
            name: profile.displayName || email.split('@')[0],
            email,
            avatar: profile.photos?.[0]?.value || '',
            googleId: profile.id,
            authProvider: 'google',
            password: undefined,
          });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
} else {
  console.warn('⚠️ Google OAuth credentials not found in .env. Google login will be disabled.');
}

module.exports = passport;
