'use client'

import { Toaster as Sonner, type ToasterProps } from 'sonner'

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        style: {
          background: '#111111',
          border: '1px solid #2a2520',
          color: '#f5f0e8',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
