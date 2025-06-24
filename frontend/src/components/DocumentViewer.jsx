"use client"

import { useState, useEffect } from "react"
import { Download, Eye, EyeOff, ExternalLink, AlertCircle } from "lucide-react"
import { API_URL } from "../config"

const DocumentViewer = ({ note, onDownload, onDownloadCountUpdate }) => {
  const [showViewer, setShowViewer] = useState(true)
  const [viewerError, setViewerError] = useState(false)
  const [downloadCount, setDownloadCount] = useState(note?.downloads || 0)
  const [isDownloading, setIsDownloading] = useState(false)

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

  // File info - FIXED: Using API_URL instead of localhost
  const fileUrl = `${API_URL}/api/notes/${note.id}/file/`
  const downloadUrl = `${API_URL}/api/notes/${note.id}/download/`
  const fileName = note.file.split("/").pop() || "document"
  const fileExtension = fileName.split(".").pop()?.toLowerCase()

  console.log("DocumentViewer URLs:", { fileUrl, downloadUrl, API_URL })

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

  const fileInfo = getFileInfo()

  const handleDirectDownload = async () => {
    if (isDownloading) return // Prevent double clicks

    setIsDownloading(true)

    try {
      console.log("Starting download process for note:", note.id)

      // First increment the counter - FIXED: Using API_URL
      const response = await fetch(`${API_URL}/api/notes/${note.id}/increment-download/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Download counter response:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Updated download count:", data.downloads)

        // Update the counter immediately in UI
        setDownloadCount(data.downloads)

        // Update parent component's note state
        if (onDownloadCountUpdate) {
          onDownloadCountUpdate(data.downloads)
        }
      } else {
        console.warn("Failed to update download counter:", response.status)
      }

      // Then start the download
      console.log("Initiating file download from:", downloadUrl)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.log("Download initiated successfully")
    } catch (error) {
      console.error("Download error:", error)
      // Still allow download even if counter fails
      console.log("Fallback: Opening download URL in new tab")
      window.open(downloadUrl, "_blank")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{fileInfo.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{fileName}</h3>
            <div className="flex items-center space-x-4">
              <p className={`text-sm ${fileInfo.color} font-medium`}>{fileInfo.type}</p>
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

          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open
          </a>
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
                  src={fileUrl}
                  width="100%"
                  height="700px"
                  className="border-0"
                  title={`PDF - ${note.title}`}
                  onError={() => {
                    console.error("PDF viewer failed to load:", fileUrl)
                    setViewerError(true)
                  }}
                />
                {viewerError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center p-8">
                      <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                      <p className="text-gray-700 mb-4">PDF viewer failed to load.</p>
                      <p className="text-sm text-gray-500 mb-4">URL: {fileUrl}</p>
                      <div className="space-y-2">
                        <a
                          href={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fileUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:text-blue-800 underline"
                        >
                          Try PDF.js Viewer
                        </a>
                        <button
                          onClick={() => setViewerError(false)}
                          className="block text-gray-600 hover:text-gray-800 underline mx-auto"
                        >
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
                  src={fileUrl || "/placeholder.svg"}
                  alt={note.title}
                  className="max-w-full h-auto mx-auto rounded-lg shadow-md"
                  style={{ maxHeight: "700px" }}
                  onError={(e) => {
                    console.error("Image failed to load:", fileUrl)
                    setViewerError(true)
                    e.target.src = "/placeholder.svg?height=400&width=600"
                  }}
                />
                {viewerError && <p className="text-sm text-gray-500 mt-2">Failed to load image from: {fileUrl}</p>}
              </div>
            )}

            {/* Text Viewer */}
            {isText && (
              <div className="p-4">
                <iframe
                  src={fileUrl}
                  width="100%"
                  height="500px"
                  className="border-0 bg-white"
                  title={`Text - ${note.title}`}
                  onError={() => {
                    console.error("Text viewer failed to load:", fileUrl)
                    setViewerError(true)
                  }}
                />
                {viewerError && (
                  <div className="text-center p-4">
                    <p className="text-gray-600">Failed to load text file.</p>
                    <p className="text-sm text-gray-500">URL: {fileUrl}</p>
                  </div>
                )}
              </div>
            )}

            {/* Office Documents */}
            {(isWord || isPowerPoint || isExcel) && (
              <div className="p-8 text-center bg-blue-50">
                <div className="text-6xl mb-4">{fileInfo.icon}</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{fileInfo.type}</h4>
                <p className="text-gray-600 mb-6">Choose a viewer to open this document</p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a
                    href={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span className="mr-2">📖</span>
                    Google Docs Viewer
                  </a>

                  <a
                    href={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <span className="mr-2">🏢</span>
                    Microsoft Online
                  </a>
                </div>

                <p className="text-xs text-gray-500 mt-4">File URL: {fileUrl}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Non-viewable files */}
      {!isViewable && (
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">{fileInfo.icon}</div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">Download Required</h4>
          <p className="text-gray-600 mb-6">This {fileInfo.type} needs to be downloaded to view.</p>

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
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Direct Link
            </a>
          </div>

          <p className="text-xs text-gray-500 mt-4">File URL: {fileUrl}</p>
        </div>
      )}
    </div>
  )
}

export default DocumentViewer
