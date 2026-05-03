import { ThumbnailCard } from './ThumbnailCard';

export interface Thumbnail {
  id: string;
  url: string;
  status: 'loading' | 'ready' | 'failed' | 'pending';
}

interface ThumbnailGalleryProps {
  thumbnails: Thumbnail[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export function ThumbnailGallery({ thumbnails, selectedId, onSelect }: ThumbnailGalleryProps) {
  if (thumbnails.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-400">
        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>No thumbnails yet</p>
        <p className="text-sm mt-1">Upload a headshot to generate thumbnails</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {thumbnails.map((thumbnail) => (
        <ThumbnailCard
          key={thumbnail.id}
          url={thumbnail.url}
          status={thumbnail.status}
          isSelected={selectedId === thumbnail.id}
          onClick={() => onSelect?.(thumbnail.id)}
        />
      ))}
    </div>
  );
}