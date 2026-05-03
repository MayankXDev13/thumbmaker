interface ThumbnailCardProps {
  url: string;
  status: "loading" | "ready" | "failed" | "pending";
  isSelected?: boolean;
  onClick?: () => void;
}

export function ThumbnailCard({
  url,
  status,
  isSelected,
  onClick,
}: ThumbnailCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative aspect-video rounded-lg overflow-hidden cursor-pointer
        border-2 transition-all duration-200
        ${isSelected ? "border-rose-500 ring-2 ring-rose-500/30" : "border-transparent hover:border-rose-400"}
        ${status === "failed" ? "bg-neutral-900" : "bg-neutral-800"}
      `}
    >
      {status === "loading" || status === "pending" ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : status === "failed" ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <svg
              className="w-8 h-8 mx-auto text-rose-500 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-neutral-400 text-sm">Generation failed</span>
          </div>
        </div>
      ) : (
        <img src={url} alt="Thumbnail" className="w-full h-full object-cover" />
      )}

      {status === "ready" && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-rose-500 rounded-full" />
        </div>
      )}
    </div>
  );
}
