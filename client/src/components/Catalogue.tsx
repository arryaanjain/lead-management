import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosJWT from '../utils/axiosJWT';
import * as pdfjsLib from "pdfjs-dist";

// Manually set the workerSrc from the actual .mjs path
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";

// Register the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

console.log("PDF.js worker src:", pdfWorkerSrc); // Should be something like /assets/pdf.worker.mjs


const Catalogue: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // PDF rendering state
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Security and responsiveness
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  //setRotation(90); // Set initial rotation to 90 degrees

  // Load PDF document
  const loadPdfDocument = async () => {
    setLoading(true);
    try {
      const response = await axiosJWT.get("/api/catalogue/client/pdf/primary", {
        responseType: "blob",
      });
  
      const file = response.data;
      const arrayBuffer = await file.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
  
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      console.log("PDF loaded");
  
      setPdfDocument(pdf);
      setNumPages(pdf.numPages);
      setCurrentPage(1);
    } catch (error: any) {
      console.error("Failed to fetch or parse PDF:", error);
      setError("Invalid PDF structure.");
  
      if (error.response?.status === 401) {
        alert("Session expired or unauthorized. Redirecting...");
        navigate("/status");
      }
    } finally {
      setLoading(false);
    }
  };
  
  
  

  // Render PDF page to canvas
  const renderPage = async () => {
    if (!pdfDocument || !canvasRef.current) return;
    
    try {
      const page = await pdfDocument.getPage(currentPage);
      
      // Handle rotation
      const viewport = page.getViewport({ 
        scale: scale,
        rotation: rotation 
      });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;
      
      // Set canvas dimensions to match viewport
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      
      // Apply any custom rendering
      context.save();
      
      await page.render(renderContext).promise;
      
      // Add watermark after rendering the page
      addWatermark(context, canvas.width, canvas.height);
      
      context.restore();
      
    } catch (err) {
      console.error("Error rendering page:", err);
    }
  };

  // Add watermark to the canvas
  const addWatermark = (context: CanvasRenderingContext2D, width: number, height: number) => {
    context.save();
    
    // Set watermark properties
    context.globalAlpha = 0.1;
    context.font = `${Math.min(width, height) / 8}px Arial`;
    context.fillStyle = '#000000';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Rotate and position the watermark
    context.translate(width / 2, height / 2);
    context.rotate(-Math.PI / 4); // -45 degrees
    
    // Draw the watermark text
    context.fillText('CONFIDENTIAL', 0, 0);
    
    // Restore context
    context.restore();
  };

  // Navigation functions
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Zoom functions
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };

  // Rotation function
  const rotatePages = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Check device and set responsive state
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  // Load PDF on component mount
  useEffect(() => {
    loadPdfDocument();
  }, []);

  // Re-render when page, scale or rotation changes
  useEffect(() => {
    renderPage();
  }, [currentPage, scale, rotation, pdfDocument]);

  // Security measures
  useEffect(() => {
    // Prevent keyboard shortcuts
    const disableKeys = (e: KeyboardEvent) => {
      const keyCombo = `${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key.toLowerCase()}`;
      
      const blockedCombos = [
        'Ctrl+p',
        'Ctrl+s',
        'Ctrl+c',
        'Ctrl+x',
        'Ctrl+u',
        'Ctrl+Shift+i',
        'Ctrl+Shift+c',
        'Ctrl+Shift+j',
        'f12',
        'printscreen',
        'Ctrl+a',
        'Ctrl+v',
      ];
      
      if (blockedCombos.includes(keyCombo) || e.key === 'PrintScreen' || e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Block context menu
    const blockRightClick = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Block selection
    const blockSelection = () => {
      if (window.getSelection) {
        if (window.getSelection()?.empty) {
          window.getSelection()?.empty();
        } else if (window.getSelection()?.removeAllRanges) {
          window.getSelection()?.removeAllRanges();
        }
      }
    };

    // Block drag events
    const blockDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener('keydown', disableKeys, true);
    document.addEventListener('contextmenu', blockRightClick, true);
    document.addEventListener('selectstart', blockSelection, true);
    document.addEventListener('dragstart', blockDrag as any, true);
    document.addEventListener('beforeprint', (e) => e.preventDefault(), true);
    
    // CSS injection for extra protection
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      * {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      @media print {
        body {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(styleElement);

    // Clean up
    return () => {
      document.removeEventListener('keydown', disableKeys, true);
      document.removeEventListener('contextmenu', blockRightClick, true);
      document.removeEventListener('selectstart', blockSelection, true);
      document.removeEventListener('dragstart', blockDrag as any, true);
      document.removeEventListener('beforeprint', (e) => e.preventDefault(), true);
      document.head.removeChild(styleElement);
    };
  }, []);

  // Scroll handling with timeout for better UX
  const handleScroll = () => {
    if (!isScrolling) {
      setIsScrolling(true);
    }
    
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
      };
    }
  }, []);

  // Create security overlay component
  const SecurityOverlay = () => (
    <div className="absolute inset-0 pointer-events-none select-none z-20">
      {/* Invisible watermarks that only appear in screenshots */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute text-lg font-bold opacity-5"
          style={{ 
            top: `${Math.random() * 100}%`, 
            left: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 90 - 45}deg)`
          }}
        >
          CONFIDENTIAL
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative p-4 select-none">
      <h1 className="text-2xl font-semibold mb-4">Catalogue</h1>
      
      <div 
        className="relative bg-white rounded-lg shadow-lg overflow-hidden"
        style={{ height: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 80px)' }}
      >
        {/* Loading state */}
        {loading && (
          <div className="absolute inset-0 z-30 bg-white bg-opacity-80 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-700">Loading catalogue...</p>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="absolute inset-0 z-30 bg-white flex items-center justify-center">
            <div className="text-center p-6 bg-red-50 rounded-lg">
              <p className="text-red-600 font-semibold text-lg">{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  loadPdfDocument();
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {/* Security overlay */}
        <SecurityOverlay />
        
        {/* PDF controls - only show when not scrolling for better mobile UX */}
        <div className={`absolute top-2 left-0 right-0 z-20 transition-opacity duration-300 px-4 ${isScrolling ? 'opacity-0' : 'opacity-100'}`}>
          <div className="bg-gray-800 bg-opacity-70 text-white p-2 rounded-lg flex flex-wrap items-center justify-between gap-2">
            {/* Page controls */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={goToPreviousPage} 
                disabled={currentPage <= 1 || loading}
                className={`px-3 py-1 rounded ${currentPage <= 1 || loading ? 'bg-gray-500 opacity-50' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                ◀
              </button>
              <span className="text-sm">
                {currentPage} / {numPages}
              </span>
              <button 
                onClick={goToNextPage} 
                disabled={currentPage >= numPages || loading}
                className={`px-3 py-1 rounded ${currentPage >= numPages || loading ? 'bg-gray-500 opacity-50' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                ▶
              </button>
            </div>
            
            {/* Zoom controls */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={zoomOut} 
                disabled={loading}
                className={`px-3 py-1 rounded ${loading ? 'bg-gray-500 opacity-50' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                −
              </button>
              <span className="text-sm whitespace-nowrap">
                {Math.round(scale * 100)}%
              </span>
              <button 
                onClick={zoomIn} 
                disabled={loading}
                className={`px-3 py-1 rounded ${loading ? 'bg-gray-500 opacity-50' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                +
              </button>
            </div>
            
            {/* Rotation control */}
            {!isMobile && (
              <button 
                onClick={rotatePages} 
                disabled={loading}
                className={`px-3 py-1 rounded ${loading ? 'bg-gray-500 opacity-50' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                ↻
              </button>
            )}
          </div>
        </div>

        {/* PDF content area */}
        <div 
          ref={containerRef}
          className="w-full h-full overflow-auto p-4 bg-gray-100"
          onDragStart={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          style={{
            touchAction: 'pan-y', // Enable touch scrolling on mobile
          }}
        >
          <div className="flex justify-center items-start min-h-full">
            <canvas 
              ref={canvasRef} 
              className="shadow-lg"
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </div>
        </div>
        
        {/* Security notice */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-red-50 border-t border-red-200 p-2 text-center text-xs text-red-600 font-medium">
          This document is confidential. Copying, printing, and screenshots are prohibited.
        </div>
      </div>
    </div>
  );
};

export default Catalogue;