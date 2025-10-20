// middlewares/passport.js
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

// Lee de cookie "token" o de Authorization: Bearer
const fromCookie = (req) => req?.cookies?.token || null;

export function registerPassport() {
  passport.use(
    "current",
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([
          fromCookie,
          ExtractJwt.fromAuthHeaderAsBearerToken(),
        ]),
        secretOrKey: process.env.JWT_SECRET, // definilo en .env
      },
      async (payload, done) => {
        // Espera un payload { uid, rid }
        // Mapear a lo que querés exponer en req.user
        return done(null, { user_id: payload.uid, rol_id: payload.rid });
      }
    )
  );
}

export default passport;
