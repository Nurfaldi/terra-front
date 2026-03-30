import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  FileText,
  RotateCw,
  RotateCcw,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  pdfUrl?: string;
  fileName?: string;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageCountChange?: (count: number) => void;
}

export function PDFViewer({
  pdfUrl,
  fileName,
  currentPage,
  onPageChange,
  onPageCountChange,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [fitToWidth, setFitToWidth] = useState<boolean>(true);
  const [rotation, setRotation] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (pdfUrl) {
      const initialPage = currentPage && currentPage > 0 ? currentPage : 1;
      setPageNumber(initialPage);
    }
  }, [pdfUrl]);

  useEffect(() => {
    if (!currentPage || currentPage < 1) return;
    setPageNumber((prev) => (prev === currentPage ? prev : currentPage));
  }, [currentPage]);

  const setPageAndNotify = (nextPage: number) => {
    const clamped = numPages > 0
      ? Math.max(1, Math.min(nextPage, numPages))
      : Math.max(1, nextPage);
    setPageNumber(clamped);
    onPageChange?.(clamped);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    onPageCountChange?.(numPages);

    const requestedPage = currentPage && currentPage > 0 ? currentPage : pageNumber;
    const clampedPage = Math.max(1, Math.min(requestedPage, numPages));
    setPageNumber(clampedPage);

    if (currentPage && currentPage !== clampedPage) {
      onPageChange?.(clampedPage);
    }
  };

  const goToPrevPage = () => setPageAndNotify(pageNumber - 1);
  const goToNextPage = () => setPageAndNotify(pageNumber + 1);

  const zoomIn = () => {
    setFitToWidth(false);
    setScale((prev) => Math.min(prev + 0.1, 3.0));
  };

  const zoomOut = () => {
    setFitToWidth(false);
    setScale((prev) => Math.max(prev - 0.1, 0.3));
  };

  const toggleFitWidth = () => {
    setFitToWidth(!fitToWidth);
    if (!fitToWidth) {
      setScale(1);
    }
  };

  const rotateClockwise = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const rotateCounterClockwise = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  return (
    <div className="flex flex-col h-full bg-muted/30 rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-card">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">PDF Preview</span>
        </div>

        <div className="flex items-center gap-2">
          {pdfUrl && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={pdfUrl}
                download={fileName || "document.pdf"}
                className="flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* PDF Content */}
      <div
        className="flex-1 overflow-auto p-4 flex items-start justify-center bg-gray-100/50"
        ref={containerRef}
      >
        {pdfUrl ? (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-muted-foreground">
                  Loading PDF...
                </div>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center h-64 text-destructive">
                <FileText className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">Cannot preview this file</p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <a href={pdfUrl} download="document.pdf">
                    Download File
                  </a>
                </Button>
              </div>
            }
            className="max-w-full"
          >
            {numPages > 0 && (
              <Page
                pageNumber={pageNumber}
                scale={fitToWidth ? undefined : scale}
                width={fitToWidth ? Math.max(containerWidth - 40, 300) : undefined}
                rotate={rotation}
                className="shadow-lg mb-4"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            )}
          </Document>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <FileText className="h-16 w-16 mb-4 opacity-20" />
            <p>No PDF available</p>
          </div>
        )}
      </div>

      {/* Controls */}
      {pdfUrl && numPages > 0 && (
        <div className="flex items-center justify-between p-2 lg:p-3 border-t bg-card gap-2 flex-wrap">
          {/* Page Navigation */}
          <div className="flex items-center gap-1 lg:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[60px] text-center font-mono">
              {pageNumber} / {numPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 lg:gap-2 bg-muted/50 rounded-md p-1">
            <Button
              variant={fitToWidth ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={toggleFitWidth}
            >
              Fit Width
            </Button>

            <div className="h-4 w-px bg-border mx-1" />

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={zoomOut}
              disabled={fitToWidth && scale <= 0.3}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[40px] text-center font-mono">
              {fitToWidth ? "Au" : `${Math.round(scale * 100)}%`}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={zoomIn}
              disabled={fitToWidth && scale >= 3.0}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Rotation Control */}
          <div className="flex items-center gap-1 lg:gap-2 bg-muted/50 rounded-md p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={rotateCounterClockwise}
              title="Rotate Counter-Clockwise"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={rotateClockwise}
              title="Rotate Clockwise"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}