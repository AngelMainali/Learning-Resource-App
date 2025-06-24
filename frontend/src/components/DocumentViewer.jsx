"use client"

import { useState, useEffect } from "react"
import { Download, ExternalLink, RefreshCw, AlertCircle } from "lucide-react"
import { API_URL } from "../config"

const DocumentViewer = ({ note, onDownload, onDownloadCountUpdate }) => {
  const [downloadCount, setDownloadCount] = useState(note?.downloads || 0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [workingUrl, setWorkingUrl] = useState(null)
  const [isTestingUrls, setIsTestingUrls] = useState(false)
  const [urlTestResults, setUrlTestResults] = useState([])

  useEffect(() => {
    setDownloadCount(note?.downloads || 0)
    setWorkingUrl(null)
    setUrlTestResults([])
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

  // Extract file path from complete URL if needed
  let filePath = note.file
  if (note.file.startsWith("http")) {
    // Extract path after /media/ from the complete URL
    const urlParts = note.file.split("/media/")
    if (urlParts.length > 1) {
      filePath = urlParts[1] // e.g., "notes/learning_c_by_examples_230508_201027_1.pdf"
    }
  }

  // Create comprehensive URL patterns based on your backend structure
  const fileUrls = [
    // API endpoints that should work with your Django backend
    `${API_URL}/api/notes/${note.id}/file/`,
    `${API_URL}/api/notes/${note.id}/download/`,
    `${API_URL}/api/notes/${note.id}/serve/`,

    // Direct media serving (if configured)
    `${API_URL}/media/${filePath}`,
    `${API_URL}/static/${filePath}`,

    // Alternative API patterns
    `${API_URL}/api/files/${note.id}/`,
    `${API_URL}/api/media/${note.id}/`,

    // Try the original URL as-is (in case it works)
    note.file,

    // Try without /media/ prefix
    `${API_URL}/${filePath}`,
  ]

  console.log("=== DocumentViewer Debug ===")
  console.log("API_URL:", API_URL)
  console.log("note.file:", note.file)
  console.log("extracted filePath:", filePath)
  console.log("Generated URLs:", fileUrls)

  // File type info
  const getFileInfo = () => {
    if (fileExtension === "pdf") return { icon: "📄", type: "PDF Document" }
    if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) return { icon: "🖼️", type: "Image" }
    if (["doc", "docx"].includes(fileExtension)) return { icon: "📝", type: "Word Document" }
    return { icon: "📁", type: "File" }
  }

  const fileInfo = getFileInfo()

  // Test URLs comprehensively
  const testAllUrls = async () => {
    setIsTestingUrls(true)
    const results = []

    console.log("🔍 Testing all URLs...")

    for (const [index, url] of fileUrls.entries()) {
      const result = {
        index: index + 1,
        url,
        status: "Testing...",
        error: null,
        contentType: null,
        contentLength: null,
        isWorkingFile: false,
      }

      try {
        console.log(`Testing URL ${index + 1}:`, url)

        // Test with HEAD request first
        const headResponse = await fetch(url, {
          method: "HEAD",
          cache: "no-cache",
        })

        result.status = headResponse.status
        result.statusText = headResponse.statusText
        result.contentType = headResponse.headers.get("content-type")
        result.contentLength = headResponse.headers.get("content-length")

        console.log(`URL ${index + 1} HEAD response:`, {
          status: headResponse.status,
          statusText: headResponse.statusText,
          contentType: result.contentType,
          contentLength: result.contentLength,
        })

        if (headResponse.ok) {
          console.log("✅ URL works with HEAD:", url)

          // Test with GET request to make sure it's actually a file
          try {
            const getResponse = await fetch(url, { cache: "no-cache" })
            if (getResponse.ok) {
              const blob = await getResponse.blob()
              result.blobSize = blob.size
              result.blobType = blob.type

              console.log(`URL ${index + 1} GET response:`, {
                blobSize: blob.size,
                blobType: blob.type,
              })

              // Check if it's a valid file (not HTML error page or JSON)
              if (blob.size > 0 && !blob.type.includes("json") && !blob.type.includes("html")) {
                result.isWorkingFile = true
                if (!workingUrl) {
                  setWorkingUrl(url)
                  console.log("🎉 Found first working file URL:", url)
                }
              }
            }
          } catch (getError) {
            result.getError = getError.message
          }
        }
      } catch (error) {
        result.status = "Error"
        result.error = error.message
        console.log(`❌ URL ${index + 1} failed:`, error.message)
      }

      results.push(result)
    }

    setUrlTestResults(results)
    setIsTestingUrls(false)

    console.log("=== URL Test Results Summary ===")
    results.forEach((result) => {
      console.log(`URL ${result.index}: ${result.status} - ${result.url}`)
    })

    return results
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

      // Find working URL if not cached
      if (!workingUrl) {
        await testAllUrls()
      }

      if (workingUrl) {
        console.log("Downloading from working URL:", workingUrl)
        const response = await fetch(workingUrl, { cache: "no-cache" })
        if (response.ok) {
          const blob = await response.blob()
          console.log("Download blob:", { size: blob.size, type: blob.type })

          if (blob.size > 0) {
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
            throw new Error("Empty file received")
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } else {
        alert("File not accessible. Please contact admin to check file configuration.")
      }
    } catch (error) {
      console.error("Download error:", error)
      alert(`Download failed: ${error.message}`)
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle Open/View
  const handleOpen = async () => {
    console.log("=== Opening file ===")

    if (!workingUrl) {
      await testAllUrls()
    }

    if (workingUrl) {
      console.log("Opening working URL:", workingUrl)
      window.open(workingUrl, "_blank")
    } else {
      alert("File not accessible. Please contact admin to check file configuration.")
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center">
          <span className="text-3xl mr-4">{fileInfo.icon}</span>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{fileName}</h3>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-sm text-gray-600 font-medium">{fileInfo.type}</p>
              <p className="text-sm text-gray-500">📥 {downloadCount} downloads</p>
              {workingUrl && <p className="text-xs text-green-600">✅ File Accessible</p>}
              {!workingUrl && urlTestResults.length > 0 && (
                <p className="text-xs text-red-600">❌ File Not Accessible</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={testAllUrls}
            disabled={isTestingUrls}
            className={`flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
              isTestingUrls ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Test file accessibility"
          >
            <RefreshCw className={`h-4 w-4 ${isTestingUrls ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleDownload}
            disabled={isDownloading || isTestingUrls}
            className={`flex items-center px-6 py-3 text-white rounded-lg font-medium transition-colors ${
              isDownloading || isTestingUrls ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
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

      {/* Debug section - only show if no working URL found */}
      {!workingUrl && urlTestResults.length > 0 && (
        <div className="px-6 pb-4">
          <details className="text-sm" open>
            <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
              🔧 File Access Debug Info
            </summary>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg text-xs space-y-3">
              {/* File Info */}
              <div className="border-b pb-2">
                <h4 className="font-medium mb-1">File Information:</h4>
                <p>
                  <strong>Original URL:</strong> <code className="bg-white px-1 rounded">{note.file}</code>
                </p>
                <p>
                  <strong>Extracted path:</strong> <code className="bg-white px-1 rounded">{filePath}</code>
                </p>
              </div>

              {/* URL Test Results */}
              <div>
                <h4 className="font-medium mb-2">Tested URLs:</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {urlTestResults.map((result) => (
                    <div
                      key={result.index}
                      className={`p-2 rounded text-xs ${
                        result.isWorkingFile
                          ? "bg-green-50 border border-green-200"
                          : result.status === 200
                            ? "bg-yellow-50 border border-yellow-200"
                            : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">#{result.index}</span>
                        <span
                          className={`px-1 py-0.5 rounded text-xs ${
                            result.isWorkingFile
                              ? "bg-green-200 text-green-800"
                              : result.status === 200
                                ? "bg-yellow-200 text-yellow-800"
                                : "bg-red-200 text-red-800"
                          }`}
                        >
                          {result.isWorkingFile ? "✅ WORKS" : `❌ ${result.status || "ERROR"}`}
                        </span>
                      </div>
                      <p className="text-xs break-all mt-1 text-gray-600">{result.url}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-2 text-xs text-gray-600">
                <p>
                  <strong>Status:</strong> No accessible file URLs found. Please contact admin to check file serving
                  configuration.
                </p>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

export default DocumentViewer
