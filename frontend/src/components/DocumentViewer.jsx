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

  // Clean the file path and create comprehensive URL patterns
  const cleanFilePath = note.file.startsWith("/") ? note.file : `/${note.file}`
  const filePathWithoutSlash = note.file.startsWith("/") ? note.file.substring(1) : note.file

  // Comprehensive URL patterns to test
  const fileUrls = [
    // Direct file paths
    `${API_URL}${cleanFilePath}`,
    `${API_URL}/${filePathWithoutSlash}`,

    // Media folder variations
    `${API_URL}/media${cleanFilePath}`,
    `${API_URL}/media/${filePathWithoutSlash}`,

    // Static files
    `${API_URL}/static${cleanFilePath}`,
    `${API_URL}/static/${filePathWithoutSlash}`,

    // API endpoints
    `${API_URL}/api/notes/${note.id}/file/`,
    `${API_URL}/api/notes/${note.id}/download/`,
    `${API_URL}/api/notes/${note.id}/serve/`,

    // Files folder
    `${API_URL}/files${cleanFilePath}`,
    `${API_URL}/files/${filePathWithoutSlash}`,

    // Uploads folder
    `${API_URL}/uploads${cleanFilePath}`,
    `${API_URL}/uploads/${filePathWithoutSlash}`,
  ]

  console.log("=== DocumentViewer Comprehensive Debug ===")
  console.log("API_URL:", API_URL)
  console.log("note.file:", note.file)
  console.log("cleanFilePath:", cleanFilePath)
  console.log("filePathWithoutSlash:", filePathWithoutSlash)
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

    console.log("🔍 Testing all URLs comprehensively...")

    for (const [index, url] of fileUrls.entries()) {
      const result = {
        index: index + 1,
        url,
        status: "Testing...",
        error: null,
        responseHeaders: null,
        contentType: null,
        contentLength: null,
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
        result.responseHeaders = Object.fromEntries(headResponse.headers.entries())
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
        alert("No working download URL found. Please check the debug info below.")
      }
    } catch (error) {
      console.error("Download error:", error)
      alert("Download failed. Please check the debug info below.")
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
      alert("No working file URL found. Please check the debug info below to see what URLs were tested.")
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
            title="Test all file URLs"
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

      {/* Comprehensive Debug section */}
      <div className="px-6 pb-4">
        <details className="text-sm" open={!workingUrl && urlTestResults.length > 0}>
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
            🔧 Comprehensive Debug Info - File URL Testing Results
          </summary>
          <div className="mt-3 p-4 bg-gray-50 rounded-lg text-xs space-y-3">
            {/* File Info */}
            <div className="border-b pb-2">
              <h4 className="font-medium mb-1">File Information:</h4>
              <p>
                <strong>API_URL:</strong> <code className="bg-white px-1 rounded">{API_URL}</code>
              </p>
              <p>
                <strong>File path:</strong> <code className="bg-white px-1 rounded">{note.file}</code>
              </p>
              <p>
                <strong>Clean path:</strong> <code className="bg-white px-1 rounded">{cleanFilePath}</code>
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
                {isTestingUrls ? "🔄 Testing URLs..." : "🔄 Test All URLs Now"}
              </button>
            </div>

            {/* URL Test Results */}
            {urlTestResults.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">URL Test Results:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
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
                            ? "✅ WORKING FILE"
                            : result.status === 200
                              ? `⚠️ ${result.status}`
                              : `❌ ${result.status}`}
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

                      {result.blobSize && <p className="text-xs text-gray-600">File Size: {result.blobSize} bytes</p>}

                      {result.error && <p className="text-xs text-red-600">Error: {result.error}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="border-t pt-2 text-xs text-gray-600">
              <p>
                <strong>Instructions:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 mt-1">
                <li>Click "Test All URLs Now" to check which URLs work</li>
                <li>Look for URLs marked "✅ WORKING FILE"</li>
                <li>If no working URLs found, check your Django file serving configuration</li>
                <li>You can click on any URL above to test it directly in browser</li>
              </ol>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}

export default DocumentViewer
