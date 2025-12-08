import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  multiline?: boolean
  rows?: number
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, error, className = '', multiline, rows = 4, ...props }, ref) => {
    const Component = multiline ? 'textarea' : 'input'
    const textareaProps = multiline ? { rows } : {}

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <Component
          ref={ref as any}
          className={`input-field ${error ? 'border-red-300 focus:ring-red-500' : ''} ${className}`}
          {...(textareaProps as any)}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

