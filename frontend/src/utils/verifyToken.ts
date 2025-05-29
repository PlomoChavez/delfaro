import { decryptToken } from "@/utils/authHelper";
import { jwtDecode } from "jwt-decode";

let timerInterval: ReturnType<typeof setInterval> | null = null;

export function startTokenTimer(onExpire: () => void) {
  console.log("Starting token timer...");
  if (timerInterval) clearInterval(timerInterval);

  console.log("setInterval initialized");
  timerInterval = setInterval(() => {
    const encryptedToken = localStorage.getItem("token");
    if (!encryptedToken) {
      onExpire();
      return;
    }
    console.log("Encrypted token:", encryptedToken);
    console.log("Encrypted token:", !encryptedToken);
    console.log("Encrypted token:", decryptToken(encryptedToken));
    let token_exp = 0;
    try {
      const jwt = decryptToken(encryptedToken);
      const decoded: any = jwtDecode(jwt);
      token_exp = decoded.exp || 0;
      const segundosRestantes = token_exp - Math.floor(Date.now() / 1000);
      console.log("Token expiration time:", token_exp);
      console.log("Segundos restantes:", segundosRestantes);
    } catch {
      token_exp = 0;
    }

    if (token_exp === 0) {
      onExpire();
    }
  }, 1000); // Cada segundo
  console.log("Token timer started");
}

export function stopTokenTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}
