import { format, formatDistanceToNow, isAfter, parseISO } from 'date-fns'

export function formatDate(date: Date | string, fmt = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy h:mm a')
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function isSameDayDeliveryAvailable(): boolean {
  const now = new Date()
  const cutoff = new Date()
  cutoff.setHours(14, 0, 0, 0)   // 2:00 PM cutoff
  return now < cutoff
}

export function getDeliverySlots(): { label: string; value: string }[] {
  const slots: { label: string; value: string }[] = []
  const now  = new Date()
  const base = new Date()
  base.setMinutes(0, 0, 0)

  for (let h = 9; h <= 20; h++) {
    const slot = new Date(base)
    slot.setHours(h)
    if (isAfter(slot, now)) {
      slots.push({
        label: `${format(slot, 'h:00 a')} – ${format(new Date(slot.getTime() + 3600000), 'h:00 a')}`,
        value: slot.toISOString(),
      })
    }
  }
  return slots
}
