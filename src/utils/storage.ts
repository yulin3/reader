const STORAGE_KEYS = {
  COMICS: 'comic-reader:comics',
  PROGRESS: 'comic-reader:progress',
  HISTORY: 'comic-reader:history',
  SETTINGS: 'comic-reader:settings',
  THEME: 'comic-reader:theme'
} as const

// 检查 localStorage 已使用空间（估算）
const getStorageSize = (): number => {
  let total = 0
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length
    }
  }
  return total
}

// 尝试清理非关键数据以释放空间
const tryFreeSpace = (): void => {
  try {
    // 优先清理历史记录（可以重新生成）
    localStorage.removeItem(STORAGE_KEYS.HISTORY)
    console.log('Cleared history to free storage space')
  } catch {
    // 忽略清理错误
  }
}

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },

  set<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value)
      const estimatedSize = serialized.length
      
      // 检查是否可能超出配额（通常 localStorage 限制为 5-10MB）
      const currentSize = getStorageSize()
      const maxSize = 5 * 1024 * 1024 // 5MB 安全阈值
      
      if (currentSize + estimatedSize > maxSize) {
        console.warn(`Storage quota warning: Estimated size ${estimatedSize} bytes may exceed quota`)
        // 尝试清理一些空间
        try {
          // 移除旧的当前键数据（如果存在）
          localStorage.removeItem(key)
          // 尝试清理非关键数据
          tryFreeSpace()
        } catch {
          // 忽略清理错误
        }
      }
      
      localStorage.setItem(key, serialized)
      return true
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded. Attempting to free space...')
        // 尝试清理空间
        try {
          // 移除当前键的旧数据
          localStorage.removeItem(key)
          // 尝试清理非关键数据
          tryFreeSpace()
          // 再次尝试存储
          localStorage.setItem(key, JSON.stringify(value))
          return true
        } catch (retryError) {
          console.error('Failed to save to localStorage after cleanup:', retryError)
          return false
        }
      }
      console.error('Failed to save to localStorage:', error)
      return false
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key)
  },

  clear(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }
}

export { STORAGE_KEYS }