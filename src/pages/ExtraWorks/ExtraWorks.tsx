import { useState, useEffect } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button, Modal, Input, Select, Badge, ConfirmDialog } from '../../components/ui'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { extraWorksApi, type ExtraWork, type BranchPrice } from '../../api/extra-works.api'
import { branchesApi, type Branch } from '../../api/branches.api'
import { useAuth } from '../../context/AuthContext'

export function ExtraWorks() {
  const { isRestrictedAdmin, getAdminBranchId, isDeveloper } = useAuth()
  const isRestricted = isRestrictedAdmin()
  const adminBranchId = getAdminBranchId()
  const [extraWorks, setExtraWorks] = useState<ExtraWork[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWork, setEditingWork] = useState<ExtraWork | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<ExtraWork>>({
    name: '',
    description: '',
    branchPrices: [],
    status: 'active',
  })
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    message: string
    onConfirm: (() => void) | null
  }>({
    isOpen: false,
    message: '',
    onConfirm: null,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [extraWorksData, branchesData] = await Promise.all([
        extraWorksApi.getAll(),
        branchesApi.getAll(),
      ])
      
      // Filter branches based on admin branch assignment
      let availableBranches = branchesData
      if (adminBranchId && !isDeveloper()) {
        availableBranches = branchesData.filter(b => b.id === adminBranchId)
      }
      setBranches(availableBranches)
      
      // Filter branch prices for restricted admins
      const filteredExtraWorks = extraWorksData.map(work => {
        if (adminBranchId && !isDeveloper() && work.branchPrices) {
          return {
            ...work,
            branchPrices: work.branchPrices.filter(bp => bp.branch_id === adminBranchId),
          }
        }
        return work
      })
      
      setExtraWorks(filteredExtraWorks)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data')
      console.error('Error fetching data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const initializeBranchPrices = (existingPrices: BranchPrice[] = []): BranchPrice[] => {
    return branches.map(branch => {
      const existing = existingPrices.find(bp => bp.branch_id === branch.id)
      return existing || {
        branch_id: branch.id,
        branch_name: branch.name,
        amount: 0,
        is_active: true,
      }
    })
  }

  const handleAdd = () => {
    setEditingWork(null)
    const initialBranchPrices = initializeBranchPrices()
    setFormData({ 
      name: '', 
      description: '', 
      branchPrices: initialBranchPrices,
      status: 'active' 
    })
    setIsModalOpen(true)
  }

  const handleEdit = (work: ExtraWork) => {
    setEditingWork(work)
    const branchPrices = initializeBranchPrices(work.branchPrices)
    setFormData({ ...work, branchPrices })
    setIsModalOpen(true)
  }

  const handleBranchPriceChange = (branchId: string, amount: number) => {
    setFormData({
      ...formData,
      branchPrices: formData.branchPrices?.map(bp =>
        bp.branch_id === branchId ? { ...bp, amount } : bp
      ) || [],
    })
  }

  const handleDelete = (id: string) => {
    setConfirmState({
      isOpen: true,
      message: 'Are you sure you want to delete this extra work?',
      onConfirm: async () => {
        try {
          await extraWorksApi.delete(id)
          setExtraWorks(extraWorks.filter((w) => w.id !== id))
        } catch (err: any) {
          alert(err.response?.data?.message || 'Failed to delete extra work')
          console.error('Error deleting extra work:', err)
        }
      },
    })
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      if (!formData.name?.trim()) {
        setError('Name is required')
        return
      }

      if (!formData.branchPrices || formData.branchPrices.length === 0) {
        setError('At least one branch price is required')
        return
      }

      // Validate all branch prices
      const invalidPrices = formData.branchPrices.filter(bp => !bp.amount || bp.amount <= 0)
      if (invalidPrices.length > 0) {
        setError('All branch prices must be greater than 0')
        return
      }

      if (editingWork) {
        const updatedWork = await extraWorksApi.update(editingWork.id, formData)
        await fetchData()
      } else {
        await extraWorksApi.create(formData as Omit<ExtraWork, 'id'>)
        await fetchData()
      }
      setIsModalOpen(false)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save extra work')
      console.error('Error saving extra work:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Extra Works</h1>
          <p className="text-gray-600">Manage additional services and extra works</p>
        </div>
        {!isRestricted && (
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2 inline" />
            Add Extra Work
          </Button>
        )}
      </div>

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading extra works...</p>
        </div>
      ) : extraWorks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No extra works found</p>
        </div>
      ) : (
        <Table>
        <TableHeader>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Description</TableHeaderCell>
          <TableHeaderCell>Branch Prices</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {extraWorks.map((work) => (
            <TableRow key={work.id}>
              <TableCell className="font-medium">{work.name}</TableCell>
              <TableCell className="text-gray-600">{work.description}</TableCell>
              <TableCell>
                {work.branchPrices && work.branchPrices.length > 0 ? (
                  <div className="space-y-1">
                    {work.branchPrices.map((bp) => (
                      <div key={bp.branch_id} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{bp.branch_name || `Branch ${bp.branch_id}`}:</span>
                        <span className="font-semibold">${bp.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">No prices</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={work.status === 'active' ? 'success' : 'danger'}>{work.status}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {!isRestricted && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(work)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(work.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWork ? 'Edit Extra Work' : 'Add Extra Work'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch Prices <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {formData.branchPrices?.map((bp) => {
                const branch = branches.find(b => b.id === bp.branch_id)
                return (
                  <div key={bp.branch_id} className="flex items-center gap-3">
                    <label className="w-32 text-sm text-gray-700 font-medium">
                      {branch?.name || `Branch ${bp.branch_id}`}:
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={bp.amount === 0 ? '' : bp.amount}
                      onChange={(e) => {
                        const value = e.target.value
                        const numValue = value === '' ? 0 : parseFloat(value)
                        if (!isNaN(numValue) && numValue >= 0) {
                          handleBranchPriceChange(bp.branch_id, numValue)
                        }
                      }}
                      placeholder="0.00"
                      className="flex-1"
                    />
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              * Enter prices for all branches
            </p>
          </div>
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsModalOpen(false)
                setError(null)
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        message={confirmState.message}
        title="Confirm Action"
        confirmLabel="OK"
        cancelLabel="Cancel"
        onCancel={() =>
          setConfirmState((prev) => ({
            ...prev,
            isOpen: false,
            onConfirm: null,
          }))
        }
        onConfirm={() => {
          if (confirmState.onConfirm) {
            confirmState.onConfirm()
          }
          setConfirmState((prev) => ({
            ...prev,
            isOpen: false,
            onConfirm: null,
          }))
        }}
      />
    </div>
  )
}

