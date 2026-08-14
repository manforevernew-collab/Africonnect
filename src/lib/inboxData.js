export function sortByNewest(items, dateKey = 'createdAt') {
  return [...items].sort((a, b) => {
    const aTime = new Date(a[dateKey] ?? a.lastMessageAt ?? a.timestamp ?? 0).getTime()
    const bTime = new Date(b[dateKey] ?? b.lastMessageAt ?? b.timestamp ?? 0).getTime()
    return bTime - aTime
  })
}

export function getNewestMessageThreads(threads = initialConversations) {
  return sortByNewest(threads, 'lastMessageAt')
}

export function getNewestNotifications(items = initialNotifications) {
  return sortByNewest(items, 'createdAt')
}

export const initialConversations = [
  {
    id: 1,
    contact: 'Thabo Mokoena',
    role: 'Hiring Manager',
    company: 'JHB Infrastructure',
    avatar: 'TM',
    online: true,
    unread: 2,
    lastMessageAt: '2025-08-13T08:42:00Z',
    messages: [
      { id: 1, from: 'them', text: 'Hi, thanks for your interest in the product manager role. Are you available for a quick intro call this week?', time: '08:42 AM', createdAt: '2025-08-13T08:42:00Z' },
      { id: 2, from: 'me', text: 'Absolutely. I would love to connect and share my experience.', time: '08:48 AM', createdAt: '2025-08-13T08:48:00Z' },
      { id: 3, from: 'them', text: 'Perfect. Please share your availability and portfolio links.', time: '09:05 AM', createdAt: '2025-08-13T09:05:00Z' },
    ]
  },
  {
    id: 2,
    contact: 'Amina Yusuf',
    role: 'Recruiter',
    company: 'AfriLabs',
    avatar: 'AY',
    online: false,
    unread: 0,
    lastMessageAt: '2025-08-12T16:20:00Z',
    messages: [
      { id: 1, from: 'them', text: 'Your profile matches our front-end role in Lagos. Would you like to apply?', time: 'Yesterday', createdAt: '2025-08-12T16:20:00Z' },
      { id: 2, from: 'me', text: 'Yes, please send over the job brief.', time: 'Yesterday', createdAt: '2025-08-12T17:05:00Z' }
    ]
  },
  {
    id: 3,
    contact: 'Ibrahim K.',
    role: 'Talent Partner',
    company: 'TalentBridge',
    avatar: 'IK',
    online: true,
    unread: 1,
    lastMessageAt: '2025-08-10T10:30:00Z',
    messages: [
      { id: 1, from: 'them', text: 'We have a short list of clients looking for people with your skill set.', time: 'Mon', createdAt: '2025-08-10T10:30:00Z' }
    ]
  },
  {
    id: 4,
    contact: 'Nadia Okafor',
    role: 'Operations Lead',
    company: 'Mosaic Africa',
    avatar: 'NO',
    online: true,
    unread: 3,
    lastMessageAt: '2025-08-14T07:15:00Z',
    messages: [
      { id: 1, from: 'them', text: 'Your onboarding details are ready for review before tomorrow morning.', time: '07:15 AM', createdAt: '2025-08-14T07:15:00Z' },
      { id: 2, from: 'me', text: 'Thanks, I will review and send the final documents shortly.', time: '07:32 AM', createdAt: '2025-08-14T07:32:00Z' }
    ]
  }
].map(item => ({
  ...item,
  lastMessageAt: item.messages[item.messages.length - 1]?.createdAt ?? item.lastMessageAt
}))

export const initialNotifications = [
  { id: 1, title: 'Interview request', text: 'Thabo Mokoena invited you to a 30-minute interview for the PM role.', time: '2 hours ago', createdAt: '2025-08-13T13:00:00Z', unread: true },
  { id: 2, title: 'Profile viewed', text: 'Your profile was viewed by 4 employers this week.', time: 'Yesterday', createdAt: '2025-08-12T11:00:00Z', unread: true },
  { id: 3, title: 'Review received', text: 'Amina Yusuf left a 5-star review on your profile.', time: '2 days ago', createdAt: '2025-08-10T09:30:00Z', unread: false },
  { id: 4, title: 'Application update', text: 'Your application for Front-End Engineer has moved to the shortlist.', time: '3 days ago', createdAt: '2025-08-09T15:10:00Z', unread: false },
  { id: 5, title: 'New opportunity', text: 'A logistics operations role in Nairobi is now open for your profile.', time: '4 days ago', createdAt: '2025-08-08T12:45:00Z', unread: true }
]
