import { Button, Card, Empty } from '../components/ui'
import { useAppStore } from '../features/useAppStore'
import { timeAgo } from '../utils/date'

export const Notifications = () => {
  const { users, messages, currentUserId, markMessageRead, markAllRead } = useAppStore()
  const list = messages.filter((message) => message.toUserId === currentUserId)
  const nameOf = (id: string) => users.find((user) => user.id === id)?.name ?? '搭档'

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">全部消息</h2>
        <Button variant="secondary" onClick={markAllRead}>全部已读</Button>
      </div>
      {list.length === 0 ? <Empty>还没有提醒消息。</Empty> : (
        <div className="grid gap-3">
          {list.map((message) => (
            <Card key={message.id} className={message.read ? 'opacity-75' : 'border-blue-200'}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{message.type}</p>
                  <p className="mt-1 text-sm leading-6">{message.content}</p>
                  <p className="mt-2 text-xs text-muted">{nameOf(message.fromUserId)} · {timeAgo(message.createdAt)}</p>
                </div>
                {!message.read && <Button variant="secondary" className="min-h-9 px-3 text-xs" onClick={() => markMessageRead(message.id)}>已读</Button>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
