import { useEffect, useState } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Select } from '../../components/ui'
import { Button } from '../../components/ui/Button'
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { userLogsApi, type UserLog, type PaginationInfo } from '../../api/user-logs.api'

export function UserLogs() {
  const [logs, setLogs] = useState<UserLog[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await userLogsApi.getAll(currentPage, pageSize)
        setLogs(response.items)
        setPagination(response.pagination)
      } catch (err: any) {
        console.error('Failed to load user logs', err)
        setError(err?.response?.data?.message || 'Failed to load user logs')
      } finally {
        setIsLoading(false)
      }
    }

    void fetchLogs()
  }, [currentPage, pageSize])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">User Logs</h1>
        <p className="text-gray-600">View and monitor user activity logs</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableHeaderCell>User</TableHeaderCell>
          <TableHeaderCell>Date &amp; Time</TableHeaderCell>
          <TableHeaderCell>Action</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Description</TableHeaderCell>
          <TableHeaderCell>IP / Agent</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                Loading logs...
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No logs found</p>
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                {/* User */}
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{log.userName}</span>
                    <span className="text-xs text-gray-500">
                      {log.email} {log.userId ? `(ID: ${log.userId})` : ''}
                    </span>
                  </div>
                </TableCell>
                {/* Date & Time */}
                <TableCell className="text-gray-500 whitespace-nowrap">
                  {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                </TableCell>
                {/* Action */}
                <TableCell>
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-sm font-medium">
                    {log.action}
                  </span>
                </TableCell>
                {/* Status */}
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      log.loginStatus === 'success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {log.loginStatus}
                  </span>
                </TableCell>
                {/* Description */}
                <TableCell className="text-gray-700">
                  {log.details || '-'}
                </TableCell>
                {/* IP / Agent */}
                <TableCell className="text-xs text-gray-500 max-w-xs truncate">
                  <div>{log.ipAddress}</div>
                  <div className="truncate">{log.userAgent}</div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {!isLoading && pagination.totalPages > 0 && (
        <div className="mt-4 rounded-xl border border-white/20 bg-white/60 backdrop-blur-sm shadow-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs sm:text-sm text-gray-600">
            Showing{' '}
            <span className="font-semibold text-gray-800">
              {((pagination.page - 1) * pagination.pageSize) + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-gray-800">
              {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-gray-800">
              {pagination.totalItems}
            </span>{' '}
            logs
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="w-36">
              <Select
                value={String(pageSize)}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1) // Reset to first page when changing page size
                }}
                options={[
                  { value: '5', label: '5 per page' },
                  { value: '10', label: '10 per page' },
                  { value: '20', label: '20 per page' },
                  { value: '50', label: '50 per page' },
                ]}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full border border-gray-200 bg-white/80 hover:bg-primary-50 shadow-sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={pagination.page === 1 || isLoading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="hidden sm:block text-sm text-gray-600">
                Page <span className="font-semibold">{pagination.page}</span> of{' '}
                <span className="font-semibold">{pagination.totalPages}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full border border-gray-200 bg-white/80 hover:bg-primary-50 shadow-sm"
                onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                disabled={pagination.page === pagination.totalPages || isLoading}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

