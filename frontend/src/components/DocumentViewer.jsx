"use client"

import { useState, useEffect } from "react"
import { Download, ExternalLink, RefreshCw, AlertCircle, FileText } from "lucide-react"
import { API_URL } from "../config"

const DocumentViewer = ({ note, onDownload, onDownloadCountUpdate }) => {
  const [downloadCount, setDownloadCount] = useState(note?.downloads || 0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [workingUrl, setWorkingUrl] = useState(null)
  const [isTestingUrls, setIsTestingUrls] = useState(false)
  const [urlTestResults, setUrlTestResults] = useState([])
  const [fileAccessible, setFileAccessible] = useState(false)

  useEffect(() => {
    setDownloadCount(note?.downloads || 0)
    setWorkingUrl(null)
    setUrlTestResults([])
    setFileAccessible(false)
    // Auto-test URLs when component loads
    if (note?.id) {
      setTimeout(() => testFileAccess(), 500)
    }
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

  // Based on your Django views.py, these are the actual endpoints that should work
  const primaryUrls = [
    `${API_URL}/api/notes/${note.id}/serve/`,
    `${API_URL}/api/notes/${note.id}/download/`,
    `${API_URL}/api/notes/${note.id}/file/`,
  ]

  // File type info
  const getFileInfo = () => {
    if (fileExtension === "pdf") return { icon: "📄", type: "PDF Document", color: "text-red-600" }
    if (["jpg", "jpeg", "png", "gif"].includes(fileExtension))
      return { icon: "🖼️", type: "Image", color: "text-blue-600" }
    if (["doc", "docx"].includes(fileExtension)) return { icon: "📝", type: "Word Document", color: "text-blue-600" }
    return { icon: "📁", type: "File", color: "text-gray-600" }
  }

  const fileInfo = getFileInfo()

  // Quick test for file accessibility
  const testFileAccess = async () => {
    setIsTestingUrls(true)
    console.log("🔍 Testing file access for note:", note.id)

    for (const url of primaryUrls) {
      try {
        console.log("Testing:", url)
        const response = await fetch(url, {
          method: "HEAD",
          cache: "no-cache",
          headers: {
            Accept: "*/*",
          },
        })

        console.log(`${url} - Status: ${response.status}`)

        if (response.ok) {
          setWorkingUrl(url)
          setFileAccessible(true)
          console.log("✅ Found working URL:", url)
          break
        }
      } catch (error) {
        console.log(`❌ ${url} failed:`, error.message)
      }
    }

    setIsTestingUrls(false)
  }

  // Comprehensive URL testing for debugging
  const testAllUrls = async () => {
    setIsTestingUrls(true)
    const results = []

    // Extract file path from the stored URL
    let filePath = note.file
    if (note.file.startsWith("http")) {
      const urlParts = note.file.split("/media/")
      if (urlParts.length > 1) {
        filePath = urlParts[1]
      }
    }

    // Comprehensive URL list for debugging
    const allUrls = [
      // Primary API endpoints (most likely to work)
      `${API_URL}/api/notes/${note.id}/serve/`,
      `${API_URL}/api/notes/${note.id}/download/`,
      `${API_URL}/api/notes/${note.id}/file/`,

      // Alternative API patterns
      `${API_URL}/api/serve-note-file/${note.id}/`,
      `${API_URL}/api/download-note-file/${note.id}/`,

      // Direct media serving attempts
      `${API_URL}/media/${filePath}`,
      `${API_URL}/${filePath}`,

      // Original URL
      note.file,

      // Static file attempts
      `${API_URL}/static/media/${filePath}`,
      `${API_URL}/files/${note.id}/`,
    ]

    console.log("🔍 Testing all URLs comprehensively...")

    for (const [index, url] of allUrls.entries()) {
      const result = {
        index: index + 1,
        url,
        status: "Testing...",
        error: null,
        contentType: null,
        isWorking: false,
      }

      try {
        const response = await fetch(url, {
          method: "HEAD",
          cache: "no-cache",
          headers: { Accept: "*/*" },
        })

        result.status = response.status
        result.contentType = response.headers.get("content-type")

        if (response.ok) {
          result.isWorking = true
          if (!workingUrl) {
            setWorkingUrl(url)
            setFileAccessible(true)
          }
        }
      } catch (error) {
        result.status = "Network Error"
        result.error = error.message
      }

      results.push(result)
    }

    setUrlTestResults(results)
    setIsTestingUrls(false)

    console.log("=== Test Results ===")
    results.forEach((r) => console.log(`${r.index}. ${r.status} - ${r.url}`))
  }

  // Handle Download with direct API call
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
      } catch (e) {
        console.warn("Counter update failed:", e)
      }

      // Try download from working URL or test URLs
      let downloadUrl = workingUrl
      if (!downloadUrl) {
        await testFileAccess()
        downloadUrl = workingUrl
      }

      if (!downloadUrl) {
        // Try the download endpoint specifically
        downloadUrl = `${API_URL}/api/notes/${note.id}/download/`
      }

      console.log("Attempting download from:", downloadUrl)

      const response = await fetch(downloadUrl, {
        cache: "no-cache",
        headers: { Accept: "*/*" },
      })

      if (response.ok) {
        const blob = await response.blob()
        if (blob.size > 0) {
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(link)
          console.log("✅ Download successful")
        } else {
          throw new Error("Empty file received")
        }
      } else {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Download error:", error)
      alert(`Download failed: ${error.message}\n\nPlease try the 'Test URLs' button to debug the issue.`)
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle Open/View
  const handleOpen = async () => {
    let openUrl = workingUrl
    if (!openUrl) {
      await testFileAccess()
      openUrl = workingUrl
    }

    if (!openUrl) {
      openUrl = `${API_URL}/api/notes/${note.id}/serve/`
    }

    console.log("Opening URL:", openUrl)
    window.open(openUrl, "_blank")
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
                <p className="text-sm text-gray-500">📥 {downloadCount} downloads</p>
                {fileAccessible && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">✅ Available</span>
                )}
                {!fileAccessible && !isTestingUrls && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">❌ Checking...</span>
                )}
                {isTestingUrls && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">🔄 Testing...</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={testAllUrls}
              disabled={isTestingUrls}
              className={`flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                isTestingUrls ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Test all possible URLs"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isTestingUrls ? "animate-spin" : ""}`} />
              Test URLs
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
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Open
            </button>
          </div>
        </div>

        {/* Quick Status */}
        {!fileAccessible && !isTestingUrls && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>File access check in progress...</strong> If this persists, click "Test URLs" for detailed
              diagnostics.
            </p>
          </div>
        )}
      </div>

      {/* Detailed Debug Info - Only show when testing or if no working URL found */}
      {(urlTestResults.length > 0 || (!fileAccessible && !isTestingUrls)) && (
        <div className="px-6 pb-6 border-t">
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium py-2">
              🔧 Diagnostic Information
            </summary>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg text-xs space-y-3">
              <div>
                <h4 className="font-medium mb-2">File Information:</h4>
                <p>
                  <strong>Note ID:</strong> {note.id}
                </p>
                <p>
                  <strong>Stored URL:</strong> <code className="bg-white px-1 rounded">{note.file}</code>
                </p>
                <p>
                  <strong>Working URL:</strong>{" "}
                  {workingUrl ? <code className="bg-green-100 px-1 rounded">{workingUrl}</code> : "None found"}
                </p>
              </div>

              {urlTestResults.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">URL Test Results:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {urlTestResults.map((result) => (
                      <div
                        key={result.index}
                        className={`p-2 rounded text-xs ${result.isWorking ? "bg-green-50" : "bg-red-50"}`}
                      >
                        <div className="flex justify-between items-center">
                          <span>#{result.index}</span>
                          <span
                            className={`px-1 rounded ${result.isWorking ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}
                          >
                            {result.isWorking ? "✅ WORKS" : `❌ ${result.status}`}
                          </span>
                        </div>
                        <p className="break-all mt-1 text-gray-600">{result.url}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-600 border-t pt-2">
                <p>
                  <strong>Troubleshooting:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Click "Test URLs" to check all possible file locations</li>
                  <li>Try the Download/Open buttons - they may work even if tests fail</li>
                  <li>If all URLs fail, the Django file serving may need configuration</li>
                </ul>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

export default DocumentViewer
