// frontend/src/App.jsx
import { useEffect, useState } from "react";
import { uploadFile, listFiles, deleteFile } from "./api";

function App() {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    try {
      const res = await listFiles();
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load documents");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.file.files[0];
    if (!file) {
      setMessage("Please select a PDF file.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await uploadFile(file);
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to upload file");
      } else {
        setMessage(data.message || "File uploaded");
        fetchFiles();
        e.target.reset();
      }
    } catch (err) {
      console.error(err);
      setMessage("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setMessage("");

    try {
      const res = await deleteFile(id);
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to delete");
      } else {
        setMessage(data.message || "Document deleted");
        fetchFiles();
      }
    } catch (err) {
      console.error(err);
      setMessage("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-6 md:p-8 space-y-6">
        <header className="border-b pb-4 mb-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Patient Portal: Document Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload, view, download, and delete your medical PDFs.
          </p>
        </header>

        {/* Upload form */}
        <form
          onSubmit={handleUpload}
          className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4"
        >
          <input
            type="file"
            name="file"
            accept="application/pdf"
            className="block w-full text-sm text-slate-700
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-indigo-50 file:text-indigo-700
                       hover:file:bg-indigo-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 rounded-full
                       text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Processing..." : "Upload PDF"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-800">
            {message}
          </div>
        )}

        {/* Documents list */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Your Documents
          </h2>

          {files.length === 0 ? (
            <p className="text-sm text-slate-500">
              No documents yet. Upload a PDF to get started.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">
                      Size
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {files.map((doc) => (
                    <tr key={doc._id}>
                      <td className="px-4 py-2 text-slate-800">
                        {doc.originalName}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {(doc.size / 1024).toFixed(1)} KB
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-2">
                          <a
                            href={`http://localhost:5000/documents/${doc._id}`}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs
                                       font-medium border border-indigo-200 text-indigo-700
                                       hover:bg-indigo-50"
                          >
                            Download
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDelete(doc._id)}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs
                                       font-medium border border-rose-200 text-rose-700
                                       hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
