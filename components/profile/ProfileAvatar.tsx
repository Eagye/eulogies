import { profileInitials } from "@/lib/profileInitials";

type ProfileAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClass = {
  sm: "h-11 w-11 text-sm rounded-full",
  md: "h-20 w-20 text-2xl rounded-2xl",
  lg: "h-20 w-20 text-xl rounded-full sm:h-24 sm:w-24 sm:text-2xl",
  xl: "h-[7.25rem] w-[7.25rem] text-2xl rounded-full sm:h-[8.5rem] sm:w-[8.5rem] sm:text-3xl",
} as const;

export default function ProfileAvatar({
  name,
  avatarUrl,
  size = "md",
  className = "",
}: ProfileAvatarProps) {
  const base = `${sizeClass[size]} shrink-0 overflow-hidden ${className}`;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${base} object-cover bg-gray-100 ring-1 ring-black/5`}
      />
    );
  }

  return (
    <div
      className={`${base} flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-600 font-semibold text-white shadow-inner`}
      aria-hidden
    >
      {profileInitials(name)}
    </div>
  );
}
