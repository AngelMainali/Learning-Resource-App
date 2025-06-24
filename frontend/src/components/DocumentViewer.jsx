"use client"

import { useState, useEffect } from "react"
import { Download, Eye, EyeOff, ExternalLink, AlertCircle, RefreshCw } from "lucide-react"
import { API_URL } from "../config"

const DocumentViewer = ({ note, onDownload, onDownloadCountUpdate }) => {
  const [showViewer, setShowViewer] = useState(true)
  const [viewerError, setViewerError] = useState(false)
  const [downloadCount, setDownloadCount] = useState(note?.downloads || 0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [fileInfo, setFileInfo] = useState(null)

  // Update download count when note prop changes
  useEffect(() => {
    setDownloadCount(note?.downloads || 0)
  }, [note?.downloads])

  if (!note?.file) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No File Available</h3>
        <p className="text-gray-600">This note doesn't have any file attached.</p>
      </div>
    )
  }

  // File info - FIXED: Better file URL handling
  const fileName = note.file.split("/").pop() || "document"
  const fileExtension = fileName.split(".").pop()?.toLowerCase()

  // Try different URL patterns for file access
  const fileUrls = {
    direct: `${API_URL}${note.file}`, // Direct file path
    api: `${API_URL}/api/notes/${note.id}/file/`, // API endpoint
    media: `${API_URL}/media/${note.file}`, // Media URL
    download: `${API_URL}/api/notes/${note.id}/download/`, // Download endpoint
  }

  console.log("DocumentViewer file URLs:", fileUrls)
  console.log("Note file path:", note.file)

  // File type detection
  const isPDF = fileExtension === "pdf"
  const isWord = ["doc", "docx"].includes(fileExtension)
  const isPowerPoint = ["ppt", "pptx"].includes(fileExtension)
  const isExcel = ["xls", "xlsx"].includes(fileExtension)
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(fileExtension)
  const isText = ["txt", "csv", "md"].includes(fileExtension)

  const isViewable = isPDF || isWord || isPowerPoint || isExcel || isImage || isText

  // File type info
  const getFileInfo = () => {
    if (isPDF) return { icon: "📄", type: "PDF Document", color: "text-red-600" }
    if (isWord) return { icon: "📝", type: "Word Document", color: "text-blue-600" }
    if (isPowerPoint) return { icon: "📊", type: "PowerPoint", color: "text-orange-600" }
    if (isExcel) return { icon: "📈", type: "Excel Spreadsheet", color: "text-green-600" }
    if (isImage) return { icon: "🖼️", type: "Image", color: "text-purple-600" }
    if (isText) return { icon: "📃", type: "Text File", color: "text-gray-600" }
    return { icon: "📁", type: "File", color: "text-gray-500" }
  }

  const fileTypeInfo = getFileInfo()

  const handleDirectDownload = async () => {
    if (isDownloading) return

    setIsDownloading(true)

    try {
      console.log("Starting download process for note:", note.id)

      // Try to increment download counter first
      try {
        const counterResponse = await fetch(`${API_URL}/api/notes/${note.id}/increment-download/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (counterResponse.ok) {
          const data = await counterResponse.json()
          setDownloadCount(data.downloads)
          if (onDownloadCountUpdate) {
            onDownloadCountUpdate(data.downloads)
          }
        }
      } catch (counterError) {
        console.warn("Failed to update download counter:", counterError)
      }

      // Try download endpoint first
      console.log("Attempting download from:", fileUrls.download)

      const response = await fetch(fileUrls.download)

      if (response.ok) {
        const blob = await response.blob()

        // Check if we got a JSON response instead of file
        if (blob.type === "application/json") {
          console.warn("Got JSON response instead of file, trying direct file URL")
          // Fallback to direct file URL
          window.open(fileUrls.direct, "_blank")
        } else {
          // Create download link
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(link)
        }
      } else {
        console.warn("Download endpoint failed, trying direct file URL")
        window.open(fileUrls.direct, "_blank")
      }
    } catch (error) {
      console.error("Download error:", error)
      // Final fallback - try all URLs
      console.log("Trying fallback URLs...")
      window.open(fileUrls.direct, "_blank")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Debug Info Panel */}
      <div className="bg-yellow-50 border-b p-3 text-xs">
        <details>
          <summary className="cursor-pointer font-medium text-yellow-800">🔧 Debug Info (Click to expand)</summary>
          <div className="mt-2 space-y-1 text-yellow-700">
            <div>
              <strong>File Path:</strong> {note.file}
            </div>
            <div>
              <strong>File Name:</strong> {fileName}
            </div>
            <div>
              <strong>Extension:</strong> {fileExtension}
            </div>
            <div>
              <strong>Direct URL:</strong>{" "}
              <a href={fileUrls.direct} target="_blank" rel="noopener noreferrer" className="underline">
                {fileUrls.direct}
              </a>
            </div>
            <div>
              <strong>API URL:</strong>{" "}
              <a href={fileUrls.api} target="_blank" rel="noopener noreferrer" className="underline">
                {fileUrls.api}
              </a>
            </div>
            <div>
              <strong>Download URL:</strong>{" "}
              <a href={fileUrls.download} target="_blank" rel="noopener noreferrer" className="underline">
                {fileUrls.download}
              </a>
            </div>
          </div>
        </details>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{fileTypeInfo.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{fileName}</h3>
            <div className="flex items-center space-x-4">
              <p className={`text-sm ${fileTypeInfo.color} font-medium`}>{fileTypeInfo.type}</p>
              <p className="text-sm text-gray-500">📥 {downloadCount} downloads</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isViewable && (
            <button
              onClick={() => setShowViewer(!showViewer)}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showViewer ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {showViewer ? "Hide" : "Show"}
            </button>
          )}

          <button
            onClick={handleDirectDownload}
            disabled={isDownloading}
            className={`flex items-center px-3 py-2 text-white rounded-lg transition-colors ${
              isDownloading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            <Download className="h-4 w-4 mr-1" />
            {isDownloading ? "Downloading..." : "Download"}
          </button>

          {/* Multiple file access options */}
          <div className="relative group">
            <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <ExternalLink className="h-4 w-4 mr-1" />
              Open
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <div className="p-2 space-y-1 min-w-48">
                <a
                  href={fileUrls.direct}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  📁 Direct File
                </a>
                <a
                  href={fileUrls.api}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  🔗 API Endpoint
                </a>
                <a
                  href={fileUrls.download}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  ⬇️ Download Endpoint
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer */}
      {showViewer && isViewable && (
        <div className="p-4">
          <div className="border rounded-lg overflow-hidden bg-white">
            {/* PDF Viewer */}
            {isPDF && (
              <div className="relative">
                <iframe
                  src={fileUrls.direct}
                  width="100%"
                  height="700px"
                  className="border-0"
                  title={`PDF - ${note.title}`}
                  onError={() => {
                    console.error("PDF viewer failed to load:", fileUrls.direct)
                    setViewerError(true)
                  }}
                />
                {viewerError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center p-8">
                      <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                      <p className="text-gray-700 mb-4">PDF viewer failed to load.</p>
                      <div className="space-y-2">
                        <a
                          href={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fileUrls.direct)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:text-blue-800 underline"
                        >
                          📖 Try PDF.js Viewer
                        </a>
                        <a
                          href={fileUrls.direct}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:text-blue-800 underline"
                        >
                          🔗 Open Direct Link
                        </a>
                        <button
                          onClick={() => setViewerError(false)}
                          className="block text-gray-600 hover:text-gray-800 underline mx-auto"
                        >
                          <RefreshCw className="h-4 w-4 inline mr-1" />
                          Retry
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Image Viewer */}
            {isImage && (
              <div className="text-center p-6">
                <img
                  src={fileUrls.direct || "/placeholder.svg"}
                  alt={note.title}
                  className="max-w-full h-auto mx-auto rounded-lg shadow-md"
                  style={{ maxHeight: "700px" }}
                  onError={(e) => {
                    console.error("Image failed to load:", fileUrls.direct)
                    setViewerError(true)
                    e.target.src = "/placeholder.svg?height=400&width=600"
                  }}
                />
                {viewerError && (
                  <p className="text-sm text-gray-500 mt-2">Failed to load image from: {fileUrls.direct}</p>
                )}
              </div>
            )}

            {/* Office Documents */}
            {(isWord || isPowerPoint || isExcel) && (
              <div className="p-8 text-center bg-blue-50">
                <div className="text-6xl mb-4">{fileTypeInfo.icon}</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{fileTypeInfo.type}</h4>
                <p className="text-gray-600 mb-6">Choose a viewer to open this document</p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a
                    href={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrls.direct)}&embedded=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span className="mr-2">📖</span>
                    Google Docs Viewer
                  </a>

                  <a
                    href={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrls.direct)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <span className="mr-2">🏢</span>
                    Microsoft Online
                  </a>

                  <a
                    href={fileUrls.direct}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <span className="mr-2">🔗</span>
                    Direct Link
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Non-viewable files */}
      {!isViewable && (
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">{fileTypeInfo.icon}</div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">Download Required</h4>
          <p className="text-gray-600 mb-6">This {fileTypeInfo.type} needs to be downloaded to view.</p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleDirectDownload}
              disabled={isDownloading}
              className={`flex items-center justify-center px-6 py-3 text-white rounded-lg transition-colors ${
                isDownloading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <Download className="h-5 w-5 mr-2" />
              {isDownloading ? "Downloading..." : "Download File"}
            </button>

            <a
              href={fileUrls.direct}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Direct Link
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentViewer
