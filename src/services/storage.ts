import type { AppData } from '../types/domain'

const STORAGE_KEY = 'kaoyan-partner-pwa:v1'

export const loadData = (): AppData | undefined => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AppData) : undefined
  } catch {
    return undefined
  }
}

export const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const clearData = () => {
  localStorage.removeItem(STORAGE_KEY)
}
