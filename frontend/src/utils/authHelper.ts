import { router } from "@/plugins/1.router";
import CryptoJS from "crypto-js";
import { jwtDecode } from "jwt-decode";

export function handleLogOut(redirect = true) {
  localStorage.removeItem("token");
  localStorage.removeItem("userData");
  if (redirect) {
    router.push({ name: "login" });
  }
}

// Asegúrate que esta clave sea exactamente igual a la del backend y de 32 caracteres
const ENCRYPTION_KEY = import.meta.env.VITE_JWT_ENCRYPT_KEY; // 32 caracteres ASCII

function getKey256(key: string): CryptoJS.lib.WordArray {
  let keyUtf8 = CryptoJS.enc.Utf8.parse(key);
  const keyBytes = keyUtf8.sigBytes;
  if (keyBytes < 32) {
    // Rellenar con ceros
    const zeros = CryptoJS.lib.WordArray.create(new Array(32 - keyBytes));
    keyUtf8 = keyUtf8.concat(zeros);
    keyUtf8.sigBytes = 32;
  } else if (keyBytes > 32) {
    // Recortar
    keyUtf8 = CryptoJS.lib.WordArray.create(keyUtf8.words.slice(0, 8), 32);
  }
  return keyUtf8;
}

export function decryptToken(encrypted: string): string {
  try {
    if (!encrypted || !encrypted.includes(":")) return "";
    const [ivHex, encryptedHex] = encrypted.split(":");
    if (!ivHex || !encryptedHex) return "";

    // Procesa la clave igual que en el backend
    const key = getKey256(ENCRYPTION_KEY);

    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encryptedWordArray = CryptoJS.enc.Hex.parse(encryptedHex);
    const encryptedBase64 = CryptoJS.enc.Base64.stringify(encryptedWordArray);

    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const result = decrypted.toString(CryptoJS.enc.Utf8);
    if (!result) return "";
    return result;
  } catch (e) {
    console.error("Error al desencriptar el token:", e);
    return "";
  }
}
export function getTokenRemainingSeconds(): number {
  const encryptedToken = localStorage.getItem("token");
  if (!encryptedToken) return 0;
  try {
    const jwt = decryptToken(encryptedToken);
    if (!jwt) return 0;
    const decoded: any = jwtDecode(jwt);
    if (!decoded.exp) return 0;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp - now;
  } catch {
    return 0;
  }
}
