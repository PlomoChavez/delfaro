import { decryptToken } from "@/utils/authHelper";
import { jwtDecode } from "jwt-decode";

let timerInterval: ReturnType<typeof setInterval> | null = null;

export function startTokenTimer(onExpire: () => void) {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const encryptedToken = localStorage.getItem("token");
    if (!encryptedToken) {
      clearInterval(timerInterval!);
      timerInterval = null;
      onExpire();
      return;
    }
    let token_exp = 0;
    try {
      const jwt = decryptToken(encryptedToken);
      const decoded: any = jwtDecode(jwt);
      token_exp = decoded.exp || 0;
      const segundosRestantes = token_exp - Math.floor(Date.now() / 1000);
      if (segundosRestantes <= 0) {
        clearInterval(timerInterval!);
        timerInterval = null;
        onExpire();
        return;
      }
    } catch {
      clearInterval(timerInterval!);
      timerInterval = null;
      onExpire();
      return;
    }
  }, 1000); // Cada segundo
}

export function stopTokenTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}
