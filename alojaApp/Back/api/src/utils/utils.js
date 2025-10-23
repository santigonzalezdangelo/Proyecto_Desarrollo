import bcryptjs from "bcryptjs";

//crea el hash agregandole la salt
export const createHash = async (password) => {
  if (!password)
    throw new Error("createHash recibió un valor nulo o indefinido");
  const salt = await bcryptjs.genSalt(10);
  return await bcryptjs.hash(password, salt);
};

//valida hash con la db

export const isValidHash = async (data, hashedData) => {
  return await bcryptjs.compare(data, hashedData);
};

// function parseKey(k) {
//   if (!k) throw new Error("ENCRYPTION_KEY no está definida");
//   try {
//     const hex = Buffer.from(k, "hex");
//     if (hex.length === 32) return hex;
//   } catch {}
//   try {
//     const b64 = Buffer.from(k, "base64");
//     if (b64.length === 32) return b64;
//   } catch {}
//   throw new Error("ENCRYPTION_KEY debe ser 32 bytes en hex o base64");
// }

// export function getKey() {
//   return parseKey(process.env.ENCRYPTION_KEY);
// }

// export function encrypt(plaintext) {
//   const key = getKey();
//   const iv = crypto.randomBytes(12);
//   const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
//   const encrypted = Buffer.concat([cipher.update(String(plaintext), "utf8"), cipher.final()]);
//   const tag = cipher.getAuthTag();
//   // [IV(12)][TAG(16)][DATA]
//   return Buffer.concat([iv, tag, encrypted]).toString("base64");
// }
