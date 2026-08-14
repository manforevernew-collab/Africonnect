import test from 'node:test'
import assert from 'node:assert/strict'
import { sortByNewest, getNewestMessageThreads, getNewestNotifications } from './inboxData.js'

test('sortByNewest arranges newest items first', () => {
  const items = [
    { id: 1, createdAt: '2024-01-01T09:00:00Z' },
    { id: 2, createdAt: '2024-01-05T09:00:00Z' },
    { id: 3, createdAt: '2024-01-03T09:00:00Z' },
  ]

  assert.deepEqual(sortByNewest(items).map(item => item.id), [2, 3, 1])
})

test('message threads and notifications are sorted newest first', () => {
  const threads = [
    { id: 1, lastMessageAt: '2024-01-02T00:00:00Z' },
    { id: 2, lastMessageAt: '2024-01-05T00:00:00Z' },
    { id: 3, lastMessageAt: '2024-01-04T00:00:00Z' },
  ]

  const notifications = [
    { id: 10, createdAt: '2024-01-01T00:00:00Z' },
    { id: 11, createdAt: '2024-01-09T00:00:00Z' },
    { id: 12, createdAt: '2024-01-07T00:00:00Z' },
  ]

  assert.deepEqual(getNewestMessageThreads(threads).map(item => item.id), [2, 3, 1])
  assert.deepEqual(getNewestNotifications(notifications).map(item => item.id), [11, 12, 10])
})
