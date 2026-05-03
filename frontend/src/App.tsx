import { useState } from "react";
import { ThumbnailGallery } from "./components/ThumbnailGallery";
import type { Thumbnail } from "./components/ThumbnailGallery";
import { UploadForm } from "./components/UploadForm";
import type { UploadFormData } from "./components/UploadForm";
import { uploadHeadshot, createJob, subscribeToJob } from "./api";
import "./App.css";

function App() {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (data: UploadFormData) => {
    setIsLoading(true);
    setThumbnails([]);
    setSelectedId(undefined);

    try {
      const blob = await fetch(data.headshotUrl).then((r) => r.blob());
      const file = new File([blob], "headshot.jpg", { type: blob.type });
      const uploadedUrl = await uploadHeadshot(file);

      const job = await createJob({
        prompt: data.prompt,
        numThumbnails: data.numThumbnails,
        headshotUrl: uploadedUrl,
      });

      const initialThumbnails: Thumbnail[] = Array.from(
        { length: data.numThumbnails },
        (_, i) => ({
          id: `thumbnail-${i}`,
          url: "",
          status: "loading" as const,
        }),
      );
      setThumbnails(initialThumbnails);

      subscribeToJob(job.job_id, {
        onThumbnailReady: (data: { index: number; url: string }) => {
          setThumbnails((prev) =>
            prev.map((t, i) =>
              i === data.index
                ? { ...t, url: data.url, status: "ready" as const }
                : t,
            ),
          );
        },
        onThumbnailFailed: (data: { index: number; error: string }) => {
          setThumbnails((prev) =>
            prev.map((t, i) =>
              i === data.index ? { ...t, status: "failed" as const } : t,
            ),
          );
        },
        onJobComplete: () => {
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
          setThumbnails((prev) =>
            prev.map((t) => ({ ...t, status: "failed" as const })),
          );
        },
      });
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <header className="border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-white">ThumbMaker</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Generate YouTube thumbnails with AI
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <h2 className="text-lg font-semibold text-white mb-4">
              Create New
            </h2>
            <UploadForm onSubmit={handleGenerate} isLoading={isLoading} />
          </div>

          {/* Thumbnail Gallery */}
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <h2 className="text-lg font-semibold text-white mb-4">
              Thumbnails
              {thumbnails.length > 0 && (
                <span className="ml-2 text-sm font-normal text-neutral-400">
                  ({thumbnails.filter((t) => t.status === "ready").length}/
                  {thumbnails.length})
                </span>
              )}
            </h2>
            <ThumbnailGallery
              thumbnails={thumbnails}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </div>

        {/* Selected Thumbnail */}
        {selectedId && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-4">
              Selected Thumbnail
            </h2>
            {(() => {
              const selected = thumbnails.find((t) => t.id === selectedId);
              if (selected?.url) {
                return (
                  <img
                    src={selected.url}
                    alt="Selected"
                    className="max-w-md w-full rounded-lg border-2 border-rose-500"
                  />
                );
              }
              return null;
            })()}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
