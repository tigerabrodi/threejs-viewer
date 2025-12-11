interface StatusBadgeProps {
  status: 'pass' | 'fail' | 'warn'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    pass: { text: 'PASS', className: 'status-badge-pass' },
    fail: { text: 'FAIL', className: 'status-badge-fail' },
    warn: { text: 'WARN', className: 'status-badge-warn' },
  }[status]

  return <span className={`status-badge ${config.className}`}>{config.text}</span>
}
