"use client"

import { useState } from "react"
import { Download, Eye, EyeOff, FileText, AlertCircle, ExternalLink } from "lucide-react"

const DocumentViewer = ({ note, onDownload }) => {
  const [showViewer, setShowViewer] = useState(false)
  const [viewerError, setViewerError] = useState(false)

  if (!note.file) {
    return null
  }

  const fileUrl = note.file.startsWith("http") ? note.file : `http://localhost:8000${note.file}`
  const fileName = note.file.split("/").pop() || "document"
  const fileExtension = fileName.split(".").pop()?.toLowerCase()

  const isPDF = fileExtension === "pdf"
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(fileExtension)
  const isDoc = ["doc", "docx"].includes(fileExtension)
  const isPPT = ["ppt", "pptx"].includes(fileExtension)
  const isExcel = ["xls", "xlsx"].includes(fileExtension)
  const isText = ["txt", "md", "rtf"].includes(fileExtension)
  const isViewable = isPDF || isImage || isDoc || isPPT || isExcel || isText

  const handleViewerLoad = () => {
    setViewerError(false)
  }

  const handleViewerError = () => {
    setViewerError(true)
  }

  // Get file type icon
  const getFileIcon = () => {
    if (isPDF) return "📄"
    if (isImage) return "🖼️"
    if (isDoc) return "📝"
    if (isPPT) return "📊"
    if (isExcel) return "📈"
    if (isText) return "📃"
    return "📁"
  }

  return (
    <div className="card mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          {getFileIcon()} Document Viewer
        </h3>
        <div className="flex items-center space-x-2">
          {isViewable && (
            <button onClick={() => setShowViewer(!showViewer)} className="btn btn-secondary flex items-center">
              {showViewer ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showViewer ? "Hide Viewer" : "View Document"}
            </button>
          )}
          <button onClick={onDownload} className="btn btn-primary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
        </div>
      </div>

      {/* File Info */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">File Name:</span>
            <p className="text-gray-600 break-all">{fileName}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">File Type:</span>
            <p className="text-gray-600">{fileExtension?.toUpperCase() || "Unknown"}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <p className="text-gray-600">{isViewable ? "Viewable Online" : "Download Only"}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Format:</span>
            <p className="text-gray-600">
              {isPDF && "PDF Document"}
              {isImage && "Image File"}
              {isDoc && "Word Document"}
              {isPPT && "PowerPoint"}
              {isExcel && "Excel Spreadsheet"}
              {isText && "Text Document"}
              {!isViewable && "Binary File"}
            </p>
          </div>
        </div>
      </div>

      {/* Document Viewer */}
      {showViewer && isViewable && (
        <div className="border rounded-lg overflow-hidden mb-4">
          {isPDF ? (
            <div className="relative">
              <object
                data={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                type="application/pdf"
                width="100%"
                height="800px"
                className="border-0"
                onLoad={handleViewerLoad}
                onError={handleViewerError}
              >
                <div className="p-8 text-center bg-yellow-50">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-yellow-900 mb-2">PDF Preview Not Available</h4>
                  <p className="text-yellow-700 mb-4">Unable to display PDF in browser. Try the alternatives below.</p>
                </div>
              </object>
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                PDF Viewer
              </div>
            </div>
          ) : isImage ? (
            <div className="text-center p-4">
              <img
                src={fileUrl || "/placeholder.svg"}
                alt={note.title}
                className="max-w-full h-auto mx-auto rounded-lg shadow-md"
                style={{ maxHeight: "800px" }}
                onLoad={handleViewerLoad}
                onError={handleViewerError}
              />
            </div>
          ) : isDoc || isPPT || isExcel ? (
            <div className="p-8 text-center bg-blue-50">
              <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-blue-900 mb-2">
                {isDoc && "Word Document Preview"}
                {isPPT && "PowerPoint Preview"}
                {isExcel && "Excel Spreadsheet Preview"}
              </h4>
              <p className="text-blue-700 mb-4">Use the online viewers below to preview this document.</p>
            </div>
          ) : isText ? (
            <div className="p-4 bg-gray-50">
              <iframe
                src={fileUrl}
                width="100%"
                height="600px"
                className="border-0 bg-white rounded"
                title={`Text Viewer - ${note.title}`}
                onLoad={handleViewerLoad}
                onError={handleViewerError}
              />
            </div>
          ) : null}
        </div>
      )}

      {/* Alternative Viewers */}
      {showViewer && isViewable && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">Alternative Viewing Options:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* PDF Alternatives */}
            {isPDF && (
              <>
                <a
                  href={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fileUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />📄 PDF.js Viewer (Recommended)
                </a>
                <a
                  href={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />📖 Google Docs Viewer
                </a>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />🔗 Open in New Tab
                </a>
                <a
                  href={`https://www.adobe.com/acrobat/online/pdf-reader.html?file=${encodeURIComponent(fileUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  🅰️ Adobe Online Reader
                </a>
              </>
            )}

            {/* Word Document Alternatives */}
            {isDoc && (
              <>
                <a
                  href={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />📖 Google Docs Viewer
                </a>
                <a
                  href={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />📝 Microsoft Office Online
                </a>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />🔗 Download & Open
                </a>
              </>
            )}

            {/* PowerPoint Alternatives */}
            {isPPT && (
              <>
                <a
                  href={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />📖 Google Docs Viewer
                </a>
                <a
                  href={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />📊 PowerPoint Online
                </a>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />🔗 Download & Open
                </a>
              </>
            )}

            {/* Excel Alternatives */}
            {isExcel && (
              <>
                <a
                  href={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />📖 Google Docs Viewer
                </a>
                <a
                  href={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />📈 Excel Online
                </a>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />🔗 Download & Open
                </a>
              </>
            )}

            {/* Image Alternatives */}
            {isImage && (
              <>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  🖼️ Open Full Size
                </a>
                <button
                  onClick={onDownload}
                  className="flex items-center p-3 bg-white rounded border hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                >
                  <Download className="h-4 w-4 mr-2" />💾 Save Image
                </button>
              </>
            )}

            {/* Text File Alternatives */}
            {isText && (
              <>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />📃 Open in New Tab
                </a>
                <button
                  onClick={onDownload}
                  className="flex items-center p-3 bg-white rounded border hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                >
                  <Download className="h-4 w-4 mr-2" />💾 Download Text
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Non-viewable files */}
      {!isViewable && (
        <div className="text-center py-8 bg-yellow-50 rounded-lg">
          <FileText className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-yellow-900 mb-2">File Available for Download</h4>
          <p className="text-yellow-700 mb-4">
            This {fileExtension?.toUpperCase()} file cannot be previewed online. Download it to view the content.
          </p>
          <div className="mt-4">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Direct Link
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentViewer
