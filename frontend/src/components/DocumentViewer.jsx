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

  // Clean the file path and create proper URLs
  const cleanFilePath = note.file.startsWith("/") ? note.file : `/${note.file}`

  // Try different URL patterns - FIXED URL construction
  const fileUrls = [
    `${API_URL}${cleanFilePath}`, // Direct path: https://api.angelmainali.com.np/media/notes/file.pdf
    `${API_URL}/media${cleanFilePath}`, // Media folder: https://api.angelmainali.com.np/media/notes/file.pdf
    `${API_URL}/api/notes/${note.id}/file/`, // API endpoint
  ]

  console.log("=== DocumentViewer Debug ===")
  console.log("API_URL:", API_URL)
  console.log("note.file:", note.file)
  console.log("cleanFilePath:", cleanFilePath)
  console.log("Generated URLs:", fileUrls)

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
      console.log("Starting download process...")

      // Increment counter
      try {
        const counterResponse = await fetch(`${API_URL}/api/notes/${note.id}/increment-download/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })

        if (counterResponse.ok) {
          const data = await counterResponse.json()
          setDownloadCount(data.downloads)
          if (onDownloadCountUpdate) onDownloadCountUpdate(data.downloads)
          console.log("Download counter updated:", data.downloads)
        }
      } catch (counterError) {
        console.warn("Failed to update counter:", counterError)
      }

      // Try downloading from different URLs
      let downloadSuccess = false

      for (const [index, url] of fileUrls.entries()) {
        try {
          console.log(`Trying download URL ${index + 1}:`, url)

          const response = await fetch(url)
          console.log(`Response status for URL ${index + 1}:`, response.status)

          if (response.ok) {
            const blob = await response.blob()
            console.log(`Blob size for URL ${index + 1}:`, blob.size, "Type:", blob.type)

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
              console.log("✅ Download successful from:", url)
              break
            }
          }
        } catch (err) {
          console.log(`❌ Failed to download from URL ${index + 1}:`, url, "Error:", err.message)
        }
      }

      if (!downloadSuccess) {
        console.log("All download attempts failed, opening in new tab...")
        // Test each URL to find working one
        for (const url of fileUrls) {
          try {
            const testResponse = await fetch(url, { method: "HEAD" })
            if (testResponse.ok) {
              console.log("Opening working URL:", url)
              window.open(url, "_blank")
              break
            }
          } catch (e) {
            console.log("URL test failed:", url)
          }
        }
      }
    } catch (error) {
      console.error("Download error:", error)
      alert("Download failed. Please check the debug info below.")
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle Open/View - Test URLs first
  const handleOpen = async () => {
    console.log("=== Testing URLs for viewing ===")

    for (const [index, url] of fileUrls.entries()) {
      try {
        console.log(`Testing URL ${index + 1}:`, url)

        // Test if URL is accessible
        const response = await fetch(url, { method: "HEAD" })
        console.log(`URL ${index + 1} status:`, response.status)

        if (response.ok) {
          console.log("✅ Opening working URL:", url)
          window.open(url, "_blank")
          return
        }
      } catch (error) {
        console.log(`❌ URL ${index + 1} failed:`, error.message)
      }
    }

    console.log("❌ All URLs failed, trying first URL anyway...")
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

      {/* Enhanced Debug section */}
      <div className="px-6 pb-4">
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
            🔧 Debug Info - Click to see file URLs and test them
          </summary>
          <div className="mt-3 p-4 bg-gray-50 rounded-lg text-xs space-y-2">
            <div className="grid grid-cols-1 gap-2">
              <p>
                <strong>API_URL:</strong> <code className="bg-white px-1 rounded">{API_URL}</code>
              </p>
              <p>
                <strong>File path:</strong> <code className="bg-white px-1 rounded">{note.file}</code>
              </p>
              <p>
                <strong>Clean path:</strong> <code className="bg-white px-1 rounded">{cleanFilePath}</code>
              </p>
            </div>

            <div className="border-t pt-2">
              <p className="font-medium mb-2">Generated URLs (click to test):</p>
              {fileUrls.map((url, index) => (
                <div key={index} className="flex items-center justify-between py-1">
                  <span className="text-xs">URL {index + 1}:</span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-xs break-all ml-2"
                  >
                    {url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}

export default DocumentViewer
