import axiosInstance from './axiosInstance'

// Backend ContactUs model structure
interface BackendContactUs {
  id: number
  full_name: string
  email_address: string
  subject: string
  message: string
  is_read: boolean
  is_active: boolean
  createdAt: string
  updatedAt: string
  replies?: BackendContactReply[]
}

// Backend ContactReply model structure
interface BackendContactReply {
  id: number
  contact_id: number
  user_id: number
  subject: string
  body: string
  is_active: boolean
  createdAt: string
  admin?: {
    id: number
    first_name: string
    last_name: string
    email_address: string
  }
}

// Frontend interfaces
export interface ContactReply {
  id: string
  contactId: string
  message: string
  repliedBy: string
  repliedAt: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
  status: 'new' | 'replied' | 'archived'
  replies: ContactReply[]
}

// Helper function to map backend contact to frontend
const mapBackendToFrontend = (
  backend: BackendContactUs,
  replies: BackendContactReply[] = [],
): ContactMessage => {
  const resolvedReplies = replies.length ? replies : backend.replies || []

  return {
    id: String(backend.id),
    name: backend.full_name,
    email: backend.email_address,
    subject: backend.subject,
    message: backend.message,
    createdAt: backend.createdAt || new Date().toISOString(),
    status: resolvedReplies.length > 0 || backend.is_read ? 'replied' : 'new',
    replies: resolvedReplies.map((reply) => ({
      id: String(reply.id),
      contactId: String(reply.contact_id),
      message: reply.body,
      repliedBy: reply.admin
        ? `${reply.admin.first_name} ${reply.admin.last_name}`.trim() || reply.admin.email_address
        : 'Admin',
      repliedAt: reply.createdAt || new Date().toISOString(),
    })),
  }
}

export const contactsApi = {
  getAll: async (): Promise<ContactMessage[]> => {
    const response = await axiosInstance.get('/contact-us')
    const backendContacts: BackendContactUs[] = response.data.data || response.data
    return Array.isArray(backendContacts) 
      ? backendContacts.map((contact) => mapBackendToFrontend(contact))
      : []
  },

  getById: async (id: string): Promise<ContactMessage> => {
    const response = await axiosInstance.get(`/contact-us/${id}`)
    const backendContact: BackendContactUs = response.data.data || response.data
    return mapBackendToFrontend(backendContact, backendContact.replies || [])
  },

  getUnread: async (): Promise<ContactMessage[]> => {
    const response = await axiosInstance.get('/contact-us/unread')
    const backendContacts: BackendContactUs[] = response.data.data || response.data
    return Array.isArray(backendContacts) 
      ? backendContacts.map((contact) => mapBackendToFrontend(contact))
      : []
  },

  markAsRead: async (id: string): Promise<void> => {
    await axiosInstance.put(`/contact-us/${id}/mark-as-read`)
  },

  sendReply: async (id: string, subject: string, body: string): Promise<ContactReply> => {
    const response = await axiosInstance.post(`/contact-us/${id}/reply`, { subject, body })
    const backendReply: BackendContactReply = response.data.data || response.data
    return {
      id: String(backendReply.id),
      contactId: String(backendReply.contact_id),
      message: backendReply.body,
      repliedBy: backendReply.admin
        ? `${backendReply.admin.first_name} ${backendReply.admin.last_name}`.trim() ||
          backendReply.admin.email_address
        : 'Admin',
      repliedAt: backendReply.createdAt || new Date().toISOString(),
    }
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/contact-us/${id}`)
  },
}

