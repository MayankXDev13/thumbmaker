import axios from "axios";

const API_BASE = "/api";

export async function uploadHeadshot(file: File) {
  const form = new FormData();
  form.append("file", file);

  try {
    const res = await axios.post(`${API_BASE}/upload-headshot`, form);

    if (!res.data) {
      throw new Error("Empty response from server");
    }

    return res.data;
  } catch (err: any) {
    if (err.response) {
      throw new Error(err.response.data?.message || "Upload failed");
    }
    throw new Error("Network or server error");
  }
}

export async function createJob({ prompt, numThumbnails, headshotUrl }) {
  try {
    const res = await axios.post(`${API_BASE}/job`, {
      prompt,
      num_thumbnails: numThumbnails,
      headshot_url: headshotUrl,
    });

    return res.data;
  } catch (err: any) {
    if (err.response) {
      throw new Error(err.response.data?.message || "Job creation failed");
    }
    throw new Error("Network or server error");
  }
}

export async function subscribeToJob(
  jobId,
  { onThumbnailReady, onThumbnailFailed, onJobComplete, onError },
) {
  const es = new EventSource(`${API_BASE}/jobs/${jobId}/stream`);

  es.addEventListener("thumbnail_ready", (event) => {
    onThumbnailReady(JSON.parse(event.data));
  });

  es.addEventListener("thumbnail_failed", (event) => {
    onThumbnailFailed(JSON.parse(event.data));
  });

  es.addEventListener("job_completed", (event) => {
    onJobComplete(JSON.parse(event.data));
    es.close();
  });

  es.addEventListener("error", (event) => {
    onError(event);
    es.close();
  });

  return es;
}
