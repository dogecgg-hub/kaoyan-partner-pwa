import { create } from 'zustand'
import type {
  AppData,
  CheckIn,
  Message,
  MessageType,
  PomodoroSession,
  Review,
  Subject,
  Task,
  TaskStatus,
} from '../types/domain'
import { initialData } from '../data/mock'
import { clearData, loadData, saveData } from '../services/storage'
import { dataMode, supabaseService } from '../services/supabase'
import { todayISO } from '../utils/date'

type TaskInput = Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'completedAt'>

interface AppStore extends AppData {
  dataMode: 'localStorage' | 'supabase'
  syncStatus: 'idle' | 'syncing' | 'ready' | 'error'
  syncError?: string
  hydrateRemoteData: () => Promise<void>
  login: (email: string, password: string) => boolean
  logout: () => void
  resetAll: () => void
  addTask: (task: TaskInput) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  setTaskStatus: (id: string, status: TaskStatus) => void
  addCheckIn: (payload: Omit<CheckIn, 'id' | 'userId' | 'createdAt'>) => void
  sendMessage: (content: string, type?: MessageType, relatedTaskId?: string) => void
  markMessageRead: (id: string) => void
  markAllRead: () => void
  addReview: (payload: Pick<Review, 'score' | 'tags' | 'comment'>) => void
  addPomodoro: (payload: Pick<PomodoroSession, 'taskId' | 'subject' | 'durationMinutes'>) => void
}

const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`
const persisted = typeof window === 'undefined' ? undefined : loadData()

const persistSnapshot = (data: AppData) =>
  saveData({
    currentUserId: data.currentUserId,
    users: data.users,
    tasks: data.tasks,
    checkIns: data.checkIns,
    messages: data.messages,
    reviews: data.reviews,
    pomodoros: data.pomodoros,
  })

const commit = (set: (fn: (state: AppStore) => Partial<AppStore>) => void, fn: (state: AppStore) => Partial<AppStore>) =>
  set((state) => {
    const patch = fn(state)
    const next = { ...state, ...patch }
    persistSnapshot(next)
    return patch
  })

const runRemote = async (operation: () => Promise<unknown>) => {
  if (dataMode !== 'supabase') return
  try {
    await operation()
  } catch (error) {
    console.warn('Supabase sync failed', error)
  }
}

export const useAppStore = create<AppStore>((set) => ({
  ...initialData,
  ...persisted,
  dataMode,
  syncStatus: dataMode === 'supabase' ? 'idle' : 'ready',

  hydrateRemoteData: async () => {
    if (dataMode !== 'supabase') return
    set({ syncStatus: 'syncing', syncError: undefined })
    try {
      const remote = await supabaseService.getAllData()
      const hasRemoteSeed = remote.users.length > 0
      const next = hasRemoteSeed
        ? remote
        : {
            ...initialData,
            currentUserId: useAppStore.getState().currentUserId,
          }
      if (!hasRemoteSeed) await supabaseService.seedData(next)
      persistSnapshot(next)
      set({ ...next, syncStatus: 'ready', syncError: undefined })
    } catch (error) {
      set({
        syncStatus: 'error',
        syncError: error instanceof Error ? error.message : 'Supabase 同步失败，已切换为本地可用模式。',
      })
    }
  },

  login: (email, password) => {
    const normalized = email.trim().toLowerCase()
    const state = useAppStore.getState()
    const user = state.users.find((item) => item.email.toLowerCase() === normalized && item.password === password)
    if (!user) return false
    commit(set, () => ({ currentUserId: user.id }))
    return true
  },

  logout: () => commit(set, () => ({ currentUserId: undefined })),

  resetAll: () => {
    clearData()
    set({ ...initialData, currentUserId: undefined })
  },

  addTask: (task) =>
    commit(set, (state) => {
      if (!state.currentUserId) return {}
      const now = new Date().toISOString()
      const nextTask = {
        ...task,
        id: createId('task'),
        userId: state.currentUserId,
        createdAt: now,
        updatedAt: now,
        completedAt: task.status === '已完成' ? now : undefined,
      }
      runRemote(() => supabaseService.upsertTask(nextTask))
      return {
        tasks: [nextTask, ...state.tasks],
      }
    }),

  updateTask: (id, patch) =>
    commit(set, (state) => {
      let nextTask: Task | undefined
      const tasks = state.tasks.map((task) => {
        if (task.id !== id) return task
        nextTask = { ...task, ...patch, updatedAt: new Date().toISOString() }
        return nextTask
      })
      if (nextTask) {
        const taskToSync = nextTask
        runRemote(() => supabaseService.upsertTask(taskToSync))
      }
      return { tasks }
    }),

  deleteTask: (id) =>
    commit(set, (state) => {
      runRemote(() => supabaseService.deleteTask(id))
      return { tasks: state.tasks.filter((task) => task.id !== id) }
    }),

  setTaskStatus: (id, status) =>
    commit(set, (state) => {
      const now = new Date().toISOString()
      let nextTask: Task | undefined
      const tasks = state.tasks.map((task) => {
        if (task.id !== id) return task
        nextTask = {
          ...task,
          status,
          actualMinutes: status === '已完成' ? task.actualMinutes || task.estimatedMinutes : task.actualMinutes,
          completedAt: status === '已完成' ? now : undefined,
          updatedAt: now,
        }
        return nextTask
      })
      if (nextTask) {
        const taskToSync = nextTask
        runRemote(() => supabaseService.upsertTask(taskToSync))
      }
      return {
        tasks,
      }
    }),

  addCheckIn: (payload) =>
    commit(set, (state) => {
      if (!state.currentUserId) return {}
      const checkIn = {
        ...payload,
        id: createId('check'),
        userId: state.currentUserId,
        createdAt: new Date().toISOString(),
      }
      runRemote(() => supabaseService.addCheckIn(checkIn))
      return {
        checkIns: [checkIn, ...state.checkIns],
      }
    }),

  sendMessage: (content, type = '鼓励消息', relatedTaskId) =>
    commit(set, (state) => {
      const user = state.users.find((item) => item.id === state.currentUserId)
      if (!user) return {}
      const message: Message = {
        id: createId('msg'),
        fromUserId: user.id,
        toUserId: user.partnerId,
        type,
        content,
        relatedTaskId,
        read: false,
        createdAt: new Date().toISOString(),
      }
      runRemote(() => supabaseService.addMessage(message))
      return { messages: [message, ...state.messages] }
    }),

  markMessageRead: (id) =>
    commit(set, (state) => {
      runRemote(() => supabaseService.markMessageRead(id))
      return {
        messages: state.messages.map((message) => (message.id === id ? { ...message, read: true } : message)),
      }
    }),

  markAllRead: () =>
    commit(set, (state) => {
      if (state.currentUserId) runRemote(() => supabaseService.markAllMessagesRead(state.currentUserId!))
      return {
        messages: state.messages.map((message) =>
          message.toUserId === state.currentUserId ? { ...message, read: true } : message,
        ),
      }
    }),

  addReview: (payload) =>
    commit(set, (state) => {
      const user = state.users.find((item) => item.id === state.currentUserId)
      if (!user) return {}
      const review: Review = {
        ...payload,
        id: createId('review'),
        fromUserId: user.id,
        toUserId: user.partnerId,
        date: todayISO(),
        createdAt: new Date().toISOString(),
      }
      runRemote(() => supabaseService.addReview(review))
      return { reviews: [review, ...state.reviews] }
    }),

  addPomodoro: (payload) =>
    commit(set, (state) => {
      if (!state.currentUserId) return {}
      const end = new Date()
      const start = new Date(end.getTime() - payload.durationMinutes * 60_000)
      const session: PomodoroSession = {
        id: createId('pomo'),
        userId: state.currentUserId,
        taskId: payload.taskId,
        subject: payload.subject as Subject,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        durationMinutes: payload.durationMinutes,
        completed: true,
        createdAt: end.toISOString(),
      }
      const tasks = payload.taskId
        ? state.tasks.map((task) =>
            task.id === payload.taskId
              ? { ...task, actualMinutes: task.actualMinutes + payload.durationMinutes, updatedAt: end.toISOString() }
              : task,
          )
        : state.tasks
      runRemote(async () => {
        await supabaseService.addPomodoro(session)
        const changedTask = payload.taskId ? tasks.find((task) => task.id === payload.taskId) : undefined
        if (changedTask) await supabaseService.upsertTask(changedTask)
      })
      return { pomodoros: [session, ...state.pomodoros], tasks }
    }),
}))

export const selectCurrentUser = (state: AppStore) =>
  state.users.find((user) => user.id === state.currentUserId)

export const selectPartner = (state: AppStore) => {
  const current = selectCurrentUser(state)
  return current ? state.users.find((user) => user.id === current.partnerId) : undefined
}
