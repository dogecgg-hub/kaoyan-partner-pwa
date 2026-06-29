const CHINA_TIME_ZONE = 'Asia/Shanghai'

const parseISODate = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

export const toISO = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const todayISO = () => {
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: CHINA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return `${value('year')}-${value('month')}-${value('day')}`
}

export const formatChinaDate = (iso: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    timeZone: CHINA_TIME_ZONE,
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date(`${iso}T00:00:00+08:00`))

export const daysBetween = (fromISO: string, toISODate = todayISO()) => {
  const from = parseISODate(fromISO).getTime()
  const to = parseISODate(toISODate).getTime()
  return Math.ceil((to - from) / 86_400_000)
}

export const weekDays = (anchorISO = todayISO()) => {
  const anchor = parseISODate(anchorISO)
  const day = anchor.getUTCDay() || 7
  const monday = new Date(anchor)
  monday.setUTCDate(anchor.getUTCDate() - day + 1)
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday)
    date.setUTCDate(monday.getUTCDate() + index)
    return {
      iso: toISO(date),
      label: ['一', '二', '三', '四', '五', '六', '日'][index],
      day: date.getUTCDate(),
    }
  })
}

export const lastNDays = (count: number, anchorISO = todayISO()) => {
  const anchor = parseISODate(anchorISO)
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(anchor)
    date.setUTCDate(anchor.getUTCDate() - (count - 1 - index))
    return toISO(date)
  })
}

export const timeAgo = (iso: string) => {
  const delta = Date.now() - new Date(iso).getTime()
  const minutes = Math.max(1, Math.floor(delta / 60_000))
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  return `${Math.floor(hours / 24)} 天前`
}
