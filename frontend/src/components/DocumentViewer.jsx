"use client"

import { useState, useEffect } from "react"
import { Download, AlertCircle, FileText } from "lucide-react"
import { API_URL } from "../config"

const DocumentViewer = ({ note, onDownload, onDownloadCountUpdate }) => {
  const [downloadCount, setDownloadCount] = useState(note?.downloads || 0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setDownloadCount(note?.downloads || 0)
    setError(null)
  }, [note?.downloads, note?.id])

  if (!note?.file) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No File Available</h3>
        <p className="text-gray-600">This note doesn't have any file attached.</p>
      </div>
    )
  }

  const fileName = note.file.split("/").pop() || "document"
  const fileExtension = fileName.split(".").pop()?.toLowerCase()

  // File type info
  const getFileInfo = () => {
    if (fileExtension === "pdf") return { icon: "📄", type: "PDF Document", color: "text-red-600" }
    if (["jpg", "jpeg", "png", "gif"].includes(fileExtension))
      return { icon: "🖼️", type: "Image", color: "text-blue-600" }
    if (["doc", "docx"].includes(fileExtension)) return { icon: "📝", type: "Word Document", color: "text-blue-600" }
    return { icon: "📁", type: "File", color: "text-gray-600" }
  }

  const fileInfo = getFileInfo()

  // Handle Download
  const handleDownload = async () => {
    if (isDownloading) return
    setIsDownloading(true)
    setError(null)

    try {
      console.log("Starting download for note:", note.id)

      // First increment the download counter
      try {
        const counterResponse = await fetch(`${API_URL}/api/notes/${note.id}/increment-download/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        if (counterResponse.ok) {
          const data = await counterResponse.json()
          setDownloadCount(data.downloads)
          if (onDownloadCountUpdate) onDownloadCountUpdate(data.downloads)
          console.log("Download counter updated:", data.downloads)
        }
      } catch (e) {
        console.warn("Counter update failed:", e)
      }

      // Now download the file
      const downloadUrl = `${API_URL}/api/notes/${note.id}/download/`
      console.log("Downloading from:", downloadUrl)

      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          Accept: "*/*",
        },
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()
      if (blob.size === 0) {
        throw new Error("Empty file received")
      }

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)

      console.log("✅ Download successful")
    } catch (error) {
      console.error("Download error:", error)
      setError(`Download failed: ${error.message}`)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 mr-4">
              <FileText className={`h-6 w-6 ${fileInfo.color}`} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{fileName}</h3>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-sm text-gray-600 font-medium">{fileInfo.type}</p>
                <p className="text-sm text-gray-500">{downloadCount} downloads</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Download Button */}
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
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentViewer
