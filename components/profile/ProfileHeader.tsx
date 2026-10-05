import Link from "next/link";
import { Calendar } from "lucide-react";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileTopBar from "@/components/profile/ProfileTopBar";
import { displayHandle } from "@/lib/profile/displayHandle";
import { formatDateOfBirth } from "@/lib/profile/dateOfBirth";

type ProfileHeaderProps = {
  name: string;
  email: string;
  avatarUrl: string | null;
  dateOfBirth: Date | null;
  joinedAt: Date;
  isOwnProfile: boolean;
  postCount: number;
  brochureCount: number;
};

export default function ProfileHeader({
  name,
  email,
  avatarUrl,
  dateOfBirth,
  joinedAt,
  isOwnProfile,
  postCount,
  brochureCount,
}: ProfileHeaderProps) {
  const handle = displayHandle(email);
  const joinedLabel = joinedAt.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="border-b border-gray-200/80 bg-white">
      <ProfileTopBar name={name} isOwnProfile={isOwnProfile} />

      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex gap-4">
          <ProfileAvatar name={name} avatarUrl={avatarUrl} size="lg" />
          <div className="min-w-0 flex-1 pt-1">
            <h2 className="text-xl font-bold leading-tight text-gray-900">{name}</h2>
            <p className="mt-0.5 text-sm text-gray-500">{handle}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-gray-500">
              <Calendar className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              Joined {joinedLabel}
            </p>
            {dateOfBirth && (
              <p className="mt-1 text-sm text-gray-500">
                Born {formatDateOfBirth(dateOfBirth)}
              </p>
            )}
          </div>
        </div>

        {isOwnProfile ? (
          <EditProfileDialog
            initialName={name}
            initialAvatarUrl={avatarUrl}
            initialDateOfBirth={dateOfBirth?.toISOString() ?? null}
          />
        ) : (
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 sm:w-auto"
          >
            Back to feed
          </Link>
        )}

        <div className="flex gap-6 text-sm">
          <p>
            <span className="font-bold text-gray-900">{postCount}</span>{" "}
            <span className="text-gray-500">{postCount === 1 ? "Post" : "Posts"}</span>
          </p>
          {brochureCount > 0 && (
            <p>
              <span className="font-bold text-gray-900">{brochureCount}</span>{" "}
              <span className="text-gray-500">
                {brochureCount === 1 ? "Brochure" : "Brochures"}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
