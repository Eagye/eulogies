"use client";

type Variant = "login" | "signup";

const LABELS: Record<Variant, string> = {
  login: "Continue with Google",
  signup: "Sign up with Google",
};

export default function GoogleAuthLink({ variant }: { variant: Variant }) {
  const href =
    variant === "signup"
      ? "/api/auth/google?from=signup"
      : "/api/auth/google?from=login";

  return (
    <a
      href={href}
      className="w-full mt-6 flex items-center justify-center gap-3 border py-2 rounded-lg hover:bg-gray-50 transition cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        window.location.assign(href);
      }}
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt=""
        width={20}
        height={20}
        className="w-5 h-5"
      />
      <span className="text-sm font-medium text-gray-700">{LABELS[variant]}</span>
    </a>
  );
}
