import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Catalogue: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadChecked, setLoadChecked] = useState(false);
  const navigate = useNavigate();

  const handleLoad = () => {
    if (!iframeRef.current) return;

    try {
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;

      // If the document contains an error message or status code
      // if (
      //   iframeDoc?.body?.innerText.includes('Internal Server Error') //||
      //   // iframeDoc?.title.includes('Error') ||
      //   // iframeDoc?.body?.innerText.includes('Access Denied')
      // ) {
      //   navigate('/');
      // }

      setLoadChecked(true);
    } catch (err) {
      // Cross-origin issue or something blocked the iframe content
      console.error('Error loading iframe:', err);
      // navigate('/');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Catalogue</h1>
      <iframe
        ref={iframeRef}
        onLoad={handleLoad}
        src={`${import.meta.env.VITE_API_URL}/api/catalogue/pdf`}
        title="Catalogue"
        width="100%"
        height="800px"
        className="border rounded-lg shadow"
      />
      {!loadChecked && <p className="mt-2 text-gray-500">Loading catalogue...</p>}
    </div>
  );
};

export default Catalogue;
