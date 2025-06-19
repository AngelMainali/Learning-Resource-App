"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, RotateCw } from "lucide-react"

const PDFViewer = ({ fileUrl, fileName }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
  const pdfJsUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fileUrl)}`

  return (
    <div className="w-full">
      {/* PDF Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">PDF Viewer</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-1 rounded hover:bg-gray-200">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-1 rounded hover:bg-gray-200">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button onClick={() => setRotation((rotation + 90) % 360)} className="p-1 rounded hover:bg-gray-200">
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="relative bg-gray-200" style={{ height: "800px" }}>
        <iframe
          src={googleViewerUrl}
          width="100%"
          height="100%"
          title={`PDF Viewer - ${fileName}`}
          className="border-0"
          onLoad={() => setLoading(false)}
          onError={() => setError(true)}
        />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}
      </div>

      {/* Alternative Options */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex flex-wrap gap-4 text-sm">
          <a href={pdfJsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
            📄 Open in PDF.js
          </a>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
            🔗 Open in New Tab
          </a>
          <a href={fileUrl} download={fileName} className="text-blue-600 hover:text-blue-800">
            <Download className="h-4 w-4 inline mr-1" />
            Download PDF
          </a>
        </div>
      </div>
    </div>
  )
}

export default PDFViewer
