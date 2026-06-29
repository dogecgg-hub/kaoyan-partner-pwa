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
import { todayISO } from '../utils/date'

type TaskInput = Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'completedAt'>

interface AppStore extends AppData {
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

const commit = (set: (fn: (state: AppStore) => Partial<AppStore>) => void, fn: (state: AppStore) => Partial<AppStore>) =>
  set((state) => {
    const patch = fn(state)
    const next = { ...state, ...patch }
    saveData({
      currentUserId: next.currentUserId,
      users: next.users,
      tasks: next.tasks,
      checkIns: next.checkIns,
      messages: next.messages,
      reviews: next.reviews,
      pomodoros: next.pomodoros,
    })
    return patch
  })

export const useAppStore = create<AppStore>((set) => ({
  ...initialData,
  ...persisted,

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
      return {
        tasks: [
          {
            ...task,
            id: createId('task'),
            userId: state.currentUserId,
            createdAt: now,
            updatedAt: now,
            completedAt: task.status === '已完成' ? now : undefined,
          },
          ...state.tasks,
        ],
      }
    }),

  updateTask: (id, patch) =>
    commit(set, (state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...patch, updatedAt: new Date().toISOString() } : task,
      ),
    })),

  deleteTask: (id) => commit(set, (state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),

  setTaskStatus: (id, status) =>
    commit(set, (state) => {
      const now = new Date().toISOString()
      return {
        tasks: state.tasks.map((task) =>
          task.id === id
            ? {
                ...task,
                status,
                actualMinutes: status === '已完成' ? task.actualMinutes || task.estimatedMinutes : task.actualMinutes,
                completedAt: status === '已完成' ? now : undefined,
                updatedAt: now,
              }
            : task,
        ),
      }
    }),

  addCheckIn: (payload) =>
    commit(set, (state) => {
      if (!state.currentUserId) return {}
      return {
        checkIns: [
          {
            ...payload,
            id: createId('check'),
            userId: state.currentUserId,
            createdAt: new Date().toISOString(),
          },
          ...state.checkIns,
        ],
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
      return { messages: [message, ...state.messages] }
    }),

  markMessageRead: (id) =>
    commit(set, (state) => ({
      messages: state.messages.map((message) => (message.id === id ? { ...message, read: true } : message)),
    })),

  markAllRead: () =>
    commit(set, (state) => ({
      messages: state.messages.map((message) =>
        message.toUserId === state.currentUserId ? { ...message, read: true } : message,
      ),
    })),

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
      return { pomodoros: [session, ...state.pomodoros], tasks }
    }),
}))

export const selectCurrentUser = (state: AppStore) =>
  state.users.find((user) => user.id === state.currentUserId)

export const selectPartner = (state: AppStore) => {
  const current = selectCurrentUser(state)
  return current ? state.users.find((user) => user.id === current.partnerId) : undefined
}
