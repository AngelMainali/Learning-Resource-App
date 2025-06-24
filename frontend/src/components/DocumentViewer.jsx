"use client"

import { useState, useEffect } from "react"
import { Download, ExternalLink, AlertCircle } from "lucide-react"
import { API_URL } from "../config"

const DocumentViewer = ({ note, onDownload, onDownloadCountUpdate }) => {
  const [downloadCount, setDownloadCount] = useState(note?.downloads || 0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [viewerError, setViewerError] = useState(false)

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

  const fileName = note.file.split("/").pop() || "document"
  const fileExtension = fileName.split(".").pop()?.toLowerCase()

  // File URLs - try direct file path first
  const directFileUrl = `${API_URL}${note.file}`
  const downloadApiUrl = `${API_URL}/api/notes/${note.id}/download/`

  console.log("File URLs:", { directFileUrl, downloadApiUrl, noteFile: note.file })

  // File type detection
  const isPDF = fileExtension === "pdf"
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(fileExtension)

  // File type info
  const getFileInfo = () => {
    if (isPDF) return { icon: "📄", type: "PDF Document", color: "text-red-600" }
    if (isImage) return { icon: "🖼️", type: "Image", color: "text-purple-600" }
    return { icon: "📁", type: "File", color: "text-gray-500" }
  }

  const fileInfo = getFileInfo()

  // Handle Download - increment counter then download
  const handleDownload = async () => {
    if (isDownloading) return

    setIsDownloading(true)

    try {
      console.log("Starting download process...")

      // First increment the counter
      const counterResponse = await fetch(`${API_URL}/api/notes/${note.id}/increment-download/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (counterResponse.ok) {
        const data = await counterResponse.json()
        console.log("Counter updated:", data.downloads)
        setDownloadCount(data.downloads)
        if (onDownloadCountUpdate) {
          onDownloadCountUpdate(data.downloads)
        }
      }

      // Then download the file using direct link method
      console.log("Downloading from:", directFileUrl)

      // Create a temporary link and click it to trigger download
      const link = document.createElement("a")
      link.href = directFileUrl
      link.download = fileName
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.log("Download initiated")
    } catch (error) {
      console.error("Download error:", error)
      alert("Download failed. Please try the 'Open' button to view the file.")
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle Open - just open in new tab
  const handleOpen = () => {
    console.log("Opening file:", directFileUrl)
    window.open(directFileUrl, "_blank")
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
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`flex items-center px-4 py-2 text-white rounded-lg transition-colors ${
              isDownloading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download"}
          </button>

          <button
            onClick={handleOpen}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open
          </button>
        </div>
      </div>

      {/* Simple PDF Viewer - No overlay, direct embed */}
      {isPDF && (
        <div className="p-4">
          <div className="border rounded-lg overflow-hidden bg-white">
            <iframe
              src={directFileUrl}
              width="100%"
              height="600px"
              className="border-0"
              title={`PDF - ${note.title}`}
              onError={() => {
                console.error("PDF failed to load:", directFileUrl)
                setViewerError(true)
              }}
            />
            {viewerError && (
              <div className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-700 mb-4">PDF failed to load in viewer.</p>
                <button
                  onClick={handleOpen}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open in New Tab
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simple Image Viewer */}
      {isImage && (
        <div className="p-4">
          <div className="text-center">
            <img
              src={directFileUrl || "/placeholder.svg"}
              alt={note.title}
              className="max-w-full h-auto mx-auto rounded-lg shadow-md"
              style={{ maxHeight: "600px" }}
              onError={(e) => {
                console.error("Image failed to load:", directFileUrl)
                e.target.src = "/placeholder.svg?height=400&width=600"
              }}
            />
          </div>
        </div>
      )}

      {/* Non-PDF/Image files */}
      {!isPDF && !isImage && (
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">{fileInfo.icon}</div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">{fileInfo.type}</h4>
          <p className="text-gray-600 mb-6">Click Download to save or Open to view in browser.</p>
        </div>
      )}

      {/* Debug info */}
      <div className="p-2 bg-gray-50 border-t text-xs text-gray-500">
        <details>
          <summary className="cursor-pointer">Debug Info</summary>
          <div className="mt-2">
            <p>
              <strong>File:</strong> {note.file}
            </p>
            <p>
              <strong>Direct URL:</strong> {directFileUrl}
            </p>
            <p>
              <strong>Download API:</strong> {downloadApiUrl}
            </p>
          </div>
        </details>
      </div>
    </div>
  )
}

export default DocumentViewer
