import { useState } from 'react'
import { TaskForm } from '../components/TaskForm'
import { TaskList } from '../components/TaskList'
import { Badge, Button, Card } from '../components/ui'
import { useAppStore } from '../features/useAppStore'
import { useSession } from '../hooks/useSession'
import { completionRate, tasksFor } from '../utils/stats'
import { todayISO, weekDays } from '../utils/date'

export const Calendar = () => {
  const { currentUser } = useSession()
  const { tasks, addTask } = useAppStore()
  const [selected, setSelected] = useState(todayISO())
  const [adding, setAdding] = useState(false)
  if (!currentUser) return null
  const days = weekDays(selected)
  const selectedTasks = tasksFor(tasks, currentUser.id, selected)

  return (
    <div className="grid gap-4">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">本周计划</h2>
          <Button variant="secondary" onClick={() => setAdding((value) => !value)}>快速新增</Button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayTasks = tasksFor(tasks, currentUser.id, day.iso)
            const active = selected === day.iso
            return (
              <button
                key={day.iso}
                onClick={() => setSelected(day.iso)}
                className={`grid min-h-24 content-start gap-2 rounded-card border p-2 text-left transition ${
                  active ? 'border-primary bg-primary-soft' : 'border-line bg-white'
                } ${day.iso === todayISO() ? 'ring-2 ring-blue-100' : ''}`}
              >
                <span className="text-xs font-semibold text-muted">周{day.label}</span>
                <span className="text-lg font-bold">{day.day}</span>
                <span className="text-[11px] text-muted">{dayTasks.length} 项</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <span className="block h-full bg-success" style={{ width: `${completionRate(dayTasks)}%` }} />
                </span>
              </button>
            )
          })}
        </div>
      </Card>
      {adding && (
        <Card>
          <TaskForm
            defaultDate={selected}
            onSubmit={(draft) => {
              addTask(draft)
              setAdding(false)
            }}
            onCancel={() => setAdding(false)}
          />
        </Card>
      )}
      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{selected} 任务</h2>
          <Badge>完成率 {completionRate(selectedTasks)}%</Badge>
        </div>
        <TaskList tasks={selectedTasks} />
      </section>
    </div>
  )
}
