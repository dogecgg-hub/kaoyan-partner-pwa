import type { CheckIn, Message, PomodoroSession, Review, Task, User } from '../types/domain'
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
    return requireSupabase().from('check_ins').insert(checkIn).select().single<CheckIn>()
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
    return requireSupabase().from('messages').insert(message).select().single<Message>()
  },

  async addReview(review: Review) {
    return requireSupabase().from('reviews').insert(review).select().single<Review>()
  },

  async addPomodoro(session: PomodoroSession) {
    return requireSupabase().from('pomodoro_sessions').insert(session).select().single<PomodoroSession>()
  },
}
