/**
 * 目录句柄存储工具
 * 使用 IndexedDB 保存 FileSystemDirectoryHandle 引用
 */

const DB_NAME = 'comic-reader-db'
const DB_VERSION = 1
const STORE_NAME = 'directoryHandles'

type DirectoryHandleEntry = {
  comicId: string
  handle: FileSystemDirectoryHandle
}

let db: IDBDatabase | null = null

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'comicId' })
      }
    }
  })
}

/**
 * 保存目录句柄
 */
export const saveDirectoryHandle = async (
  comicId: string,
  handle: FileSystemDirectoryHandle
): Promise<void> => {
  try {
    const database = await openDB()
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    await store.put({ comicId, handle })
  } catch (error) {
    console.error('Failed to save directory handle:', error)
    throw error
  }
}

/**
 * 获取目录句柄
 */
export const getDirectoryHandle = async (
  comicId: string
): Promise<FileSystemDirectoryHandle | null> => {
  try {
    const database = await openDB()
    const transaction = database.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(comicId)

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result as DirectoryHandleEntry | undefined
        resolve(result?.handle || null)
      }
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Failed to get directory handle:', error)
    return null
  }
}

/**
 * 删除目录句柄
 */
export const removeDirectoryHandle = async (comicId: string): Promise<void> => {
  try {
    const database = await openDB()
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    await store.delete(comicId)
  } catch (error) {
    console.error('Failed to remove directory handle:', error)
  }
}

/**
 * 获取所有保存的目录句柄
 */
export const getAllDirectoryHandles = async (): Promise<Map<string, FileSystemDirectoryHandle>> => {
  try {
    const database = await openDB()
    const transaction = database.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const results = request.result as DirectoryHandleEntry[]
        const map = new Map<string, FileSystemDirectoryHandle>()
        results.forEach((entry) => {
          map.set(entry.comicId, entry.handle)
        })
        resolve(map)
      }
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Failed to get all directory handles:', error)
    return new Map()
  }
}

/**
 * 保存 data 目录句柄（用于自动扫描）
 */
const DATA_DIRECTORY_KEY = '__data_directory__'

export const saveDataDirectoryHandle = async (
  handle: FileSystemDirectoryHandle
): Promise<void> => {
  try {
    await saveDirectoryHandle(DATA_DIRECTORY_KEY, handle)
  } catch (error) {
    console.error('Failed to save data directory handle:', error)
    throw error
  }
}

/**
 * 获取 data 目录句柄
 */
export const getDataDirectoryHandle = async (): Promise<FileSystemDirectoryHandle | null> => {
  try {
    return await getDirectoryHandle(DATA_DIRECTORY_KEY)
  } catch (error) {
    console.error('Failed to get data directory handle:', error)
    return null
  }
}
