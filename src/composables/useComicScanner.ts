import { ref } from 'vue'
import { useComicStore } from '@/stores/comic'
import { scanDirectory, selectDirectory } from '@/utils/fileScanner'
import { getDataDirectoryHandle, saveDataDirectoryHandle } from '@/utils/directoryHandleStorage'

export const useComicScanner = () => {
  const comicStore = useComicStore()
  const isScanning = ref(false)
  const error = ref<string | null>(null)

  const scanFromDirectory = async () => {
    isScanning.value = true
    error.value = null

    try {
      const dirHandle = await selectDirectory()
      if (!dirHandle) {
        isScanning.value = false
        return
      }

      // 如果还没有保存 data 目录句柄，自动保存当前选择的目录
      const existingDataHandle = await getDataDirectoryHandle()
      if (!existingDataHandle) {
        try {
          await saveDataDirectoryHandle(dirHandle)
          console.log('已自动保存为 data 目录句柄')
        } catch (err) {
          console.warn('保存 data 目录句柄失败:', err)
        }
      }

      console.log('开始扫描目录...')
      const comics = await scanDirectory(dirHandle)
      console.log(`扫描完成，找到 ${comics.length} 个漫画`)
      
      if (comics.length === 0) {
        error.value = '未找到任何漫画。请确保选择的目录包含漫画文件夹，每个漫画文件夹包含章节目录，每个章节目录包含图片文件。'
      } else {
        comicStore.addComics(comics)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '扫描失败'
      console.error('Failed to scan directory:', err)
    } finally {
      isScanning.value = false
    }
  }

  /**
   * 自动扫描 data 文件夹
   * 只在已有保存的目录句柄时执行，避免安全错误
   */
  const scanDataFolder = async (): Promise<boolean> => {
    try {
      // 尝试获取已保存的 data 目录句柄
      const dataDirHandle = await getDataDirectoryHandle()
      
      // 如果没有保存的句柄，不自动弹出文件选择器（需要用户手势）
      if (!dataDirHandle) {
        console.log('未找到保存的 data 目录句柄，等待用户手动选择文件夹')
        return false
      }

      console.log('开始自动扫描 data 文件夹...')
      const comics = await scanDirectory(dataDirHandle)
      console.log(`data 文件夹扫描完成，找到 ${comics.length} 个漫画`)
      
      if (comics.length > 0) {
        comicStore.addComics(comics)
        return true
      }
      
      return false
    } catch (err) {
      console.error('扫描 data 文件夹失败:', err)
      return false
    }
  }

  return {
    isScanning,
    error,
    scanFromDirectory,
    scanDataFolder
  }
}