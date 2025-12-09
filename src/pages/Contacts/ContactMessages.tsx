import { useState, useEffect } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button, Modal, Input, Badge } from '../../components/ui'
import { Card } from '../../components/ui/Card'
import { MessageSquare, Send, User, Mail, Phone, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { contactsApi } from '../../api/contacts.api'
import type { ContactMessage, ContactReply } from '../../api/contacts.api'

export function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [isConversationOpen, setIsConversationOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replySubject, setReplySubject] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSendingReply, setIsSendingReply] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await contactsApi.getAll()
      setMessages(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch contact messages')
      console.error('Error fetching contact messages:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenConversation = async (message: ContactMessage) => {
    setSelectedMessage(message)
    setIsConversationOpen(true)
    
    // Mark as read if unread
    if (message.status === 'new') {
      try {
        await contactsApi.markAsRead(message.id)
        setMessages(messages.map(m => m.id === message.id ? { ...m, status: 'replied' as const } : m))
      } catch (err) {
        console.error('Error marking message as read:', err)
      }
    }
    
    // Fetch full message details with replies
    try {
      const fullMessage = await contactsApi.getById(message.id)
      setSelectedMessage(fullMessage)
    } catch (err) {
      console.error('Error fetching message details:', err)
    }
  }

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim() || !replySubject.trim()) return

    try {
      setIsSendingReply(true)
      setError(null)
      const newReply = await contactsApi.sendReply(
        selectedMessage.id,
        replySubject,
        replyText
      )
      
      const updatedMessages = messages.map((msg) =>
        msg.id === selectedMessage.id
          ? {
              ...msg,
              replies: [...msg.replies, newReply],
              status: 'replied' as const,
            }
          : msg
      )

      setMessages(updatedMessages)
      setSelectedMessage(updatedMessages.find((m) => m.id === selectedMessage.id) || null)
      setReplyText('')
      setReplySubject('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reply')
      console.error('Error sending reply:', err)
    } finally {
      setIsSendingReply(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info'> = {
      new: 'warning',
      replied: 'success',
      archived: 'info',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Contact Messages</h1>
        <p className="text-gray-600">View and respond to customer inquiries</p>
      </div>

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading contact messages...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className={`lg:col-span-2 ${isConversationOpen ? 'hidden lg:block' : ''}`}>
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No contact messages found</p>
              </div>
            ) : (
              <Table>
            <TableHeader>
              <TableHeaderCell>Customer</TableHeaderCell>
              <TableHeaderCell>Subject</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{message.name}</div>
                      <div className="text-sm text-gray-500">{message.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{message.subject}</TableCell>
                  <TableCell className="text-gray-500">
                    {format(new Date(message.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>{getStatusBadge(message.status)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenConversation(message)}>
                      <MessageSquare className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            )}
          </div>

        {/* Conversation View */}
        {isConversationOpen && selectedMessage && (
          <div className={`lg:col-span-1 ${isConversationOpen ? 'lg:col-span-3' : ''}`}>
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Conversation</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsConversationOpen(false)}>
                  Close
                </Button>
              </div>

              {/* Customer Info */}
              <div className="glass rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedMessage.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{selectedMessage.name}</div>
                    <div className="text-sm text-gray-600">{selectedMessage.email}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {selectedMessage.phone}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(new Date(selectedMessage.createdAt), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
              </div>

              {/* Original Message */}
              <div className="mb-6">
                <div className="glass rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">{selectedMessage.subject}</span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(selectedMessage.createdAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <p className="text-gray-700">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Replies */}
              {selectedMessage.replies.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h3 className="font-semibold text-gray-800">Replies</h3>
                  {selectedMessage.replies.map((reply) => (
                    <div key={reply.id} className="glass rounded-lg p-4 bg-primary-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">{reply.repliedBy}</span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(reply.repliedAt), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-gray-700">{reply.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              <div className="border-t border-gray-200 pt-6">
                <div className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <Input
                      value={replySubject}
                      onChange={(e) => setReplySubject(e.target.value)}
                      placeholder="Reply subject..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Reply</label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      rows={4}
                      className="input-field"
                    />
                  </div>
                  <Button 
                    onClick={handleSendReply} 
                    className="w-full"
                    disabled={isSendingReply || !replyText.trim() || !replySubject.trim()}
                  >
                    <Send className="w-4 h-4 mr-2 inline" />
                    {isSendingReply ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
        </div>
      )}
    </div>
  )
}

