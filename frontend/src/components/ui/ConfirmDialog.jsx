import { cn } from '../../lib/utils'
import Modal from './Modal'
import Button from './Button'
import { AlertTriangle, Trash2, Info } from 'lucide-react'

const icons = {
  danger: { icon: Trash2, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  const config = icons[variant] || icons.danger
  const Icon = config.icon

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center">
        <div className={cn('mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl', config.bg)}>
          <Icon className={cn('h-6 w-6', config.color)} />
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
