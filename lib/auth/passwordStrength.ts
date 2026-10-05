import zxcvbn from "zxcvbn";

export type PasswordStrengthLevel = "Very weak" | "Weak" | "Fair" | "Good" | "Strong";

export type PasswordStrengthResult = {
  score: number;
  level: PasswordStrengthLevel;
  colorClassName: string;
  checks: {
    minLength: boolean;
    hasLowercase: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
};

export function getPasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const zxcvbnResult = zxcvbn(password);
  const score = zxcvbnResult.score;

  const byScore: Record<number, Omit<PasswordStrengthResult, "score" | "checks">> = {
    0: { level: "Very weak", colorClassName: "text-red-600" },
    1: { level: "Weak", colorClassName: "text-red-600" },
    2: { level: "Fair", colorClassName: "text-amber-600" },
    3: { level: "Good", colorClassName: "text-amber-700" },
    4: { level: "Strong", colorClassName: "text-green-700" },
  };

  const rating = byScore[score] ?? byScore[0];
  return {
    score,
    level: rating.level,
    colorClassName: rating.colorClassName,
    checks,
  };
}
