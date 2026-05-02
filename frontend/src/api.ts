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

