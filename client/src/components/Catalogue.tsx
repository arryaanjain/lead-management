import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosJWT from '../utils/axiosJWT';

const Catalogue: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadChecked, setLoadChecked] = useState(false);
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);

  const handleLoad = () => {
    setLoadChecked(true);
  };

  const fetchPdfBlob = async () => {
    try {
      const response = await axiosJWT.get("/api/catalogue/client/pdf/primary", {
        responseType: "blob",
      });
      const blobUrl = URL.createObjectURL(response.data);
      setPdfUrl(blobUrl);
      
    } catch (error: any) {
      console.error("Failed to fetch catalogue PDF:", error);

      // Redirect if unauthorized
      if (error.response && error.response.status === 401) {
        alert("Session expired or unauthorized. Redirecting...");
        navigate('/status'); // or navigate('/')
      }
    }
  };

  useEffect(() => {
    fetchPdfBlob();

    const disableKeys = (e: KeyboardEvent) => {
      const keyCombo = `${e.ctrlKey ? 'Ctrl+' : ''}${e.key.toLowerCase()}`;
    
      const blockedCombos = [
        'Ctrl+p',
        'Ctrl+s',
        'Ctrl+c',
        'Ctrl+x',
        'Ctrl+u',       // View Source
        'Ctrl+Shift+i', // DevTools
        'F12',
      ];
    
      if (blockedCombos.includes(keyCombo) || e.key === 'PrintScreen') {
        e.preventDefault();
        alert('This action is disabled.');
      }
    };
    

    const blockRightClick = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('keydown', disableKeys);
    document.addEventListener('contextmenu', blockRightClick);

    return () => {
      document.removeEventListener('keydown', disableKeys);
      document.removeEventListener('contextmenu', blockRightClick);
    };
  }, []);

  return (
    <div className="relative p-4 select-none">
      <h1 className="text-2xl font-semibold mb-4">Catalogue</h1>

      <div className="relative h-screen w-screen overflow-hidden select-none"
          onDragStart={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
        >
          
        {/* Watermark overlay */}
        <div className="absolute z-10 inset-0 pointer-events-none opacity-10 flex justify-center items-center text-[8rem] font-bold rotate-[-45deg] text-black">
          CONFIDENTIAL
        </div>

        <iframe
          ref={iframeRef}
          onLoad={handleLoad}
          src={pdfUrl}
          title="Catalogue"
          className="absolute z-0 top-0 left-0 w-full h-full border-none"
        />

        {!loadChecked && (
          <p className="absolute bottom-4 left-4 text-gray-500 z-20">
            Loading catalogue...
          </p>
        )}
      </div>

    </div>
  );
};

export default Catalogue;
