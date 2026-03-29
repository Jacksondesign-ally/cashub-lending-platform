import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency for Namibia
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NA', {
    style: 'currency',
    currency: 'NAD',
    minimumFractionDigits: 2,
  }).format(amount)
}

// Format date
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-NA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj)
}

// Format date with time
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-NA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

// Calculate days overdue
export function calculateDaysOverdue(dueDate: string | Date): number {
  const due = new Date(dueDate)
  const today = new Date()
  const diffTime = today.getTime() - due.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Get risk level color
export function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel?.toLowerCase()) {
    case 'low':
      return 'text-green-600 bg-green-50'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50'
    case 'high':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

// Get loan status color
export function getLoanStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-50'
    case 'approved':
      return 'text-blue-600 bg-blue-50'
    case 'active':
      return 'text-green-600 bg-green-50'
    case 'completed':
      return 'text-gray-600 bg-gray-50'
    case 'defaulted':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

// Get borrower status color
export function getBorrowerStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'text-green-600 bg-green-50'
    case 'inactive':
      return 'text-gray-600 bg-gray-50'
    case 'blacklisted':
      return 'text-red-600 bg-red-50'
    case 'cleared':
      return 'text-blue-600 bg-blue-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

// Validate ID number (Namibian ID format)
export function validateNamibianID(idNumber: string): boolean {
  // Basic validation - Namibian IDs are typically 13 digits
  const regex = /^[0-9]{13}$/
  return regex.test(idNumber)
}

// Validate email
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Validate phone number (Namibian format)
export function validateNamibianPhone(phone: string): boolean {
  // Remove spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
  
  // Check for Namibian country code or local format
  const regex = /^(\+264|0)[6-7][0-9]{7}$/
  return regex.test(cleanPhone)
}

// Generate loan number
export function generateLoanNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `L-${timestamp}-${random}`
}

// Generate dispute number
export function generateDisputeNumber(): string {
  const year = new Date().getFullYear()
  const timestamp = Date.now().toString(36).toUpperCase()
  return `DS-${year}-${timestamp}`
}

// Calculate monthly payment
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  const monthlyRate = annualRate / 100 / 12
  if (monthlyRate === 0) return principal / months
  
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                 (Math.pow(1 + monthlyRate, months) - 1)
  return Math.round(payment * 100) / 100
}

// Calculate total interest
export function calculateTotalInterest(
  principal: number,
  monthlyPayment: number,
  months: number
): number {
  const totalPaid = monthlyPayment * months
  return Math.round((totalPaid - principal) * 100) / 100
}

// Download file from Supabase storage
export async function downloadFile(path: string): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(path, 3600) // 1 hour expiry
    
    if (error) throw error
    return data.signedUrl
  } catch (error) {
    console.error('Error downloading file:', error)
    throw error
  }
}

// Upload file to Supabase storage
export async function uploadFile(
  file: File,
  path: string,
  bucket: string = 'documents'
): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      })
    
    if (error) throw error
    return data.path
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
