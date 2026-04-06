/**
 * Passport.js Configuration for Google OAuth 2.0
 * Handles authentication strategy and user serialization
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  scope: [
    'profile',
    'email',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.labels',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ],
  accessType: 'offline',
  prompt: 'consent'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Find or create user
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      // Update tokens and profile info
      user.googleToken = accessToken;
      user.refreshToken = refreshToken;
      user.email = profile.emails?.[0]?.value;
      user.name = profile.displayName;
      user.avatar = profile.photos?.[0]?.value;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        googleId: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName,
        avatar: profile.photos?.[0]?.value,
        googleToken: accessToken,
        refreshToken: refreshToken
      });
    }

    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

module.exports = passport;
