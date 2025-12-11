import { useMemo, useState } from 'react'
import { useModelStore, useValidationStore } from '../../store'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { analyzeModel } from '../../core/model-analyzer'
import {
  generateReport,
  exportAsJSON,
  exportAsMarkdown,
  exportAsText,
  downloadReport,
} from '../../core/report-generator'

type ReportFormat = 'json' | 'markdown' | 'text'

export function ExportPanel() {
  const scene = useModelStore((state) => state.scene)
  const modelName = useModelStore((state) => state.modelName)
  const file = useModelStore((state) => state.file)
  const results = useValidationStore((state) => state.results)
  const [reportFormat, setReportFormat] = useState<ReportFormat>('markdown')

  const correctionsNeeded = results.filter((r) => !r.passed && r.correctiveTransform).length
  const hasErrors = results.some((r) => !r.passed && r.severity === 'error')
  const allPassed = results.length > 0 && results.every((r) => r.passed)

  const modelInfo = useMemo(() => {
    if (!scene) return null
    return analyzeModel(scene)
  }, [scene])

  const handleFixAll = () => {
    // TODO: Implement batch fix application
    console.log('Applying all fixes...')
    const fixableIssues = results.filter((r) => !r.passed && r.correctiveTransform)
    fixableIssues.forEach((issue) => {
      console.log('Fix:', issue.correctiveTransform)
    })
  }

  const handleExportModel = async () => {
    if (!scene) return

    try {
      const exporter = new GLTFExporter()
      const glb = await exporter.parseAsync(scene, { binary: true })
      const blob = new Blob([glb as ArrayBuffer], { type: 'model/gltf-binary' })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${modelName || 'model'}_exported.glb`
      link.click()

      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleExportReport = () => {
    const report = generateReport(
      modelName || 'Unknown Model',
      file?.size || null,
      results,
      modelInfo
    )

    let content: string
    let filename: string
    let mimeType: string

    switch (reportFormat) {
      case 'json':
        content = exportAsJSON(report)
        filename = `${modelName || 'model'}_validation_report.json`
        mimeType = 'application/json'
        break
      case 'markdown':
        content = exportAsMarkdown(report)
        filename = `${modelName || 'model'}_validation_report.md`
        mimeType = 'text/markdown'
        break
      case 'text':
        content = exportAsText(report)
        filename = `${modelName || 'model'}_validation_report.txt`
        mimeType = 'text/plain'
        break
    }

    downloadReport(content, filename, mimeType)
  }

  const handleCopyReport = async () => {
    const report = generateReport(
      modelName || 'Unknown Model',
      file?.size || null,
      results,
      modelInfo
    )

    let content: string
    switch (reportFormat) {
      case 'json':
        content = exportAsJSON(report)
        break
      case 'markdown':
        content = exportAsMarkdown(report)
        break
      case 'text':
        content = exportAsText(report)
        break
    }

    try {
      await navigator.clipboard.writeText(content)
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="panel export-panel">
      <div className="panel-header">
        <h3>ACTIONS</h3>
      </div>
      <div className="panel-content">
        {correctionsNeeded > 0 && (
          <div className="fix-all-section">
            <div className="fix-info">
              <span className="fix-icon">🔧</span>
              <div className="fix-text">
                <div className="fix-count">{correctionsNeeded} Auto-fixable Issue{correctionsNeeded > 1 ? 's' : ''}</div>
                <div className="fix-hint">Apply all corrections automatically</div>
              </div>
            </div>
            <button
              className="fix-all-button"
              onClick={handleFixAll}
              disabled={!scene || correctionsNeeded === 0}
            >
              <span className="button-icon">⚡</span>
              Fix All Issues
            </button>
          </div>
        )}

        {allPassed && (
          <div className="success-banner">
            <span className="success-icon">✓</span>
            <span className="success-text">Model is perfectly aligned!</span>
          </div>
        )}

        {hasErrors && !allPassed && (
          <div className="warning-banner">
            <span className="warning-icon">!</span>
            <span className="warning-text">Fix errors before exporting</span>
          </div>
        )}

        <button
          className="export-button"
          onClick={handleExportModel}
          disabled={!scene}
        >
          <span className="button-icon">↓</span>
          Export Model (.glb)
        </button>

        {/* Validation Report Export */}
        {results.length > 0 && (
          <div className="report-export-section">
            <div className="report-header">
              <span className="report-icon">📋</span>
              <span className="report-label">Validation Report</span>
            </div>
            <div className="report-format-selector">
              <label className="format-option">
                <input
                  type="radio"
                  name="reportFormat"
                  value="markdown"
                  checked={reportFormat === 'markdown'}
                  onChange={() => setReportFormat('markdown')}
                />
                <span className="format-label">Markdown</span>
              </label>
              <label className="format-option">
                <input
                  type="radio"
                  name="reportFormat"
                  value="json"
                  checked={reportFormat === 'json'}
                  onChange={() => setReportFormat('json')}
                />
                <span className="format-label">JSON</span>
              </label>
              <label className="format-option">
                <input
                  type="radio"
                  name="reportFormat"
                  value="text"
                  checked={reportFormat === 'text'}
                  onChange={() => setReportFormat('text')}
                />
                <span className="format-label">Text</span>
              </label>
            </div>
            <div className="report-actions">
              <button
                className="report-button download"
                onClick={handleExportReport}
                title="Download validation report"
              >
                <span className="button-icon">↓</span>
                Download Report
              </button>
              <button
                className="report-button copy"
                onClick={handleCopyReport}
                title="Copy report to clipboard"
              >
                <span className="button-icon">📋</span>
                Copy
              </button>
            </div>
          </div>
        )}

        {!scene && (
          <div className="empty-state-small">
            <p className="no-data">No model loaded</p>
          </div>
        )}
      </div>
    </div>
  )
}
