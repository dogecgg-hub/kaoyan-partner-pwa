import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { useAppStore } from './features/useAppStore'
import { Login } from './pages/Login'

const routerBaseName = import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL

const Calendar = lazy(() => import('./pages/Calendar').then((module) => ({ default: module.Calendar })))
const CheckIn = lazy(() => import('./pages/CheckIn').then((module) => ({ default: module.CheckIn })))
const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })))
const Notifications = lazy(() =>
  import('./pages/Notifications').then((module) => ({ default: module.Notifications })),
)
const Partner = lazy(() => import('./pages/Partner').then((module) => ({ default: module.Partner })))
const Pomodoro = lazy(() => import('./pages/Pomodoro').then((module) => ({ default: module.Pomodoro })))
const Profile = lazy(() => import('./pages/Profile').then((module) => ({ default: module.Profile })))
const Stats = lazy(() => import('./pages/Stats').then((module) => ({ default: module.Stats })))
const Tasks = lazy(() => import('./pages/Tasks').then((module) => ({ default: module.Tasks })))

const RequireAuth = () => {
  const currentUserId = useAppStore((state) => state.currentUserId)
  if (!currentUserId) return <Navigate to="/login" replace />
  return <AppShell />
}

function App() {
  const hydrateRemoteData = useAppStore((state) => state.hydrateRemoteData)

  useEffect(() => {
    hydrateRemoteData()
  }, [hydrateRemoteData])

  return (
    <BrowserRouter basename={routerBaseName}>
      <Suspense fallback={<div className="min-h-screen bg-page p-6 text-sm text-muted">正在加载...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route index element={<Dashboard />} />
            <Route path="/today" element={<Tasks todayOnly />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/check-in" element={<CheckIn />} />
            <Route path="/partner" element={<Partner />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
