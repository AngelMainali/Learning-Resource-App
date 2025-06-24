"use client"

import { useState, useEffect } from "react"
import { Download, ExternalLink } from "lucide-react"
import { API_URL } from "../config"

const DocumentViewer = ({ note, onDownload, onDownloadCountUpdate }) => {
  const [downloadCount, setDownloadCount] = useState(note?.downloads || 0)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    setDownloadCount(note?.downloads || 0)
  }, [note?.downloads])

  if (!note?.file) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No File Available</h3>
        <p className="text-gray-600">This note doesn't have any file attached.</p>
      </div>
    )
  }

  const fileName = note.file.split("/").pop() || "document"
  const fileExtension = fileName.split(".").pop()?.toLowerCase()

  // Try different URL patterns
  const fileUrls = [
    `${API_URL}${note.file}`, // Direct path
    `${API_URL}/media/${note.file}`, // Media folder
    `${API_URL}/api/notes/${note.id}/file/`, // API endpoint
  ]

  console.log("Trying file URLs:", fileUrls)

  // File type info
  const getFileInfo = () => {
    if (fileExtension === "pdf") return { icon: "📄", type: "PDF Document" }
    if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) return { icon: "🖼️", type: "Image" }
    if (["doc", "docx"].includes(fileExtension)) return { icon: "📝", type: "Word Document" }
    return { icon: "📁", type: "File" }
  }

  const fileInfo = getFileInfo()

  // Handle Download
  const handleDownload = async () => {
    if (isDownloading) return
    setIsDownloading(true)

    try {
      // Increment counter
      await fetch(`${API_URL}/api/notes/${note.id}/increment-download/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setDownloadCount(data.downloads)
          if (onDownloadCountUpdate) onDownloadCountUpdate(data.downloads)
        }
      })

      // Try downloading from different URLs
      let downloadSuccess = false

      for (const url of fileUrls) {
        try {
          const response = await fetch(url)
          if (response.ok) {
            const blob = await response.blob()

            // Check if it's actually a file (not JSON error)
            if (blob.size > 0 && !blob.type.includes("json")) {
              const downloadUrl = window.URL.createObjectURL(blob)
              const link = document.createElement("a")
              link.href = downloadUrl
              link.download = fileName
              document.body.appendChild(link)
              link.click()
              window.URL.revokeObjectURL(downloadUrl)
              document.body.removeChild(link)
              downloadSuccess = true
              console.log("Download successful from:", url)
              break
            }
          }
        } catch (err) {
          console.log("Failed to download from:", url)
        }
      }

      if (!downloadSuccess) {
        // Fallback: open in new tab
        window.open(fileUrls[0], "_blank")
      }
    } catch (error) {
      console.error("Download error:", error)
      window.open(fileUrls[0], "_blank")
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle Open/View
  const handleOpen = () => {
    // Try opening the first available URL
    window.open(fileUrls[0], "_blank")
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header with file info and buttons */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center">
          <span className="text-3xl mr-4">{fileInfo.icon}</span>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{fileName}</h3>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-sm text-gray-600 font-medium">{fileInfo.type}</p>
              <p className="text-sm text-gray-500">📥 {downloadCount} downloads</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`flex items-center px-6 py-3 text-white rounded-lg font-medium transition-colors ${
              isDownloading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            <Download className="h-5 w-5 mr-2" />
            {isDownloading ? "Downloading..." : "Download"}
          </button>

          <button
            onClick={handleOpen}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            Open
          </button>
        </div>
      </div>

      {/* Debug section - remove this after testing */}
      <div className="px-6 pb-4">
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
            🔧 Debug Info (Click to see file URLs)
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded text-xs space-y-1">
            <p>
              <strong>File path:</strong> {note.file}
            </p>
            {fileUrls.map((url, index) => (
              <p key={index}>
                <strong>URL {index + 1}:</strong>{" "}
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {url}
                </a>
              </p>
            ))}
          </div>
        </details>
      </div>
    </div>
  )
}

export default DocumentViewer
