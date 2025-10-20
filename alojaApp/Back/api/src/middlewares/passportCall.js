// middlewares/passportCall.js
import passport from "passport";

export const passportCall = (strategy) =>
  (req, res, next) =>
    passport.authenticate(strategy, { session: false })(req, res, next);
