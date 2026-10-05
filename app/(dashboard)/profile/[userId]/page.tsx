import { notFound } from "next/navigation";
import FeedColumn from "@/components/feed/FeedColumn";
import ProfileAbout from "@/components/profile/ProfileAbout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePostList, {
  type ProfilePostRow,
} from "@/components/profile/ProfilePostList";
import ProfileShell from "@/components/profile/ProfileShell";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { getSession } from "@/lib/auth/session";
import { maskEmail } from "@/lib/maskEmail";
import { formatDateOfBirth } from "@/lib/profile/dateOfBirth";
import { prisma } from "@/lib/db/prisma";
import {
  getViewerUserId,
  postAuthorSelect,
  serializePostsWithEngagement,
} from "@/lib/posts/engagement";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const session = await getSession();
  const viewer = session
    ? await prisma.user.findUnique({
        where: { email: session.email.toLowerCase() },
        select: { id: true, email: true },
      })
    : null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      dateOfBirth: true,
      createdAt: true,
    },
  });

  if (!user) {
    notFound();
  }

  const isOwnProfile = viewer?.id === user.id;

  const [postsRaw, postCount, brochureCount] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: postAuthorSelect },
      },
    }),
    prisma.post.count({ where: { authorId: user.id } }),
    prisma.brochure.count({ where: { creatorId: user.id } }),
  ]);

  const viewerUserId = viewer ? await getViewerUserId(viewer.email) : null;
  const serialized = await serializePostsWithEngagement(postsRaw, viewerUserId);

  const posts: ProfilePostRow[] = serialized.map((post) => ({
    id: post.id,
    type: post.type,
    content: post.content,
    attachments: post.attachments,
    createdAt: post.createdAt,
    authorName: user.name,
    authorEmail: user.email,
    authorAvatarUrl: post.author.avatarUrl,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    likedByViewer: post.likedByViewer,
  }));

  const emailDisplay = isOwnProfile ? user.email : maskEmail(user.email);
  const joinedLabel = user.createdAt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <FeedColumn>
      <ProfileShell>
        <ProfileHeader
          name={user.name}
          email={user.email}
          avatarUrl={user.avatarUrl}
          dateOfBirth={user.dateOfBirth}
          joinedAt={user.createdAt}
          isOwnProfile={isOwnProfile}
          postCount={postCount}
          brochureCount={brochureCount}
        />

        <ProfileTabs
          posts={
            <ProfilePostList
              posts={posts}
              viewerEmail={viewer?.email ?? ""}
              profileUserId={user.id}
              isOwnProfile={isOwnProfile}
            />
          }
          about={
            <ProfileAbout
              emailDisplay={emailDisplay}
              dateOfBirthLabel={
                user.dateOfBirth ? formatDateOfBirth(user.dateOfBirth) : null
              }
              joinedLabel={joinedLabel}
              isOwnProfile={isOwnProfile}
              editProfileProps={
                isOwnProfile
                  ? {
                      initialName: user.name,
                      initialAvatarUrl: user.avatarUrl,
                      initialDateOfBirth:
                        user.dateOfBirth?.toISOString() ?? null,
                    }
                  : undefined
              }
            />
          }
        />
      </ProfileShell>
    </FeedColumn>
  );
}
