import type { ReactNode } from 'react'
import { Button } from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  message: string | ReactNode
  title?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isProcessing?: boolean
}

export function ConfirmDialog({
  isOpen,
  message,
  title = 'Confirmation',
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isProcessing = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
        {/* Content */}
        <div className="p-6 space-y-4">
          {title && <h2 className="text-lg font-semibold text-gray-100">{title}</h2>}
          <div className="text-gray-200 text-sm">{message}</div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="secondary" onClick={onCancel} disabled={isProcessing}>
              {cancelLabel}
            </Button>
            <Button
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isProcessing}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


