import { useMemo, useState } from 'react'
import type { Priority, Subject, Task, TaskStatus } from '../types/domain'
import { TaskForm } from '../components/TaskForm'
import { TaskList } from '../components/TaskList'
import { Button, Card, Field, inputClass } from '../components/ui'
import { useAppStore } from '../features/useAppStore'
import { useSession } from '../hooks/useSession'
import { todayISO } from '../utils/date'

export const Tasks = ({ todayOnly = false }: { todayOnly?: boolean }) => {
  const { currentUser } = useSession()
  const { tasks, addTask, updateTask } = useAppStore()
  const [editing, setEditing] = useState<Task | undefined>()
  const [showForm, setShowForm] = useState(todayOnly)
  const [date, setDate] = useState(todayISO())
  const [subject, setSubject] = useState<'全部' | Subject>('全部')
  const [status, setStatus] = useState<'全部' | TaskStatus>('全部')
  const [priority, setPriority] = useState<'全部' | Priority>('全部')

  const filtered = useMemo(() => {
    if (!currentUser) return []
    return tasks
      .filter((task) => task.userId === currentUser.id)
      .filter((task) => (todayOnly ? task.date === todayISO() : task.date === date))
      .filter((task) => subject === '全部' || task.subject === subject)
      .filter((task) => status === '全部' || task.status === status)
      .filter((task) => priority === '全部' || task.priority === priority)
      .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
  }, [currentUser, date, priority, status, subject, tasks, todayOnly])

  if (!currentUser) return null

  return (
    <div className="grid gap-4">
      <Card className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold">{todayOnly ? '今日任务' : '任务管理'}</h2>
            <p className="mt-1 text-xs text-muted">新增、编辑、删除和切换状态都会自动保存。</p>
          </div>
          <Button onClick={() => { setEditing(undefined); setShowForm((v) => !v) }}>{showForm ? '收起' : '新增'}</Button>
        </div>
        {!todayOnly && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Field label="日期"><input className={inputClass} type="date" value={date} onChange={(event) => setDate(event.target.value)} /></Field>
            <Field label="科目"><select className={inputClass} value={subject} onChange={(event) => setSubject(event.target.value as Subject | '全部')}><option>全部</option><option>数学</option><option>英语</option><option>政治</option><option>专业课</option><option>复盘</option><option>其他</option></select></Field>
            <Field label="状态"><select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value as TaskStatus | '全部')}><option>全部</option><option>未开始</option><option>进行中</option><option>已完成</option><option>已拖延</option></select></Field>
            <Field label="优先级"><select className={inputClass} value={priority} onChange={(event) => setPriority(event.target.value as Priority | '全部')}><option>全部</option><option>高</option><option>中</option><option>低</option></select></Field>
          </div>
        )}
        {showForm && (
          <TaskForm
            task={editing}
            defaultDate={todayOnly ? todayISO() : date}
            onCancel={() => { setEditing(undefined); setShowForm(false) }}
            onSubmit={(draft) => {
              if (editing) updateTask(editing.id, { ...draft, completedAt: draft.status === '已完成' ? new Date().toISOString() : undefined })
              else addTask(draft)
              setEditing(undefined)
              setShowForm(false)
            }}
          />
        )}
      </Card>
      <TaskList tasks={filtered} onEdit={(task) => { setEditing(task); setShowForm(true) }} />
    </div>
  )
}
