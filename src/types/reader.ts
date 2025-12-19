export type ReadingProgress = {
  comicId: string
  chapterName: string
  pageIndex: number
  pageName: string
  lastReadTime: number
}

export type ReaderSettings = {
  backgroundColor: string
  brightness: number
  autoTurnPage: boolean
  autoTurnInterval: number
}

export type ReadingHistory = {
  comicId: string
  title: string
  chapterName: string
  pageIndex: number
  lastReadTime: number
}