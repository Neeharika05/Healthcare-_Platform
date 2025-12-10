import { useEffect, useState, useRef } from "react";
import { uploadFile, listFiles, deleteFile } from "./api";
import { toast, ToastContainer } from "react-toastify";
import { FiDownload, FiTrash2, FiEye } from "react-icons/fi";

function App() {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [renamePrompt, setRenamePrompt] = useState({ show: false, file: null, newName: "" });

  const fetchFiles = async () => {
    try {
      const res = await listFiles();
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      const msg = "Failed to load documents";
      setMessage(msg);
      toast.error(msg);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e, fileOverride = null, renamedName = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const file = fileOverride || selectedFile;
    if (!file) {
      const msg = "Please select a PDF file.";
      setMessage(msg);
      toast.error(msg);
      return;
    }

    // Check for duplicate file name
    const duplicate = files.some(f => f.originalName === (renamedName || file.name));
    if (duplicate && !renamedName) {
      setRenamePrompt({ show: true, file, newName: file.name.replace(/(\.pdf)$/i, "_copy$1") });
      return;
    }

    let uploadFileObj = file;
    // If renaming, create a new File object with the new name
    if (renamedName) {
      uploadFileObj = new File([file], renamedName, { type: file.type });
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await uploadFile(uploadFileObj);
      const data = await res.json();

      if (!res.ok) {
        const msg = (data.error || "Failed to upload file") + `: ${uploadFileObj.name}`;
        setMessage(msg);
        toast.error(msg);
      } else {
        const msg = (data.message || "File uploaded") + `: ${uploadFileObj.name}`;
        setMessage(msg);
        toast.success(msg);
        fetchFiles();
        setSelectedFile(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      const msg = `Upload failed: ${uploadFileObj.name}`;
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "application/pdf") {
        const msg = "Only PDF files are allowed.";
        setMessage(msg);
        toast.error(msg);
        return;
      }
      setSelectedFile(file);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setMessage("");

    // Find file name for toast
    const fileObj = files.find(f => f._id === id);
    const fileName = fileObj ? fileObj.originalName : "(unknown file)";

    try {
      const res = await deleteFile(id);
      const data = await res.json();

      if (!res.ok) {
        const msg = (data.error || "Failed to delete") + `: ${fileName}`;
        setMessage(msg);
        toast.error(msg);
      } else {
        const msg = (data.message || "Document deleted") + `: ${fileName}`;
        setMessage(msg);
        toast.success(msg);
        fetchFiles();
      }
    } catch (err) {
      console.error(err);
      const msg = `Delete failed: ${fileName}`;
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-2 bg-linear-to-br from-blue-100 via-teal-100 to-indigo-200">
      <div className="w-full max-w-3xl bg-white/90 shadow-2xl rounded-3xl p-6 md:p-10 space-y-8 border border-teal-200">
        <header className="border-b pb-6 mb-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-linear-to-tr from-teal-400 via-blue-400 to-indigo-400 flex items-center justify-center mb-2 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-teal-700 tracking-tight text-center">
            Healthcare Patient Portal
          </h1>
          <p className="text-base text-slate-600 mt-2 text-center">
            Securely upload, view, download, and delete your medical documents (PDFs).
          </p>
        </header>

        {/* Upload form */}
        <form
          onSubmit={handleUpload}
          className="relative"
          style={{}}
        >
          <div
            className={`flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed transition-all duration-200 ${dragActive ? 'border-teal-500 bg-teal-50 shadow-lg' : 'border-teal-200 bg-linear-to-r from-teal-50 via-blue-50 to-indigo-50'}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            style={{ cursor: 'pointer', position: 'relative' }}
            onClick={onButtonClick}
          >
                    {/* Rename prompt modal */}
                    {renamePrompt.show && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs flex flex-col items-center">
                          <h3 className="text-lg font-bold text-teal-700 mb-2 text-center">File name already exists</h3>
                          <p className="text-slate-700 text-center mb-4">A file named <span className="font-semibold">{renamePrompt.file.name}</span> already exists.<br/>You can rename and upload, or cancel.</p>
                          <input
                            className="border border-teal-300 rounded px-3 py-2 w-full mb-3 text-slate-800"
                            value={renamePrompt.newName}
                            onChange={e => setRenamePrompt(r => ({ ...r, newName: e.target.value }))}
                            autoFocus
                          />
                          <div className="flex gap-2 w-full">
                            <button
                              className="flex-1 px-4 py-2 rounded bg-teal-500 text-white font-bold hover:bg-teal-600"
                              onClick={() => {
                                setRenamePrompt(r => ({ ...r, show: false }));
                                handleUpload(null, renamePrompt.file, renamePrompt.newName);
                              }}
                              disabled={!renamePrompt.newName.trim() || files.some(f => f.originalName === renamePrompt.newName)}
                            >
                              Upload as "{renamePrompt.newName}"
                            </button>
                            <button
                              className="flex-1 px-4 py-2 rounded bg-rose-200 text-rose-800 font-bold hover:bg-rose-300"
                              onClick={() => setRenamePrompt({ show: false, file: null, newName: "" })}
                            >
                              Cancel
                            </button>
                          </div>
                          {files.some(f => f.originalName === renamePrompt.newName) && (
                            <div className="text-xs text-rose-600 mt-2">A file with this name already exists.</div>
                          )}
                        </div>
                      </div>
                    )}
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 48 48" className="w-14 h-14 text-teal-400 mb-2">
                <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M24 34V14m0 0l-7 7m7-7l7 7" />
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M38 32v2a4 4 0 01-4 4H14a4 4 0 01-4-4v-2" />
              </svg>
              <span className="text-base md:text-lg text-slate-700 font-semibold mb-1">Drag & drop your PDF here</span>
              <span className="text-xs text-slate-500 mb-2">or</span>
              <button
                type="button"
                onClick={onButtonClick}
                className="px-4 py-2 rounded-full bg-linear-to-r from-teal-400 via-blue-400 to-indigo-400 text-white font-bold shadow hover:from-teal-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-teal-300"
                tabIndex={-1}
                style={{ pointerEvents: 'auto' }}
                disabled={loading}
              >
                Choose File
              </button>
              <input
                ref={inputRef}
                type="file"
                name="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    if (file.type !== "application/pdf") {
                      const msg = "Only PDF files are allowed.";
                      setMessage(msg);
                      toast.error(msg);
                      setSelectedFile(null);
                      return;
                    }
                    setSelectedFile(file);
                  }
                }}
                tabIndex={-1}
                disabled={loading}
              />
              {selectedFile && (
                <div className="mt-2 text-sm text-teal-700 font-medium">Selected: {selectedFile.name}</div>
              )}
            </div>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-2xl">
                <svg className="animate-spin h-8 w-8 text-teal-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="ml-3 text-teal-700 font-semibold">Processing...</span>
              </div>
            )}
          </div>
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={handleUpload}
              disabled={loading || !selectedFile}
              className="inline-flex px-6 py-2 rounded-full text-base font-bold text-white bg-linear-to-r from-teal-500 via-blue-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2 whitespace-nowrap">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Upload PDF
                  </>
                )}
              </span>
            </button>
          </div>
        </form>

        {/* Message */}
        {message && (
          <div className="rounded-lg border border-teal-200 bg-linear-to-r from-teal-50 via-blue-50 to-indigo-50 px-4 py-2 text-base text-teal-800 shadow">
            {message}
          </div>
        )}

        {/* Documents list */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-teal-700 text-center">
            Your Documents
          </h2>

          {files.length === 0 ? (
            <p className="text-base text-slate-500 text-center">
              No documents yet. Upload a PDF to get started.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-teal-200 bg-white/80 shadow h-60 overflow-y-auto">
              <table className="min-w-full text-base">
                <thead className="bg-linear-to-r from-teal-100 via-blue-100 to-indigo-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-teal-700">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-teal-700">Size</th>
                    <th className="px-4 py-3 text-right font-semibold text-teal-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-100">
                  {files.map((doc) => (
                    <tr key={doc._id} className="hover:bg-linear-to-r hover:from-teal-50 hover:to-indigo-50 transition-all even:bg-gray-100 ">
                      <td className="px-4 py-3 text-slate-800 font-medium">{doc.originalName}</td>
                      <td className="px-4 py-3 text-slate-600">{(doc.size / 1024).toFixed(1)} KB</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <a
                            href={`http://localhost:5000/documents/${doc._id}/view`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full border border-green-200 text-green-700 hover:bg-green-50"
                            title="View PDF"
                          >
                            <FiEye size={16} />
                          </a>
                          <a
                            href={`http://localhost:5000/documents/${doc._id}`}
                            className="p-2 rounded-full border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            title="Download PDF"
                            download={doc.originalName}
                            onClick={() => {
                              toast.success(`Download started: ${doc.originalName}`);
                            }}
                          >
                            <FiDownload size={16} />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDelete(doc._id)}
                            className="p-2 rounded-full border border-rose-200 text-rose-700 hover:bg-rose-50"
                            title="Delete PDF"
                          >
                            <FiTrash2 size={16} />
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
      <ToastContainer />
    </div>
  );
}

export default App;