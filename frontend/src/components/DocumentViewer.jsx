"use client"

import { useState, useEffect } from "react"
import { Download, ExternalLink, RefreshCw } from "lucide-react"
import { API_URL } from "../config"

const DocumentViewer = ({ note, onDownload, onDownloadCountUpdate }) => {
  const [downloadCount, setDownloadCount] = useState(note?.downloads || 0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [workingUrl, setWorkingUrl] = useState(null) // Cache working URL
  const [isTestingUrls, setIsTestingUrls] = useState(false)

  useEffect(() => {
    setDownloadCount(note?.downloads || 0)
    // Reset working URL when note changes
    setWorkingUrl(null)
  }, [note?.downloads, note?.id])

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

  // Try different URL patterns
  const fileUrls = [
    `${API_URL}${cleanFilePath}`,
    `${API_URL}/media${cleanFilePath}`,
    `${API_URL}/api/notes/${note.id}/file/`,
    `${API_URL}/api/notes/${note.id}/serve/`, // Additional endpoint
  ]

  console.log("=== DocumentViewer Debug ===")
  console.log("Working URL cached:", workingUrl)
  console.log("Generated URLs:", fileUrls)

  // File type info
  const getFileInfo = () => {
    if (fileExtension === "pdf") return { icon: "📄", type: "PDF Document" }
    if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) return { icon: "🖼️", type: "Image" }
    if (["doc", "docx"].includes(fileExtension)) return { icon: "📝", type: "Word Document" }
    return { icon: "📁", type: "File" }
  }

  const fileInfo = getFileInfo()

  // Test URLs to find working one
  const findWorkingUrl = async () => {
    setIsTestingUrls(true)
    console.log("🔍 Testing URLs to find working one...")

    for (const [index, url] of fileUrls.entries()) {
      try {
        console.log(`Testing URL ${index + 1}:`, url)

        const response = await fetch(url, {
          method: "HEAD",
          cache: "no-cache", // Prevent caching issues
        })

        console.log(`URL ${index + 1} status:`, response.status, response.statusText)

        if (response.ok) {
          console.log("✅ Found working URL:", url)
          setWorkingUrl(url)
          setIsTestingUrls(false)
          return url
        }
      } catch (error) {
        console.log(`❌ URL ${index + 1} failed:`, error.message)
      }
    }

    console.log("❌ No working URL found")
    setIsTestingUrls(false)
    return null
  }

  // Handle Download
  const handleDownload = async () => {
    if (isDownloading) return
    setIsDownloading(true)

    try {
      console.log("Starting download process...")

      // Increment counter first
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

      // Use cached working URL or find new one
      let urlToUse = workingUrl
      if (!urlToUse) {
        urlToUse = await findWorkingUrl()
      }

      if (urlToUse) {
        try {
          console.log("Downloading from cached/found URL:", urlToUse)
          const response = await fetch(urlToUse, { cache: "no-cache" })

          if (response.ok) {
            const blob = await response.blob()
            console.log("Blob size:", blob.size, "Type:", blob.type)

            if (blob.size > 0 && !blob.type.includes("json")) {
              const downloadUrl = window.URL.createObjectURL(blob)
              const link = document.createElement("a")
              link.href = downloadUrl
              link.download = fileName
              document.body.appendChild(link)
              link.click()
              window.URL.revokeObjectURL(downloadUrl)
              document.body.removeChild(link)
              console.log("✅ Download successful")
            } else {
              throw new Error("Invalid file response")
            }
          } else {
            throw new Error(`HTTP ${response.status}`)
          }
        } catch (downloadError) {
          console.log("Cached URL failed, clearing cache and retrying...")
          setWorkingUrl(null)

          // Try to find working URL again
          const newUrl = await findWorkingUrl()
          if (newUrl) {
            window.open(newUrl, "_blank")
          } else {
            alert("Unable to download file. Please try again or contact support.")
          }
        }
      } else {
        alert("Unable to access file. Please try again or contact support.")
      }
    } catch (error) {
      console.error("Download error:", error)
      alert("Download failed. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle Open/View
  const handleOpen = async () => {
    console.log("=== Opening file ===")

    // Use cached working URL if available
    if (workingUrl) {
      console.log("Using cached working URL:", workingUrl)

      // Test if cached URL still works
      try {
        const testResponse = await fetch(workingUrl, {
          method: "HEAD",
          cache: "no-cache",
        })

        if (testResponse.ok) {
          console.log("✅ Cached URL still works, opening...")
          window.open(workingUrl, "_blank")
          return
        } else {
          console.log("❌ Cached URL no longer works, clearing cache...")
          setWorkingUrl(null)
        }
      } catch (error) {
        console.log("❌ Cached URL test failed, clearing cache...")
        setWorkingUrl(null)
      }
    }

    // Find working URL
    const foundUrl = await findWorkingUrl()
    if (foundUrl) {
      console.log("✅ Opening newly found URL:", foundUrl)
      window.open(foundUrl, "_blank")
    } else {
      alert("Unable to open file. The file may have been moved or deleted.")
    }
  }

  // Refresh URLs (clear cache and test again)
  const handleRefreshUrls = async () => {
    setWorkingUrl(null)
    await findWorkingUrl()
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
              {workingUrl && <p className="text-xs text-green-600">✅ URL Cached</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefreshUrls}
            disabled={isTestingUrls}
            className={`flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
              isTestingUrls ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Refresh file URLs"
          >
            <RefreshCw className={`h-4 w-4 ${isTestingUrls ? "animate-spin" : ""}`} />
          </button>

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
            disabled={isTestingUrls}
            className={`flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors ${
              isTestingUrls ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            {isTestingUrls ? "Testing..." : "Open"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DocumentViewer
