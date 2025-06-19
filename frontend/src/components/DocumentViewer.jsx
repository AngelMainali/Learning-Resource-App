"use client"

import { useState } from "react"
import { Download, Eye, EyeOff, FileText, AlertCircle } from "lucide-react"

const DocumentViewer = ({ note, onDownload }) => {
  const [showViewer, setShowViewer] = useState(false)
  const [viewerError, setViewerError] = useState(false)

  if (!note.file) {
    return null
  }

  const fileUrl = note.file.startsWith("http") ? note.file : `http://localhost:8000${note.file}`
  const fileName = note.file.split("/").pop() || "document"
  const fileExtension = fileName.split(".").pop()?.toLowerCase()

  const isPDF = fileExtension === "pdf"
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)
  const isViewable = isPDF || isImage

  const handleViewerLoad = () => {
    setViewerError(false)
  }

  const handleViewerError = () => {
    setViewerError(true)
  }

  return (
    <div className="card mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2" />📄 Document Viewer
        </h3>
        <div className="flex items-center space-x-2">
          {isViewable && (
            <button onClick={() => setShowViewer(!showViewer)} className="btn btn-secondary flex items-center">
              {showViewer ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showViewer ? "Hide Viewer" : "View Document"}
            </button>
          )}
          <button onClick={onDownload} className="btn btn-primary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
        </div>
      </div>

      {/* File Info */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">File Name:</span>
            <p className="text-gray-600">{fileName}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">File Type:</span>
            <p className="text-gray-600">{fileExtension?.toUpperCase() || "Unknown"}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <p className="text-gray-600">{isViewable ? "Viewable Online" : "Download Only"}</p>
          </div>
        </div>
      </div>

      {/* Document Viewer */}
      {showViewer && isViewable && (
        <div className="border rounded-lg overflow-hidden">
          {viewerError ? (
            <div className="p-8 text-center bg-red-50">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-red-900 mb-2">Unable to load document</h4>
              <p className="text-red-700 mb-4">The document couldn't be displayed in the browser.</p>
              <button onClick={onDownload} className="btn btn-primary">
                <Download className="h-4 w-4 mr-2" />
                Download to View
              </button>
            </div>
          ) : isPDF ? (
            <div className="relative">
              <iframe
                src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                width="100%"
                height="800px"
                title={`PDF Viewer - ${note.title}`}
                className="border-0"
                onLoad={handleViewerLoad}
                onError={handleViewerError}
              />
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                PDF Viewer
              </div>
            </div>
          ) : isImage ? (
            <div className="text-center p-4">
              <img
                src={fileUrl || "/placeholder.svg"}
                alt={note.title}
                className="max-w-full h-auto mx-auto rounded-lg shadow-md"
                style={{ maxHeight: "800px" }}
                onLoad={handleViewerLoad}
                onError={handleViewerError}
              />
            </div>
          ) : null}
        </div>
      )}

      {/* Alternative Viewers */}
      {showViewer && isPDF && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Alternative Viewing Options:</h4>
          <div className="space-y-2 text-sm">
            <a
              href={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-800"
            >
              📖 Open in Google Docs Viewer
            </a>
            <a
              href={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fileUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-800"
            >
              📄 Open in PDF.js Viewer
            </a>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-800"
            >
              🔗 Open in New Tab
            </a>
          </div>
        </div>
      )}

      {/* Non-viewable files */}
      {!isViewable && (
        <div className="text-center py-8 bg-yellow-50 rounded-lg">
          <FileText className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-yellow-900 mb-2">Document Available for Download</h4>
          <p className="text-yellow-700 mb-4">
            This {fileExtension?.toUpperCase()} file cannot be previewed online. Download it to view the content.
          </p>
          <button onClick={onDownload} className="btn btn-primary">
            <Download className="h-4 w-4 mr-2" />
            Download {fileName}
          </button>
        </div>
      )}
    </div>
  )
}

export default DocumentViewer
