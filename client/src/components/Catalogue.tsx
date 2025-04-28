import React, { useEffect, useRef, useState, TouchEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosJWT from '../utils/axiosJWT';
import * as pdfjsLib from "pdfjs-dist";
import { jwtDecode } from 'jwt-decode';

import { DecodedToken } from '../types/token';

// Manually set the workerSrc from the actual .mjs path
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";


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

  // Touch handling for swipe
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50; // Minimum swipe distance to trigger page change

  let decoded = null;

  //logic to check the latest value of status for phone and handle accordingly
  const checkTokenStatus = async () => {
    const token = localStorage.getItem('clientAccessToken');
    console.log('Fetched token:', token);
    if (!token) return;

    try {
      decoded = jwtDecode<DecodedToken>(token);
      console.log('Decoded token:', decoded);
    } catch (err) {
      console.error('Failed to decode token', err);
      return;
    }
    
    try {
      const { phone, status: tokenStatus } = decoded;
      if (!phone) {
        console.error('Phone number missing in decoded token.');
        return;
      }

      const res = await axiosJWT.get(`/api/client/leads/status/${phone}`);
      const serverStatus = res.data?.status;
      console.log('Server approved status:', serverStatus);

      if (serverStatus !== tokenStatus) {
        console.log('Mismatch found, refreshing token...');
        const refreshRes = await axiosJWT.post(`/api/client/refresh-token/${phone}`);

        const newToken = refreshRes.data?.token;
        if (newToken) {
          console.log('New token received, setting it.');
          localStorage.setItem('clientAccessToken', newToken);
        }
      } else {
        console.log('Token and server status match, no refresh needed.');
      }

      // If the server status is not approved, navigate to the /status page
      if (serverStatus !== 'approved') {
        console.log('Status not approved, redirecting to /status...');
        navigate('/status', { state: { status: serverStatus } });
      }
    } catch (error) {
      console.error('Error syncing approval status:', error);
    }
  };

  // Register the worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

  console.log("PDF.js worker src:", pdfWorkerSrc); // Should be something like /assets/pdf.worker.mjs

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
  
  // Calculate scale to fit the page to the container
  const calculateScaleToFit = async (page: any) => {
    if (!containerRef.current) return 1.0;
    
    const viewport = page.getViewport({ scale: 1.0, rotation: rotation });
    const containerWidth = containerRef.current.clientWidth - 40; // 40px for padding
    const containerHeight = containerRef.current.clientHeight - 40;
    
    // Calculate scale to fit width and height
    const scaleX = containerWidth / viewport.width;
    const scaleY = containerHeight / viewport.height;
    
    // Use the smaller scale to ensure the entire page fits
    return Math.min(scaleX, scaleY) * 0.95; // 95% to add a small margin
  };
  
  // Render PDF page to canvas
  const renderPage = async () => {
    if (!pdfDocument || !canvasRef.current) return;
    
    try {
      const page = await pdfDocument.getPage(currentPage);
      
      // For desktop, automatically calculate the scale to fit the entire page
      let currentScale = scale;
      if (!isMobile) {
        const fitScale = await calculateScaleToFit(page);
        // Only update scale on initial load or page change
        if (Math.abs(scale - 1.0) < 0.1) { // If scale is close to default
          currentScale = fitScale;
          setScale(fitScale);
        }
      }
      
      // Handle rotation
      const viewport = page.getViewport({ 
        scale: currentScale,
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
      // Reset scale to default when changing pages (for desktop fit-to-page)
      if (!isMobile) {
        setScale(1.0); // This will trigger a recalculation to fit page
      }
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      // Reset scale to default when changing pages (for desktop fit-to-page)
      if (!isMobile) {
        setScale(1.0); // This will trigger a recalculation to fit page
      }
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
  
  // Reset zoom to fit entire page
  const resetZoom = async () => {
    if (!pdfDocument) return;
    setScale(1.0); // This will trigger recalculation to fit page
  };

  // Rotation function
  const rotatePages = () => {
    setRotation((prev) => (prev + 90) % 360);
    // Reset scale after rotation to ensure proper fit
    setScale(1.0);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isSignificantSwipe = Math.abs(distance) > minSwipeDistance;
    
    if (isSignificantSwipe) {
      if (distance > 0) {
        // Swiped left, go to next page
        goToNextPage();
      } else {
        // Swiped right, go to previous page
        goToPreviousPage();
      }
    }
    
    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
  };

  //refresh token
  useEffect(() => {
    checkTokenStatus();
  }, []);

  // Check device and set responsive state
  useEffect(() => {
    const checkDevice = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);
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
  
  // Re-render when container size changes (for responsive fit-to-page)
  useEffect(() => {
    const handleResize = () => {
      if (!isMobile && pdfDocument) {
        setScale(1.0); // This will trigger recalculation
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, pdfDocument]);

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
          <div className="absolute inset-0 z-30 bg-white flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-xl font-bold text-red-600 mb-2">Failed to load catalogue</h2>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={loadPdfDocument}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Security overlay */}
        <SecurityOverlay />
        
        {/* PDF controls - only show for desktop */}
        {!isMobile && (
          <>
            {/* Zoom controls at top */}
            <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-20 transition-opacity duration-300 ${isScrolling ? 'opacity-0' : 'opacity-100'}`}>
              <div className="bg-gray-800 bg-opacity-70 text-white p-2 rounded-lg flex items-center space-x-2">
                <button 
                  onClick={zoomOut} 
                  disabled={loading}
                  className={`px-3 py-1 rounded ${loading ? 'bg-gray-500 opacity-50' : 'bg-blue-600 hover:bg-blue-700'}`}
                  aria-label="Zoom out"
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
                  aria-label="Zoom in"
                >
                  +
                </button>
                <button 
                  onClick={resetZoom} 
                  disabled={loading}
                  className={`ml-2 px-3 py-1 rounded ${loading ? 'bg-gray-500 opacity-50' : 'bg-blue-600 hover:bg-blue-700'}`}
                  aria-label="Fit to page"
                >
                  ⤢
                </button>
                <button 
                  onClick={rotatePages} 
                  disabled={loading}
                  className={`ml-2 px-3 py-1 rounded ${loading ? 'bg-gray-500 opacity-50' : 'bg-blue-600 hover:bg-blue-700'}`}
                  aria-label="Rotate page"
                >
                  ↻
                </button>
              </div>
            </div>
            
            {/* Left edge navigation button */}
            <button 
              onClick={goToPreviousPage} 
              disabled={currentPage <= 1 || loading}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-20 transition-opacity duration-300 ${isScrolling ? 'opacity-0' : 'opacity-100'} ${currentPage <= 1 || loading ? 'bg-gray-500 bg-opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} h-12 w-12 flex items-center justify-center rounded-full text-white`}
              aria-label="Previous page"
            >
              ◀
            </button>
            
            {/* Right edge navigation button */}
            <button 
              onClick={goToNextPage} 
              disabled={currentPage >= numPages || loading}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-20 transition-opacity duration-300 ${isScrolling ? 'opacity-0' : 'opacity-100'} ${currentPage >= numPages || loading ? 'bg-gray-500 bg-opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} h-12 w-12 flex items-center justify-center rounded-full text-white`}
              aria-label="Next page"
            >
              ▶
            </button>
            
            {/* Page counter at bottom */}
            <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 transition-opacity duration-300 ${isScrolling ? 'opacity-0' : 'opacity-100'}`}>
              <div className="bg-gray-800 bg-opacity-70 text-white px-4 py-2 rounded-lg">
                <span className="text-sm">
                  {currentPage} / {numPages}
                </span>
              </div>
            </div>
          </>
        )}

        {/* PDF content area */}
        <div 
          ref={containerRef}
          className="w-full h-full overflow-auto p-4 bg-gray-100"
          onDragStart={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onTouchStart={isMobile ? handleTouchStart : undefined}
          onTouchMove={isMobile ? handleTouchMove : undefined}
          onTouchEnd={isMobile ? handleTouchEnd : undefined}
          style={{
            touchAction: isMobile ? 'pan-y' : 'auto', // Enable touch scrolling on mobile
          }}
        >
          <div className={`flex justify-center items-start ${!isMobile ? 'min-h-full' : ''}`}>
            <canvas 
              ref={canvasRef} 
              className="shadow-lg"
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </div>
          
          {/* Mobile page indicator */}
          {isMobile && (
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20 border-2 border-gray-800 bg-transparent text-gray-800 px-4 py-2 rounded-full cursor-pointer">
              <span className="text-sm">
                {currentPage} / {numPages}
              </span>
            </div>
          )}
        </div>
        
        {/* Instructions for mobile users */}
        {isMobile && (
          <div className="absolute top-0 left-0 right-0 z-20 text-center px-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mx-auto max-w-xs">
              <p className="text-xs text-blue-800">
                Swipe left or right to navigate pages
              </p>
            </div>
          </div>
        )}
        
        {/* Security notice */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-red-50 border-t border-red-200 p-2 text-center text-xs text-red-600 font-medium">
          This document is confidential. Copying, printing, and screenshots are prohibited.
        </div>
      </div>
    </div>
  );
};

export default Catalogue;