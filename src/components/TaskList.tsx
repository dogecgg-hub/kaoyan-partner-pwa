import { CheckCircle2, Clock3, Pencil, PlayCircle, RotateCcw, Trash2 } from 'lucide-react'
import type { Task } from '../types/domain'
import { useAppStore } from '../features/useAppStore'
import { Badge, Button, Card, Empty } from './ui'
import { minutesToHourText } from '../utils/stats'

const subjectTone: Record<string, string> = {
  数学: 'bg-blue-50 text-blue-700',
  英语: 'bg-emerald-50 text-emerald-700',
  政治: 'bg-rose-50 text-rose-700',
  专业课: 'bg-indigo-50 text-indigo-700',
  复盘: 'bg-amber-50 text-amber-700',
  其他: 'bg-slate-50 text-slate-700',
}

const statusTone: Record<string, string> = {
  未开始: 'border-line bg-slate-50 text-muted',
  进行中: 'border-blue-100 bg-blue-50 text-primary',
  已完成: 'border-green-100 bg-green-50 text-success',
  已拖延: 'border-orange-100 bg-orange-50 text-warning',
}

export const TaskList = ({
  tasks,
  editable = true,
  onEdit,
}: {
  tasks: Task[]
  editable?: boolean
  onEdit?: (task: Task) => void
}) => {
  const setTaskStatus = useAppStore((state) => state.setTaskStatus)
  const deleteTask = useAppStore((state) => state.deleteTask)

  if (!tasks.length) return <Empty>今天暂时没有任务，留一块安静时间给计划。</Empty>

  return (
    <div className="grid gap-3">
      {tasks.map((task) => (
        <Card key={task.id} className="p-3">
          <div className="flex items-start gap-3">
            <button
              className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border ${
                task.status === '已完成' ? 'border-green-200 bg-green-50 text-success' : 'border-line bg-white text-muted'
              }`}
              aria-label="切换完成状态"
              onClick={() => setTaskStatus(task.id, task.status === '已完成' ? '未开始' : '已完成')}
            >
              <CheckCircle2 size={18} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={subjectTone[task.subject]}>{task.subject}</Badge>
                <Badge className={statusTone[task.status]}>{task.status}</Badge>
                <Badge>{task.priority}优先级</Badge>
              </div>
              <h3 className={`mt-2 text-sm font-semibold leading-6 ${task.status === '已完成' ? 'text-muted line-through' : 'text-ink'}`}>
                {task.title}
              </h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                <span>{task.startTime} - {task.endTime}</span>
                <span className="inline-flex items-center gap-1"><Clock3 size={14} />{minutesToHourText(task.estimatedMinutes)}</span>
                {task.proofRequired && <span>需证明</span>}
              </p>
              {task.note && <p className="mt-2 text-xs leading-5 text-muted">{task.note}</p>}
              {task.proofImageUrl && (
                <img className="mt-3 h-24 w-full rounded-card object-cover" src={task.proofImageUrl} alt="学习证明" />
              )}
            </div>
          </div>
          {editable && (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
              <Button variant="secondary" className="min-h-9 px-3 text-xs" onClick={() => setTaskStatus(task.id, '进行中')}><PlayCircle size={15} />进行中</Button>
              <Button variant="secondary" className="min-h-9 px-3 text-xs" onClick={() => setTaskStatus(task.id, '未开始')}><RotateCcw size={15} />恢复</Button>
              {onEdit && <Button variant="secondary" className="min-h-9 px-3 text-xs" onClick={() => onEdit(task)}><Pencil size={15} />编辑</Button>}
              <Button variant="danger" className="min-h-9 px-3 text-xs" onClick={() => deleteTask(task.id)}><Trash2 size={15} />删除</Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
