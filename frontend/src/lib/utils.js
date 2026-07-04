import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date, options = {}) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(new Date(date))
}

export function formatDateRelative(date) {
  const now = new Date()
  const d = new Date(date)
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return formatDate(date)
}

export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getInitials(name) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function truncate(str, len = 100) {
  if (!str) return ''
  if (str.length <= len) return str
  return str.slice(0, len) + '...'
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function getMediaUrl(path) {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

export function getGradeColor(score) {
  if (score >= 90) return 'text-green-600'
  if (score >= 75) return 'text-emerald-500'
  if (score >= 60) return 'text-amber-500'
  return 'text-red-500'
}

export function getGradeLabel(score) {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 60) return 'C'
  return 'D'
}

export function getGradeBg(score) {
  if (score >= 90) return 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
  if (score >= 75) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
  if (score >= 60) return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
  return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
}

let idCounter = 0
export function generateId(prefix = 'a11y') {
  return `${prefix}-${++idCounter}`
}

export function calculateProfileCompletion(profile) {
  if (!profile) return 0
  const fields = [
    profile.fullName,
    profile.bio,
    profile.skills?.length > 0,
    profile.experienceYears > 0,
    profile.resumeUrl,
    profile.avatarUrl,
  ]
  return Math.round((fields.filter(Boolean).length / fields.length) * 100)
}
