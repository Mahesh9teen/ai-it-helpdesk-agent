/**
 * API Client for Enterprise Features
 * Connects frontend components to backend API endpoints
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

// ============================================================================
// Time Tracking API
// ============================================================================

export async function logTimeSession(ticketId, sessionData) {
  try {
    const response = await fetch(`${API_BASE}/features/time-tracking/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticket_id: ticketId,
        duration_seconds: sessionData.duration,
        description: sessionData.description,
        start_time: sessionData.startTime
      })
    })
    if (!response.ok) throw new Error('Failed to log time session')
    return await response.json()
  } catch (error) {
    console.error('Time tracking error:', error)
    throw error
  }
}

export async function getTimeSessions(ticketId) {
  try {
    const response = await fetch(`${API_BASE}/features/time-tracking/tickets/${ticketId}`)
    if (!response.ok) throw new Error('Failed to fetch time sessions')
    return await response.json()
  } catch (error) {
    console.error('Fetch time sessions error:', error)
    return []
  }
}

// ============================================================================
// Chat History API
// ============================================================================

export async function getChatHistory(employeeId, limit = 20) {
  try {
    const response = await fetch(
      `${API_BASE}/features/chat-history?employee_id=${employeeId}&limit=${limit}`
    )
    if (!response.ok) throw new Error('Failed to fetch chat history')
    return await response.json()
  } catch (error) {
    console.error('Chat history error:', error)
    return []
  }
}

export async function getConversation(conversationId) {
  try {
    const response = await fetch(`${API_BASE}/features/chat-history/${conversationId}`)
    if (!response.ok) throw new Error('Failed to fetch conversation')
    return await response.json()
  } catch (error) {
    console.error('Fetch conversation error:', error)
    return null
  }
}

export async function deleteConversation(conversationId) {
  try {
    const response = await fetch(`${API_BASE}/features/chat-history/${conversationId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete conversation')
    return true
  } catch (error) {
    console.error('Delete conversation error:', error)
    return false
  }
}

// ============================================================================
// Workflow Automation API
// ============================================================================

export async function createWorkflowRule(ruleData) {
  try {
    const response = await fetch(`${API_BASE}/features/workflows/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ruleData)
    })
    if (!response.ok) throw new Error('Failed to create workflow rule')
    return await response.json()
  } catch (error) {
    console.error('Create workflow error:', error)
    throw error
  }
}

export async function getWorkflowRules() {
  try {
    const response = await fetch(`${API_BASE}/features/workflows/rules`)
    if (!response.ok) throw new Error('Failed to fetch workflow rules')
    return await response.json()
  } catch (error) {
    console.error('Fetch workflow rules error:', error)
    return []
  }
}

export async function updateWorkflowRule(ruleId, enabled) {
  try {
    const response = await fetch(`${API_BASE}/features/workflows/rules/${ruleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled })
    })
    if (!response.ok) throw new Error('Failed to update workflow rule')
    return await response.json()
  } catch (error) {
    console.error('Update workflow error:', error)
    throw error
  }
}

export async function deleteWorkflowRule(ruleId) {
  try {
    const response = await fetch(`${API_BASE}/features/workflows/rules/${ruleId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete workflow rule')
    return true
  } catch (error) {
    console.error('Delete workflow error:', error)
    return false
  }
}

// ============================================================================
// Notification Preferences API
// ============================================================================

export async function getNotificationPreferences(employeeId) {
  try {
    const response = await fetch(
      `${API_BASE}/features/notifications/preferences?employee_id=${employeeId}`
    )
    if (!response.ok) throw new Error('Failed to fetch notification preferences')
    return await response.json()
  } catch (error) {
    console.error('Fetch notification preferences error:', error)
    return null
  }
}

export async function updateNotificationPreferences(employeeId, preferences) {
  try {
    const response = await fetch(`${API_BASE}/features/notifications/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_id: employeeId,
        preferences
      })
    })
    if (!response.ok) throw new Error('Failed to update notification preferences')
    return await response.json()
  } catch (error) {
    console.error('Update notification preferences error:', error)
    throw error
  }
}

// ============================================================================
// Roles & Permissions API
// ============================================================================

export async function getRoles() {
  try {
    const response = await fetch(`${API_BASE}/features/roles`)
    if (!response.ok) throw new Error('Failed to fetch roles')
    return await response.json()
  } catch (error) {
    console.error('Fetch roles error:', error)
    return []
  }
}

export async function updateRolePermissions(roleId, permissions) {
  try {
    const response = await fetch(`${API_BASE}/features/roles/${roleId}/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions })
    })
    if (!response.ok) throw new Error('Failed to update role permissions')
    return await response.json()
  } catch (error) {
    console.error('Update role permissions error:', error)
    throw error
  }
}
