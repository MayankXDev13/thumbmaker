import { useState, useRef } from 'react';

export interface UploadFormData {
  headshotUrl: string;
  prompt: string;
  numThumbnails: number;
}

interface UploadFormProps {
  onSubmit: (data: UploadFormData) => Promise<void>;
  isLoading?: boolean;
}

export function UploadForm({ onSubmit, isLoading }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [numThumbnails, setNumThumbnails] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a headshot image');
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setError(null);
    
    await onSubmit({
      headshotUrl: preview!,
      prompt: prompt.trim(),
      numThumbnails,
    });
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setPrompt('');
    setNumThumbnails(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Headshot Upload */}
      <div>
        <label className="block text-sm font-medium text-neutral-200 mb-2">
          Upload Headshot
        </label>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-lg p-6 cursor-pointer
            transition-colors duration-200
            ${preview ? 'border-rose-500/50' : 'border-neutral-600 hover:border-rose-500'}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {preview ? (
            <div className="relative w-32 h-32 mx-auto">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white text-sm hover:bg-rose-600"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="text-center">
              <svg className="w-10 h-10 mx-auto text-neutral-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-neutral-400 text-sm">
                Drop an image here or click to browse
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prompt */}
      <div>
        <label className="block text-sm font-medium text-neutral-200 mb-2">
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the thumbnail style you want..."
          rows={3}
          className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
        />
      </div>

      {/* Number of Thumbnails */}
      <div>
        <label className="block text-sm font-medium text-neutral-200 mb-2">
          Number of Thumbnails (1-3)
        </label>
        <input
          type="number"
          min={1}
          max={3}
          value={numThumbnails}
          onChange={(e) => setNumThumbnails(Math.min(3, Math.max(1, parseInt(e.target.value) || 1)))}
          className="w-24 px-4 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-neutral-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-rose-500 text-sm">{error}</p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !file || !prompt.trim()}
        className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          'Generate Thumbnails'
        )}
      </button>
    </form>
  );
}