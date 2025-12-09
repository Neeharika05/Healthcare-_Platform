// frontend/src/api.js
export const API_URL = "http://localhost:5000/documents";

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  return fetch(`${API_URL}/upload`, { method: "POST", body: formData });
}

export async function listFiles() {
  return fetch(API_URL);
}

export async function downloadFile(id) {
  return fetch(`${API_URL}/${id}`);
}

export async function deleteFile(id) {
  return fetch(`${API_URL}/${id}`, { method: "DELETE" });
}
