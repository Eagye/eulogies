import type { ReactNode } from "react";

/**
 * Centers the feed and applies consistent horizontal padding / safe areas.
 */
export default function FeedColumn({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <div className="feed-column mx-auto w-full max-w-[600px] min-w-0">
      {title && (
        <header className="sticky top-[4.25rem] z-30 -mx-px mb-3 border-b border-gray-200/80 bg-[#F6F4F1]/95 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-[#F6F4F1]/80 sm:static sm:mx-0 sm:mb-4 sm:rounded-xl sm:border sm:border-gray-200/80 sm:bg-white sm:px-5 sm:py-3.5 sm:shadow-sm">
          <h1 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
            {title}
          </h1>
        </header>
      )}
      <div className="feed-list min-w-0">{children}</div>
    </div>
  );
}
