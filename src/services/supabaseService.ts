import type { AppData, CheckIn, Message, PomodoroSession, Review, Task, User } from '../types/domain'
import { isSupabaseConfigured, supabase } from './supabaseClient'

export const dataMode = isSupabaseConfigured ? 'supabase' : 'localStorage'

const requireSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

export const supabaseService = {
  async signIn(email: string, password: string) {
    return requireSupabase().auth.signInWithPassword({ email, password })
  },

  async signUp(email: string, password: string) {
    return requireSupabase().auth.signUp({ email, password })
  },

  async signOut() {
    return requireSupabase().auth.signOut()
  },

  async getUsers() {
    return requireSupabase().from('profiles').select('*').returns<User[]>()
  },

  async getAllData() {
    const client = requireSupabase()
    const [profiles, tasks, checkIns, messages, reviews, pomodoros] = await Promise.all([
      client.from('profiles').select('*').returns<User[]>(),
      client.from('tasks').select('*').order('date', { ascending: false }).returns<Task[]>(),
      client.from('check_ins').select('*').order('createdAt', { ascending: false }).returns<CheckIn[]>(),
      client.from('messages').select('*').order('createdAt', { ascending: false }).returns<Message[]>(),
      client.from('reviews').select('*').order('createdAt', { ascending: false }).returns<Review[]>(),
      client
        .from('pomodoro_sessions')
        .select('*')
        .order('createdAt', { ascending: false })
        .returns<PomodoroSession[]>(),
    ])

    const firstError =
      profiles.error || tasks.error || checkIns.error || messages.error || reviews.error || pomodoros.error
    if (firstError) throw firstError

    return {
      users: profiles.data ?? [],
      tasks: tasks.data ?? [],
      checkIns: checkIns.data ?? [],
      messages: messages.data ?? [],
      reviews: reviews.data ?? [],
      pomodoros: pomodoros.data ?? [],
    } satisfies AppData
  },

  async seedData(data: AppData) {
    const client = requireSupabase()
    const write = async <T extends { id: string }>(table: string, rows: T[]) => {
      if (!rows.length) return
      const { error } = await client.from(table).upsert(rows)
      if (error) throw error
    }
    await write('profiles', data.users)
    await write('tasks', data.tasks)
    await write('check_ins', data.checkIns)
    await write('messages', data.messages)
    await write('reviews', data.reviews)
    await write('pomodoro_sessions', data.pomodoros)
  },

  async getTasks(userId: string, partnerId: string) {
    return requireSupabase()
      .from('tasks')
      .select('*')
      .in('userId', [userId, partnerId])
      .order('date', { ascending: false })
      .returns<Task[]>()
  },

  async upsertTask(task: Task) {
    return requireSupabase().from('tasks').upsert(task).select().single<Task>()
  },

  async deleteTask(id: string) {
    return requireSupabase().from('tasks').delete().eq('id', id)
  },

  async getCheckIns(userId: string, partnerId: string) {
    return requireSupabase()
      .from('check_ins')
      .select('*')
      .in('userId', [userId, partnerId])
      .order('createdAt', { ascending: false })
      .returns<CheckIn[]>()
  },

  async addCheckIn(checkIn: CheckIn) {
    return requireSupabase().from('check_ins').upsert(checkIn).select().single<CheckIn>()
  },

  async getMessages(userId: string) {
    return requireSupabase()
      .from('messages')
      .select('*')
      .or(`fromUserId.eq.${userId},toUserId.eq.${userId}`)
      .order('createdAt', { ascending: false })
      .returns<Message[]>()
  },

  async addMessage(message: Message) {
    return requireSupabase().from('messages').upsert(message).select().single<Message>()
  },

  async markMessageRead(id: string) {
    return requireSupabase().from('messages').update({ read: true }).eq('id', id)
  },

  async markAllMessagesRead(userId: string) {
    return requireSupabase().from('messages').update({ read: true }).eq('toUserId', userId)
  },

  async addReview(review: Review) {
    return requireSupabase().from('reviews').upsert(review).select().single<Review>()
  },

  async addPomodoro(session: PomodoroSession) {
    return requireSupabase().from('pomodoro_sessions').upsert(session).select().single<PomodoroSession>()
  },
}
