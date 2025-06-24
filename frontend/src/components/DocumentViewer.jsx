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

  // Handle both full URLs and relative paths
  let fileUrls = []

  if (note.file.startsWith("http")) {
    // If note.file is already a complete URL, use it directly
    console.log("File is already a complete URL:", note.file)
    fileUrls = [
      note.file, // Use the complete URL as-is
      note.file.replace("http://", "https://"), // Try HTTPS version
    ]
  } else {
    // If note.file is a relative path, construct URLs
    const cleanFilePath = note.file.startsWith("/") ? note.file : `/${note.file}`
    const filePathWithoutSlash = note.file.startsWith("/") ? note.file.substring(1) : note.file

    fileUrls = [
      // Direct file paths
      `${API_URL}${cleanFilePath}`,
      `${API_URL}/${filePathWithoutSlash}`,

      // Media folder variations
      `${API_URL}/media${cleanFilePath}`,
      `${API_URL}/media/${filePathWithoutSlash}`,

      // API endpoints
      `${API_URL}/api/notes/${note.id}/file/`,
      `${API_URL}/api/notes/${note.id}/download/`,
    ]
  }

  console.log("=== DocumentViewer Debug ===")
  console.log("API_URL:", API_URL)
  console.log("note.file:", note.file)
  console.log("File is complete URL:", note.file.startsWith("http"))
  console.log("Generated URLs:", fileUrls)

  // File type info
  const getFileInfo = () => {
    if (fileExtension === "pdf") return { icon: "📄", type: "PDF Document" }
    if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) return { icon: "🖼️", type: "Image" }
    if (["doc", "docx"].includes(fileExtension)) return { icon: "📝", type: "Word Document" }
    return { icon: "📁", type: "File" }
  }

  const fileInfo = getFileInfo()

  // Test URLs
  const testAllUrls = async () => {
    setIsTestingUrls(true)
    const results = []

    console.log("🔍 Testing URLs...")

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

        console.log(`URL ${index + 1} response:`, {
          status: headResponse.status,
          contentType: result.contentType,
          contentLength: result.contentLength,
        })

        if (headResponse.ok) {
          // Test with GET to verify it's actually a file
          try {
            const getResponse = await fetch(url, { cache: "no-cache" })
            if (getResponse.ok) {
              const blob = await getResponse.blob()
              result.blobSize = blob.size
              result.blobType = blob.type

              if (blob.size > 0 && !blob.type.includes("json") && !blob.type.includes("html")) {
                result.isWorkingFile = true
                if (!workingUrl) {
                  setWorkingUrl(url)
                  console.log("🎉 Found working file URL:", url)
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
    return results
  }

  // Handle Download
  const handleDownload = async () => {
    if (isDownloading) return
    setIsDownloading(true)

    try {
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
        }
      } catch (counterError) {
        console.warn("Failed to update counter:", counterError)
      }

      // Find working URL if not cached
      if (!workingUrl) {
        await testAllUrls()
      }

      if (workingUrl) {
        const response = await fetch(workingUrl, { cache: "no-cache" })
        if (response.ok) {
          const blob = await response.blob()
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
          }
        }
      } else {
        alert("No working download URL found. The file URL stored in database might be incorrect.")
      }
    } catch (error) {
      console.error("Download error:", error)
      alert("Download failed. Please check the debug info.")
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle Open/View
  const handleOpen = async () => {
    if (!workingUrl) {
      await testAllUrls()
    }

    if (workingUrl) {
      window.open(workingUrl, "_blank")
    } else {
      alert("No working file URL found. The file URL in database might be incorrect.")
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
              {workingUrl && <p className="text-xs text-green-600">✅ Working URL Found</p>}
              {!workingUrl && urlTestResults.length > 0 && <p className="text-xs text-red-600">❌ No Working URL</p>}
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
            title="Test file URLs"
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

      {/* Debug section */}
      <div className="px-6 pb-4">
        <details className="text-sm" open={!workingUrl}>
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
            🔧 Debug Info - File URL Analysis
          </summary>
          <div className="mt-3 p-4 bg-gray-50 rounded-lg text-xs space-y-3">
            {/* File Info */}
            <div className="border-b pb-2">
              <h4 className="font-medium mb-1">File Information:</h4>
              <p>
                <strong>Database file field:</strong> <code className="bg-white px-1 rounded">{note.file}</code>
              </p>
              <p>
                <strong>Is complete URL:</strong>{" "}
                <span className={note.file.startsWith("http") ? "text-green-600" : "text-red-600"}>
                  {note.file.startsWith("http") ? "Yes" : "No"}
                </span>
              </p>
              <p>
                <strong>Working URL:</strong>{" "}
                {workingUrl ? (
                  <code className="bg-green-100 text-green-800 px-1 rounded">{workingUrl}</code>
                ) : (
                  <span className="text-red-600">None found</span>
                )}
              </p>
            </div>

            {/* Test Button */}
            <div className="border-b pb-2">
              <button
                onClick={testAllUrls}
                disabled={isTestingUrls}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  isTestingUrls
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                }`}
              >
                {isTestingUrls ? "🔄 Testing URLs..." : "🔄 Test URLs Now"}
              </button>
            </div>

            {/* URL Test Results */}
            {urlTestResults.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">URL Test Results:</h4>
                <div className="space-y-2">
                  {urlTestResults.map((result) => (
                    <div
                      key={result.index}
                      className={`p-2 rounded border ${
                        result.isWorkingFile
                          ? "bg-green-50 border-green-200"
                          : result.status === 200
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">URL {result.index}:</span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            result.isWorkingFile
                              ? "bg-green-200 text-green-800"
                              : result.status === 200
                                ? "bg-yellow-200 text-yellow-800"
                                : "bg-red-200 text-red-800"
                          }`}
                        >
                          {result.isWorkingFile
                            ? "✅ WORKING"
                            : result.status === 200
                              ? `⚠️ ${result.status}`
                              : `❌ ${result.status || "ERROR"}`}
                        </span>
                      </div>

                      <p className="text-xs break-all mb-1">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {result.url}
                        </a>
                      </p>

                      {result.contentType && (
                        <p className="text-xs text-gray-600">Content-Type: {result.contentType}</p>
                      )}
                      {result.blobSize && <p className="text-xs text-gray-600">Size: {result.blobSize} bytes</p>}
                      {result.error && <p className="text-xs text-red-600">Error: {result.error}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Backend Fix Instructions */}
            <div className="border-t pt-2 text-xs text-gray-600">
              <p>
                <strong>Issue:</strong> The database stores complete URLs instead of relative paths.
              </p>
              <p>
                <strong>Backend Fix:</strong> Update Django to store relative paths like <code>notes/filename.pdf</code>{" "}
                instead of complete URLs.
              </p>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}

export default DocumentViewer
