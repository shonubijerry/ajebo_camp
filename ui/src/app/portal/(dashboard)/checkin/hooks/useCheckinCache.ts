import { useCallback, useEffect, useRef, useState } from 'react'
import { OfflineCampite } from '@/interfaces'
import { fetchClient } from '@/lib/api/client'

const DB_NAME = 'checkin-cache'
const DB_VERSION = 1
const CAMPITES_STORE = 'campites'
const QUEUE_STORE = 'checkin_queue'

export type QueueRecord = { id: string; checkin_at: string }

const normalizeReg = (value: string) => value.trim().toUpperCase()

export function useCheckinCache() {
  const [cacheReady, setCacheReady] = useState(false)
  const [cachedCount, setCachedCount] = useState(0)
  const [queueCount, setQueueCount] = useState(0)
  const [isCaching, setIsCaching] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [campId, setCampId] = useState('')

  const dbRef = useRef<IDBDatabase | null>(null)
  const campiteByRegRef = useRef<Map<string, OfflineCampite>>(new Map())
  const campitesByUserRef = useRef<Map<string, OfflineCampite[]>>(new Map())

  const idbRequest = useCallback(<T>(request: IDBRequest<T>) => {
    return new Promise<T>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }, [])

  const openDb = useCallback(async () => {
    if (dbRef.current) return dbRef.current

    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(CAMPITES_STORE)) {
          const store = db.createObjectStore(CAMPITES_STORE, { keyPath: 'id' })
          store.createIndex('registration_no', 'registration_no', {
            unique: false,
          })
          store.createIndex('user_id', 'user_id', { unique: false })
        }
        if (!db.objectStoreNames.contains(QUEUE_STORE)) {
          db.createObjectStore(QUEUE_STORE, { keyPath: 'id' })
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })

    dbRef.current = db
    return db
  }, [])

  const getAllFromStore = useCallback(
    async <T>(storeName: string): Promise<T[]> => {
      const db = await openDb()
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const req = store.getAll()
      return idbRequest<T[]>(req)
    },
    [idbRequest, openDb],
  )

  const getStoreCount = useCallback(
    async (storeName: string) => {
      const db = await openDb()
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const req = store.getAllKeys()
      const keys = await idbRequest<IDBValidKey[]>(req)
      return keys.length
    },
    [idbRequest, openDb],
  )

  const clearStore = useCallback(
    async (storeName: string) => {
      const db = await openDb()
      const tx = db.transaction(storeName, 'readwrite')
      tx.objectStore(storeName).clear()
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
    },
    [openDb],
  )

  const putMany = useCallback(
    async <T extends { id: string }>(storeName: string, items: T[]) => {
      if (!items.length) return
      const db = await openDb()
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      items.forEach((item) => store.put(item))
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
    },
    [openDb],
  )

  const buildMaps = useCallback((items: OfflineCampite[]) => {
    const byReg = new Map<string, OfflineCampite>()
    const byUser = new Map<string, OfflineCampite[]>()

    items.forEach((c) => {
      if (c.registration_no) {
        byReg.set(normalizeReg(String(c.registration_no)), c)
      }
      if (c.user_id) {
        const list = byUser.get(c.user_id) ?? []
        list.push(c)
        byUser.set(c.user_id, list)
      }
    })

    campiteByRegRef.current = byReg
    campitesByUserRef.current = byUser
  }, [])

  const resetMaps = useCallback(() => {
    campiteByRegRef.current = new Map()
    campitesByUserRef.current = new Map()
  }, [])

  const updateMapsForItems = useCallback((items: OfflineCampite[]) => {
    items.forEach((c) => {
      if (c.registration_no) {
        campiteByRegRef.current.set(normalizeReg(String(c.registration_no)), c)
      }
      if (c.user_id) {
        const list = campitesByUserRef.current.get(c.user_id) ?? []
        const next = list.filter((item) => item.id !== c.id)
        next.push(c)
        campitesByUserRef.current.set(c.user_id, next)
      }
    })
  }, [])

  const hydrateFromDb = useCallback(async () => {
    const items = await getAllFromStore<OfflineCampite>(CAMPITES_STORE)
    buildMaps(items)
    setCachedCount(items.length)
    setCacheReady(items.length > 0)

    const count = await getStoreCount(QUEUE_STORE)
    setQueueCount(count)
  }, [buildMaps, getAllFromStore, getStoreCount])

  useEffect(() => {
    openDb()
      .then(hydrateFromDb)
      .catch(() => {
        setCacheReady(false)
      })
  }, [hydrateFromDb, openDb])

  const lookupFromCache = useCallback((code: string): OfflineCampite[] => {
    const isBulk = code.startsWith('BULK-')
    const reg = normalizeReg(isBulk ? (code.split('-')[1] ?? '') : code)
    const match = campiteByRegRef.current.get(reg)
    if (!match) return []
    if (!isBulk) return [match]
    return campitesByUserRef.current.get(match.user_id) ?? []
  }, [])

  const startCaching = useCallback(async () => {
    setIsCaching(true)

    try {
      const pageSize = 1000
      let page = 1
      const all: OfflineCampite[] = []

      while (true) {
        const res = await fetchClient.GET('/api/v1/campites/offline', {
          params: {
            query: {
              page,
              per_page: pageSize,
              ...(campId ? { camp_id: campId } : {}),
            },
          },
        })

        const rows = res.data?.data?.data ?? []
        if (rows.length === 0) break

        all.push(...rows)
        if (rows.length < pageSize) break
        page += 1
      }

      await clearStore(CAMPITES_STORE)
      await clearStore(QUEUE_STORE)
      await putMany(CAMPITES_STORE, all)
      buildMaps(all)
      setCachedCount(all.length)
      setQueueCount(0)
      setCacheReady(all.length > 0)
    } finally {
      setIsCaching(false)
    }
  }, [buildMaps, campId, clearStore, putMany])

  const queueCheckins = useCallback(
    async (
      ids: string[],
      updatedCampites: OfflineCampite[],
      checkinAt: string,
    ) => {
      await putMany(CAMPITES_STORE, updatedCampites)
      updateMapsForItems(updatedCampites)

      const queueRecords: QueueRecord[] = ids.map((id) => ({
        id,
        checkin_at: checkinAt,
      }))
      await putMany(QUEUE_STORE, queueRecords)
      const count = await getStoreCount(QUEUE_STORE)
      setQueueCount(count)
    },
    [getStoreCount, putMany, updateMapsForItems],
  )

  const syncQueue = useCallback(async () => {
    const count = await getStoreCount(QUEUE_STORE)
    if (count === 0) return

    setIsSyncing(true)
    try {
      const queued = await getAllFromStore<QueueRecord>(QUEUE_STORE)
      const ids = queued.map((q) => q.id)
      if (ids.length === 0) return

      await fetchClient.PATCH('/api/v1/campites/bulk-update', {
        body: {
          ids,
          data: { checkin_at: new Date().toISOString() },
        },
      })

      await clearStore(QUEUE_STORE)
      setQueueCount(0)
    } finally {
      setIsSyncing(false)
    }
  }, [clearStore, getAllFromStore, getStoreCount])

  const clearCache = useCallback(async () => {
    setIsClearing(true)
    try {
      await clearStore(CAMPITES_STORE)
      await clearStore(QUEUE_STORE)
      resetMaps()
      setCachedCount(0)
      setQueueCount(0)
      setCacheReady(false)
    } finally {
      setIsClearing(false)
    }
  }, [clearStore, resetMaps])

  return {
    cacheReady,
    cachedCount,
    queueCount,
    isCaching,
    isSyncing,
    isClearing,
    campId,
    setCampId,
    startCaching,
    syncQueue,
    clearCache,
    lookupFromCache,
    queueCheckins,
  }
}
