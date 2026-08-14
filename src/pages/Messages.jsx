import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getNewestMessageThreads, getNewestNotifications } from '../lib/inboxData'

export default function Messages({ initialTab = 'messages' }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [conversations, setConversations] = useState(() => getNewestMessageThreads())
  const [notifications, setNotifications] = useState(() => getNewestNotifications())
  const [draft, setDraft] = useState('')

  const declaredTab = (searchParams.get('tab') || initialTab || 'messages') === 'notifications' ? 'notifications' : 'messages'
  const [activeTab, setActiveTab] = useState(declaredTab)

  const threadParam = Number(searchParams.get('thread'))
  const [selectedId, setSelectedId] = useState(() => threadParam || conversations[0]?.id || 1)

  useEffect(() => {
    const nextTab = (searchParams.get('tab') || initialTab || 'messages') === 'notifications' ? 'notifications' : 'messages'
    setActiveTab(nextTab)

    const nextThread = Number(searchParams.get('thread'))
    if (nextThread) {
      setSelectedId(nextThread)
    }
  }, [searchParams, initialTab])

  const selectedConversation = useMemo(
    () => conversations.find(item => item.id === selectedId) || conversations[0],
    [conversations, selectedId]
  )

  useEffect(() => {
    if (!conversations.length) return
    if (!selectedConversation && selectedId) {
      setSelectedId(conversations[0].id)
    }
  }, [conversations, selectedConversation, selectedId])

  function changeTab(nextTab) {
    setActiveTab(nextTab)
    setSearchParams({ tab: nextTab })
  }

  function handleSendMessage() {
    const clean = draft.trim()
    if (!clean || !selectedConversation) return

    const sentAt = new Date().toISOString()
    setConversations(prev => getNewestMessageThreads(prev.map(thread => {
      if (thread.id !== selectedConversation.id) return thread

      return {
        ...thread,
        unread: 0,
        lastMessageAt: sentAt,
        messages: [
          ...thread.messages,
          {
            id: Date.now(),
            from: 'me',
            text: clean,
            time: 'Now',
            createdAt: sentAt
          }
        ]
      }
    })))

    setDraft('')
  }

  function markNotificationRead(id) {
    setNotifications(list => getNewestNotifications(list.map(item => item.id === id ? { ...item, unread: false } : item)))
  }

  const unreadNotificationCount = notifications.filter(n => n.unread).length

  return (
    <div className="page-enter" style={{ background: '#f8fafc', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <div className="card" style={{ overflow: 'hidden', borderRadius: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px', borderBottom: '1px solid var(--color-border)', background: '#fff' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Messages & Notifications</h2>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button
                className={`btn ${activeTab === 'messages' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => changeTab('messages')}
                style={{ padding: '8px 16px', fontWeight: 600 }}
              >
                Messages
              </button>
              <button
                className={`btn ${activeTab === 'notifications' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => changeTab('notifications')}
                style={{ padding: '8px 16px', fontWeight: 600, position: 'relative' }}
              >
                Notifications
                {unreadNotificationCount > 0 && (
                  <span style={{
                    position: 'absolute', right: -6, top: -6,
                    minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999,
                    background: '#ef4444', color: 'white', fontSize: 10, fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                  }}>{unreadNotificationCount}</span>
                )}
              </button>
            </div>
          </div>

          {activeTab === 'messages' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', minHeight: 620 }}>
              <aside style={{ borderRight: '1px solid var(--color-border)', background: '#f8fafc' }}>
                {conversations.map(thread => (
                  <button
                    key={thread.id}
                    onClick={() => {
                      setSelectedId(thread.id)
                      setSearchParams({ tab: 'messages', thread: String(thread.id) })
                    }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '16px 18px', borderBottom: '1px solid var(--color-border)',
                      background: selectedId === thread.id ? '#fff' : 'transparent', borderLeft: selectedId === thread.id ? '3px solid var(--color-primary)' : '3px solid transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar" style={{ width: 42, height: 42, fontSize: 12, background: '#fff1d6', color: '#b45309' }}>{thread.avatar}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <strong style={{ fontSize: 14 }}>{thread.contact}</strong>
                          {thread.unread > 0 && (
                            <span style={{ minWidth: 18, height: 18, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#f59e0b', color: 'white', fontSize: 10, fontWeight: 700 }}>{thread.unread}</span>
                          )}
                        </div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{thread.role}</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>{thread.company}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </aside>

              <section style={{ display: 'flex', flexDirection: 'column', background: '#fff' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: 16 }}>{selectedConversation?.contact}</strong>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{selectedConversation?.company}</div>
                  </div>
                  <span style={{ fontSize: 12, color: selectedConversation?.online ? '#16a34a' : '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: selectedConversation?.online ? '#16a34a' : '#94a3b8', display: 'inline-block' }} />
                    {selectedConversation?.online ? 'Online' : 'Offline'}
                  </span>
                </div>

                <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: '#f8fafc' }}>
                  {selectedConversation?.messages.map(msg => (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: msg.from === 'me' ? 'flex-end' : 'flex-start',
                        maxWidth: '72%',
                        background: msg.from === 'me' ? '#f59e0b' : '#fff',
                        color: msg.from === 'me' ? 'white' : '#0f172a',
                        border: msg.from === 'me' ? 'none' : '1px solid var(--color-border)',
                        borderRadius: 14,
                        padding: '12px 14px',
                        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
                      }}
                    >
                      <div style={{ fontSize: 13, lineHeight: 1.5 }}>{msg.text}</div>
                      <div style={{ fontSize: 10, opacity: 0.75, marginTop: 6, textAlign: 'right' }}>{msg.time}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: 20, borderTop: '1px solid var(--color-border)', background: '#fff' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>Reply</label>
                  <textarea
                    className="input"
                    rows={4}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder="Write a reply to the message..."
                    style={{ resize: 'vertical', minHeight: 90 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, gap: 12, flexWrap: 'wrap' }}>
                    <button className="btn btn-outline" type="button">Attach file</button>
                    <button className="btn btn-primary" type="button" onClick={handleSendMessage}>Send Message</button>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {notifications.map(item => (
                  <button
                    key={item.id}
                    onClick={() => markNotificationRead(item.id)}
                    style={{
                      width: '100%', textAlign: 'left', border: '1px solid var(--color-border)',
                      background: item.unread ? '#fff7ed' : '#fff', borderRadius: 12,
                      padding: 16, cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                      <strong style={{ fontSize: 15 }}>{item.title}</strong>
                      {item.unread && <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />}
                    </div>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{item.text}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 11, marginTop: 8 }}>{item.time}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

