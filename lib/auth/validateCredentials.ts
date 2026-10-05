import { getPasswordStrength } from "@/lib/auth/passwordStrength";

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function isValidEmail(email: string): boolean {
  const t = email.trim();
  return t.length > 0 && t.length <= 254 && EMAIL_RE.test(t);
}

export function isValidGmail(email: string): boolean {
  const t = email.trim().toLowerCase();
  return isValidEmail(t) && t.endsWith("@gmail.com");
}

export function validateLoginInput(email: string, password: string): string | null {
  if (!isValidGmail(email)) return "Enter a valid Gmail address.";
  if (!password || password.length < 1) return "Enter your password.";
  return null;
}

export function validateSignupInput(
  name: string,
  email: string,
  password: string,
): string | null {
  const n = name.trim();
  if (n.length < 1) return "Enter your name.";
  if (n.length > 120) return "Name must be at most 120 characters.";
  if (!isValidGmail(email)) return "Enter a valid Gmail address.";
  if (!password || password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password.length > 128) return "Password must be at most 128 characters.";
  if (getPasswordStrength(password).score < 3) {
    return "Password is too weak. Use upper/lowercase letters, a number, and a symbol.";
  }
  return null;
}
