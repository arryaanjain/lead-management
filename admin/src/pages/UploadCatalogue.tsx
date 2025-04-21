import React, { useState, useEffect } from 'react';
import axiosJWT from '../utils/axiosInstance';
import { motion } from 'framer-motion';

const UploadCatalogue: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [catalogueFiles, setCatalogueFiles] = useState<any[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const fetchCatalogueFiles = async () => {
    try {
      const res = await axiosJWT.get(`${import.meta.env.VITE_API_URL}/api/catalogue/files`);
      setCatalogueFiles(res.data.files);
    } catch (err) {
      console.error('Error fetching catalogue files:', err);
    }
  };

  const fetchPDF = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/api/catalogue/pdf/${primaryFile.id}`,
        {
          responseType: "blob", // Important to get it as a blob
        }
      );
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Failed to load PDF:", error);
    }
  };
  
  const primaryFile = catalogueFiles.find(file => file.isPrimary);

  useEffect(() => {
    fetchCatalogueFiles();
    if (primaryFile?.id) {
      fetchPDF();
    }
  }, [primaryFile?.id]);

  const handleSetPrimary = async (fileId: string) => {
    try {
      console.log("Setting primary file with fileId:", fileId);
      await axiosJWT.post(`${import.meta.env.VITE_API_URL}/api/catalogue/setPrimary`, { fileId });
      fetchCatalogueFiles(); // Refresh the list after setting the primary file
      setSuccess('Primary file updated successfully!');
    } catch (err) {
      console.error('Error setting primary file:', err);
      setError('Failed to set primary file');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await axiosJWT.post(`${import.meta.env.VITE_API_URL}/api/catalogue/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(response.data.message);
      setFile(null);
      fetchCatalogueFiles(); // Refresh list after upload
    } catch (err) {
      console.error('Error uploading catalogue:', err);
      setError('Failed to upload catalogue. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Upload Catalogue</h2>
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      {success && <p className="text-green-600 text-center mb-4">{success}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="catalogueFile" className="block text-sm font-medium text-gray-700 mb-2">Choose PDF</label>
          <input
            type="file"
            id="catalogueFile"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 bg-gray-50 border border-gray-300 rounded-lg p-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Uploading...' : 'Upload Catalogue'}
        </button>
      </form>

      <div className="mt-6">
        <h3 className="text-xl font-semibold text-center mb-4">Uploaded Catalogues</h3>

        {primaryFile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 mb-8 border-2 border-green-600 bg-green-50 rounded-xl shadow-xl"
          >
            <h3 className="text-xl font-bold text-green-700 mb-2">🌟 Primary Catalogue</h3>
            <p className="text-lg font-semibold">{primaryFile.filename}</p>
            <p className="text-sm text-gray-600 mb-4">
              Uploaded: {new Date(primaryFile.uploadDate).toLocaleDateString()}
            </p>

            <div className="aspect-w-16 aspect-h-9 mb-4">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-96 rounded-lg border border-gray-300"
                  title="Primary Catalogue Preview"
                />
              ) : (
                <p>Loading preview...</p>
              )}
            </div>
            <a
              href={pdfUrl ?? "#"}
              download={primaryFile.filename}
              className={`inline-block mt-2 px-4 py-2 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 ${
                !pdfUrl ? "pointer-events-none opacity-50" : ""
              }`}
            >
              🔽 Download PDF
            </a>
          </motion.div>
        )}


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {catalogueFiles
            .filter(file => !file.isPrimary)
            .map((file) => (
              <div
                key={file.id}
                className="p-4 bg-gray-100 border border-gray-300 rounded-lg shadow-md"
              >
                <h4 className="font-semibold">{file.filename}</h4>
                <p>Uploaded: {new Date(file.uploadDate).toLocaleDateString()}</p>
                <button
                  className="mt-2 w-full py-2 bg-indigo-600 text-white rounded-lg"
                  onClick={() => handleSetPrimary(file.id)}
                >
                  Set as Primary
                </button>
              </div>
            ))}
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {catalogueFiles.map((file) => {
            const isPrimary = file.isPrimary;

            return (
              <div
                key={file.id}
                className={`p-4 border rounded-lg shadow-md ${
                  isPrimary ? 'bg-green-50 border-green-600' : 'bg-gray-100 border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">{file.filename}</h4>
                  {isPrimary && (
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                      Primary Catalogue
                    </span>
                  )}
                </div>
                <p>Uploaded: {new Date(file.uploadDate).toLocaleDateString()}</p>

                {!isPrimary && (
                  <button
                    className="mt-2 w-full py-2 bg-indigo-600 text-white rounded-lg"
                    onClick={() => handleSetPrimary(file.id)}
                  >
                    Set as Primary
                  </button>
                )}
              </div>
            );
          })}
        </div> */}


      </div>
    </div>
  );
};

export default UploadCatalogue;
