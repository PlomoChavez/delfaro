import crypto from "crypto";
import jwt from "jsonwebtoken";

const ENCRYPTION_KEY =
  process.env.JWT_ENCRYPT_KEY || "delfaroSuperClaveSeguraAES256123456"; // 32 caracteres ASCII
const JWT_SECRET = process.env.JWT_SECRET || "mi_secreto_super_seguro";

// Asegura un Buffer de 32 bytes exactos
let keyBuffer = Buffer.from(ENCRYPTION_KEY, "utf-8");
if (keyBuffer.length < 32) {
  // Rellena con ceros si es menor
  const fill = Buffer.alloc(32 - keyBuffer.length);
  keyBuffer = Buffer.concat([keyBuffer, fill]);
} else if (keyBuffer.length > 32) {
  // Recorta si es mayor
  keyBuffer = keyBuffer.slice(0, 32);
}

export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(text, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(text) {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Crea y cifra un token JWT
export function createTokenJWT(payload, expiresIn = "8h") {
  const token = createEncryptedJWT(payload, expiresIn);
  return encrypt(token);
}

export function createEncryptedJWT(payload, expiresIn = "8h") {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn });
  return token;
}

// Descifra y verifica un token JWT
export function verifyEncryptedJWT(encryptedToken) {
  const token = decrypt(encryptedToken);
  console.log("Verifying token:", token);
  return jwt.verify(token, JWT_SECRET);
}
