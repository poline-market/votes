// Notification types and helper functions

export interface Notification {
    id: string
    type: 'deadline' | 'result' | 'action' | 'comment'
    title: string
    message: string
    proposalId?: string
    timestamp: number
    read: boolean
}

export function checkProposalDeadlines(proposals: any[]): Notification[] {
    const now = Date.now() / 1000
    const notifications: Notification[] = []

    proposals.forEach(p => {
        const timeLeft = Number(p.votingEnds) - now

        // Deadline in 24h
        if (timeLeft > 0 && timeLeft < 86400) {
            notifications.push({
                id: `deadline-${p.id}`,
                type: 'deadline',
                title: 'Voting Ends Soon',
                message: `"${p.description.substring(0, 50)}..." ends in ${Math.floor(timeLeft / 3600)}h`,
                proposalId: p.id,
                timestamp: Date.now(),
                read: false,
            })
        }

        // Ready to queue
        if (p.status === 4) { // Succeeded
            notifications.push({
                id: `queue-${p.id}`,
                type: 'action',
                title: 'Ready to Queue',
                message: `Proposal "${p.description.substring(0, 50)}..." can be queued`,
                proposalId: p.id,
                timestamp: Date.now(),
                read: false,
            })
        }

        // Ready to execute
        if (p.status === 5 && Number(p.executionTime) <= now) { // Queued + time passed
            notifications.push({
                id: `execute-${p.id}`,
                type: 'action',
                title: 'Ready to Execute',
                message: `Proposal "${p.description.substring(0, 50)}..." can be executed`,
                proposalId: p.id,
                timestamp: Date.now(),
                read: false,
            })
        }

        // Result notifications
        if (p.status === 6) { // Executed
            notifications.push({
                id: `executed-${p.id}`,
                type: 'result',
                title: 'Proposal Executed',
                message: `"${p.description.substring(0, 50)}..." has been executed`,
                proposalId: p.id,
                timestamp: Date.now(),
                read: false,
            })
        }

        if (p.status === 3) { // Defeated
            notifications.push({
                id: `defeated-${p.id}`,
                type: 'result',
                title: 'Proposal Defeated',
                message: `"${p.description.substring(0, 50)}..." did not pass`,
                proposalId: p.id,
                timestamp: Date.now(),
                read: false,
            })
        }
    })

    return notifications
}

export function saveNotifications(notifications: Notification[]) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('poline_notifications', JSON.stringify(notifications))
    }
}

export function loadNotifications(): Notification[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem('poline_notifications')
    return stored ? JSON.parse(stored) : []
}

export function markAsRead(notificationId: string) {
    const notifications = loadNotifications()
    const updated = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
    )
    saveNotifications(updated)
    return updated
}

export function markAllAsRead() {
    const notifications = loadNotifications()
    const updated = notifications.map(n => ({ ...n, read: true }))
    saveNotifications(updated)
    return updated
}

export function mergeNotifications(existing: Notification[], newNotifs: Notification[]): Notification[] {
    const map = new Map<string, Notification>()

    // Add existing (keep read status)
    existing.forEach(n => map.set(n.id, n))

    // Add new (but don't override if already read)
    newNotifs.forEach(n => {
        if (!map.has(n.id)) {
            map.set(n.id, n)
        }
    })

    return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp)
}
