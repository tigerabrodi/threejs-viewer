import type { ValidationCheckResult } from './types'
import type { ModelInfo } from './model-analyzer'

export interface ValidationReport {
  modelName: string
  fileSize: number | null
  timestamp: string
  summary: {
    totalChecks: number
    passed: number
    failed: number
    warnings: number
    healthPercentage: number
  }
  modelInfo: ModelInfo | null
  checks: ValidationCheckResult[]
}

export function generateReport(
  modelName: string,
  fileSize: number | null,
  checks: ValidationCheckResult[],
  modelInfo: ModelInfo | null
): ValidationReport {
  const passed = checks.filter((c) => c.passed).length
  const failed = checks.filter((c) => !c.passed && c.severity === 'error').length
  const warnings = checks.filter((c) => !c.passed && c.severity === 'warning').length

  return {
    modelName,
    fileSize,
    timestamp: new Date().toISOString(),
    summary: {
      totalChecks: checks.length,
      passed,
      failed,
      warnings,
      healthPercentage: checks.length > 0 ? Math.round((passed / checks.length) * 100) : 100,
    },
    modelInfo,
    checks,
  }
}

export function exportAsJSON(report: ValidationReport): string {
  return JSON.stringify(report, null, 2)
}

export function exportAsMarkdown(report: ValidationReport): string {
  const lines: string[] = []

  // Header
  lines.push(`# Model Validation Report`)
  lines.push('')
  lines.push(`**Model:** ${report.modelName}`)
  if (report.fileSize) {
    lines.push(`**File Size:** ${formatBytes(report.fileSize)}`)
  }
  lines.push(`**Generated:** ${new Date(report.timestamp).toLocaleString()}`)
  lines.push('')

  // Summary
  lines.push(`## Summary`)
  lines.push('')
  lines.push(`| Metric | Value |`)
  lines.push(`|--------|-------|`)
  lines.push(`| Health Score | ${report.summary.healthPercentage}% |`)
  lines.push(`| Total Checks | ${report.summary.totalChecks} |`)
  lines.push(`| Passed | ${report.summary.passed} |`)
  lines.push(`| Failed | ${report.summary.failed} |`)
  lines.push(`| Warnings | ${report.summary.warnings} |`)
  lines.push('')

  // Model Info
  if (report.modelInfo) {
    lines.push(`## Model Information`)
    lines.push('')
    lines.push(`### Geometry`)
    lines.push(`- **Vertices:** ${formatNumber(report.modelInfo.vertexCount)}`)
    lines.push(`- **Triangles:** ${formatNumber(report.modelInfo.triangleCount)}`)
    lines.push(`- **Meshes:** ${report.modelInfo.meshCount}`)
    lines.push('')
    lines.push(`### Dimensions`)
    lines.push(`- **Width (X):** ${report.modelInfo.dimensions.width.toFixed(3)}`)
    lines.push(`- **Height (Y):** ${report.modelInfo.dimensions.height.toFixed(3)}`)
    lines.push(`- **Depth (Z):** ${report.modelInfo.dimensions.depth.toFixed(3)}`)
    lines.push('')
    if (report.modelInfo.hasSkeleton) {
      lines.push(`### Skeleton`)
      lines.push(`- **Bones:** ${report.modelInfo.boneCount}`)
      if (report.modelInfo.rigType) {
        lines.push(`- **Rig Type:** ${report.modelInfo.rigType}`)
      }
      lines.push('')
    }
    lines.push(`### Materials`)
    lines.push(`- **Count:** ${report.modelInfo.materialCount}`)
    if (report.modelInfo.materials.length > 0) {
      report.modelInfo.materials.forEach((mat) => {
        lines.push(`- ${mat.name} (${mat.type})`)
      })
    }
    lines.push('')
  }

  // Failed Checks
  const failedChecks = report.checks.filter((c) => !c.passed && c.severity === 'error')
  if (failedChecks.length > 0) {
    lines.push(`## Failed Checks (${failedChecks.length})`)
    lines.push('')
    failedChecks.forEach((check) => {
      lines.push(`### ❌ ${check.name}`)
      lines.push('')
      lines.push(`**Status:** FAILED`)
      lines.push(`**Message:** ${check.message}`)
      if (check.deviationAngleDegrees !== undefined) {
        lines.push(`**Deviation:** ${check.deviationAngleDegrees.toFixed(1)}°`)
      }
      if (check.measuredValue) {
        lines.push(`**Measured:** \`${formatValue(check.measuredValue)}\``)
      }
      if (check.expectedValue) {
        lines.push(`**Expected:** \`${formatValue(check.expectedValue)}\``)
      }
      if (check.correctiveTransform) {
        lines.push('')
        lines.push(`**Recommended Fix:**`)
        if (check.correctiveTransform.type === 'rotate') {
          lines.push(`- Rotate ${check.correctiveTransform.angleDegrees}° around ${check.correctiveTransform.axis.toUpperCase()}-axis`)
        } else if (check.correctiveTransform.type === 'translate') {
          lines.push(`- Translate by (${check.correctiveTransform.x.toFixed(3)}, ${check.correctiveTransform.y.toFixed(3)}, ${check.correctiveTransform.z.toFixed(3)})`)
        } else if (check.correctiveTransform.type === 'scale') {
          lines.push(`- Scale by (${check.correctiveTransform.x}, ${check.correctiveTransform.y}, ${check.correctiveTransform.z})`)
        }
      }
      lines.push('')
    })
  }

  // Warnings
  const warningChecks = report.checks.filter((c) => !c.passed && c.severity === 'warning')
  if (warningChecks.length > 0) {
    lines.push(`## Warnings (${warningChecks.length})`)
    lines.push('')
    warningChecks.forEach((check) => {
      lines.push(`### ⚠️ ${check.name}`)
      lines.push('')
      lines.push(`**Message:** ${check.message}`)
      if (check.measuredValue) {
        lines.push(`**Measured:** \`${formatValue(check.measuredValue)}\``)
      }
      lines.push('')
    })
  }

  // Passed Checks
  const passedChecks = report.checks.filter((c) => c.passed)
  if (passedChecks.length > 0) {
    lines.push(`## Passed Checks (${passedChecks.length})`)
    lines.push('')
    passedChecks.forEach((check) => {
      lines.push(`- ✅ **${check.name}**: ${check.message}`)
    })
    lines.push('')
  }

  // Footer
  lines.push(`---`)
  lines.push(`*cf-kernel Model Validation Report*`)
  lines.push(`*Convention: Y-up, -Z forward, X-right (Right-handed)*`)

  return lines.join('\n')
}

export function exportAsText(report: ValidationReport): string {
  const lines: string[] = []
  const divider = '═'.repeat(60)
  const subDivider = '─'.repeat(60)

  // Header
  lines.push(divider)
  lines.push('MODEL VALIDATION REPORT')
  lines.push(divider)
  lines.push('')
  lines.push(`Model:     ${report.modelName}`)
  if (report.fileSize) {
    lines.push(`File Size: ${formatBytes(report.fileSize)}`)
  }
  lines.push(`Generated: ${new Date(report.timestamp).toLocaleString()}`)
  lines.push('')

  // Summary
  lines.push(subDivider)
  lines.push('SUMMARY')
  lines.push(subDivider)
  lines.push('')
  lines.push(`Health Score:  ${report.summary.healthPercentage}%`)
  lines.push(`Total Checks:  ${report.summary.totalChecks}`)
  lines.push(`Passed:        ${report.summary.passed}`)
  lines.push(`Failed:        ${report.summary.failed}`)
  lines.push(`Warnings:      ${report.summary.warnings}`)
  lines.push('')

  // Model Info
  if (report.modelInfo) {
    lines.push(subDivider)
    lines.push('MODEL INFORMATION')
    lines.push(subDivider)
    lines.push('')
    lines.push(`Vertices:   ${formatNumber(report.modelInfo.vertexCount)}`)
    lines.push(`Triangles:  ${formatNumber(report.modelInfo.triangleCount)}`)
    lines.push(`Meshes:     ${report.modelInfo.meshCount}`)
    lines.push(`Materials:  ${report.modelInfo.materialCount}`)
    lines.push('')
    lines.push(`Dimensions:`)
    lines.push(`  Width (X):  ${report.modelInfo.dimensions.width.toFixed(3)}`)
    lines.push(`  Height (Y): ${report.modelInfo.dimensions.height.toFixed(3)}`)
    lines.push(`  Depth (Z):  ${report.modelInfo.dimensions.depth.toFixed(3)}`)
    if (report.modelInfo.hasSkeleton) {
      lines.push('')
      lines.push(`Skeleton:`)
      lines.push(`  Bones:     ${report.modelInfo.boneCount}`)
      if (report.modelInfo.rigType) {
        lines.push(`  Rig Type:  ${report.modelInfo.rigType}`)
      }
    }
    lines.push('')
  }

  // Failed Checks
  const failedChecks = report.checks.filter((c) => !c.passed && c.severity === 'error')
  if (failedChecks.length > 0) {
    lines.push(subDivider)
    lines.push(`FAILED CHECKS (${failedChecks.length})`)
    lines.push(subDivider)
    lines.push('')
    failedChecks.forEach((check, index) => {
      lines.push(`[${index + 1}] ${check.name}`)
      lines.push(`    Status: FAILED`)
      lines.push(`    ${check.message}`)
      if (check.deviationAngleDegrees !== undefined) {
        lines.push(`    Deviation: ${check.deviationAngleDegrees.toFixed(1)}°`)
      }
      if (check.correctiveTransform) {
        lines.push(`    Fix: ${formatCorrectiveTransform(check.correctiveTransform)}`)
      }
      lines.push('')
    })
  }

  // Warnings
  const warningChecks = report.checks.filter((c) => !c.passed && c.severity === 'warning')
  if (warningChecks.length > 0) {
    lines.push(subDivider)
    lines.push(`WARNINGS (${warningChecks.length})`)
    lines.push(subDivider)
    lines.push('')
    warningChecks.forEach((check, index) => {
      lines.push(`[${index + 1}] ${check.name}`)
      lines.push(`    ${check.message}`)
      lines.push('')
    })
  }

  // Passed Checks
  const passedChecks = report.checks.filter((c) => c.passed)
  if (passedChecks.length > 0) {
    lines.push(subDivider)
    lines.push(`PASSED CHECKS (${passedChecks.length})`)
    lines.push(subDivider)
    lines.push('')
    passedChecks.forEach((check) => {
      lines.push(`[✓] ${check.name}`)
    })
    lines.push('')
  }

  // Footer
  lines.push(divider)
  lines.push('cf-kernel Model Validation Report')
  lines.push('Convention: Y-up, -Z forward, X-right (Right-handed)')
  lines.push(divider)

  return lines.join('\n')
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatNumber(num: number): string {
  return num.toLocaleString()
}

function formatValue(value: unknown): string {
  if (typeof value === 'object' && value !== null && 'x' in value) {
    const v = value as { x: string | number; y: string | number; z: string | number }
    return `(${v.x}, ${v.y}, ${v.z})`
  }
  return JSON.stringify(value)
}

function formatCorrectiveTransform(transform: NonNullable<ValidationCheckResult['correctiveTransform']>): string {
  if (transform.type === 'rotate') {
    return `Rotate ${transform.angleDegrees}° around ${transform.axis.toUpperCase()}-axis`
  }
  if (transform.type === 'translate') {
    return `Translate (${transform.x.toFixed(3)}, ${transform.y.toFixed(3)}, ${transform.z.toFixed(3)})`
  }
  if (transform.type === 'scale') {
    return `Scale (${transform.x}, ${transform.y}, ${transform.z})`
  }
  return ''
}

export function downloadReport(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
