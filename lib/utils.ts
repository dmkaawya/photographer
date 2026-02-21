import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'LKR') {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function generateInvoiceNumber() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 9000) + 1000
  return `SP-${year}${month}-${random}`
}

export function generateWhatsAppMessage({
  name,
  packageName,
  eventDate,
  locationLink,
  invoiceNumber,
}: {
  name: string
  packageName: string
  eventDate: string
  locationLink: string
  invoiceNumber: string
}) {
  const date = new Date(eventDate).toLocaleDateString('en-LK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return encodeURIComponent(
    `Hello Sadeepa Photography! 📸\n\n` +
    `I'd like to book a photography session.\n\n` +
    `*Invoice #:* ${invoiceNumber}\n` +
    `*Name:* ${name}\n` +
    `*Package:* ${packageName}\n` +
    `*Event Date:* ${date}\n` +
    `*Location:* ${locationLink}\n\n` +
    `Please confirm my booking. Thank you! 🙏`
  )
}
