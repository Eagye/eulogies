"use client";

import EditProfileDialog from "@/components/profile/EditProfileDialog";

type ProfileAboutProps = {
  emailDisplay: string;
  dateOfBirthLabel: string | null;
  joinedLabel: string;
  isOwnProfile: boolean;
  editProfileProps?: {
    initialName: string;
    initialAvatarUrl: string | null;
    initialDateOfBirth: string | null;
  };
};

export default function ProfileAbout({
  emailDisplay,
  dateOfBirthLabel,
  joinedLabel,
  isOwnProfile,
  editProfileProps,
}: ProfileAboutProps) {
  return (
    <div className="space-y-4">
      {isOwnProfile && editProfileProps && (
        <EditProfileDialog
          {...editProfileProps}
          className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 sm:w-auto"
        />
      )}

      <dl className="space-y-4 rounded-xl border border-gray-200/80 bg-gray-50/50 p-4">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Email
          </dt>
          <dd className="mt-1 text-sm text-gray-900">{emailDisplay}</dd>
        </div>
        {dateOfBirthLabel && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Date of birth
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{dateOfBirthLabel}</dd>
          </div>
        )}
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Member since
          </dt>
          <dd className="mt-1 text-sm text-gray-900">{joinedLabel}</dd>
        </div>
      </dl>
    </div>
  );
}
