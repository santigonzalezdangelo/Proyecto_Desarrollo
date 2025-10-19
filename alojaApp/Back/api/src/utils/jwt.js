// import jwt from "jsonwebtoken";

// export const signToken = (payload) => {
//   return jwt.sign(payload, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES || "7d",
//   });
// };


// const SECRET = (process.env.JWT_SECRET || "").trim();

// export const verifyToken = (token) =>
//   jwt.verify(token, SECRET, { algorithms: ["HS256"] }); // login usa HS256 por defecto

// export const setAuthCookie = (res, token) => {
//   res.cookie("aloja_jwt", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
//   });
// };

// export const clearAuthCookie = (res) => {
//   res.clearCookie("aloja_jwt", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//   });
// };

import jwt from "jsonwebtoken";

export const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
};

const SECRET = (process.env.JWT_SECRET || "").trim();

export const verifyToken = (token) =>
  jwt.verify(token, SECRET, { algorithms: ["HS256"] });

const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",                    
};

export const setAuthCookie = (res, token) => {
  res.cookie("aloja_jwt", token, {
    ...cookieBase,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
  });
};

export const clearAuthCookie = (res) => {
  // 1) clear “normal” (flags idénticos)
  res.clearCookie("aloja_jwt", cookieBase);

  // 2) refuerzo: Max-Age=0 por si algún navegador lo requiere
  res.cookie("aloja_jwt", "", { ...cookieBase, maxAge: 0 });

};
