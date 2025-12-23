import { useEffect, useState } from 'react'
import { Button, Modal, Input, Select, Badge, ConfirmDialog } from '../../components/ui'
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { packagesApi, type Package } from '../../api/packages.api'
import { packageIncludesApi, type PackageInclude } from '../../api/package-includes.api'
import { packageDetailsApi } from '../../api/package-details.api'
import { serviceTypesApi, type ServiceType } from '../../api/service-types.api'

type PackageForm = {
  name: string
  price: number
  status: 'active' | 'inactive'
  serviceTypeId: string
}

type IncludeForm = {
  packageId: string
  includeId?: string
  detailId?: string
  name: string
  status: 'active' | 'inactive'
  mode: 'new' | 'existing'
  selectedIncludeId?: string
}

export function Packages() {
  const [packages, setPackages] = useState<Package[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [existingIncludes, setExistingIncludes] = useState<PackageInclude[]>([])
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null)
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false)
  const [isIncludeModalOpen, setIsIncludeModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [includeFormData, setIncludeFormData] = useState<IncludeForm>({
    packageId: '',
    name: '',
    status: 'active',
    mode: 'new',
    selectedIncludeId: '',
  })
  const [packageFormData, setPackageFormData] = useState<PackageForm>({
    name: '',
    price: 0,
    status: 'active',
    serviceTypeId: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
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
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const [pkgRes, serviceTypesRes] = await Promise.all([packagesApi.getAll(), serviceTypesApi.getAll()])
        setPackages(pkgRes)
        setServiceTypes(serviceTypesRes)
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load packages')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const refreshPackages = async () => {
    const data = await packagesApi.getAll()
    setPackages(data)
  }

  const handleAddPackage = () => {
    setEditingPackage(null)
    setPackageFormData({
      name: '',
      price: 0,
      status: 'active',
      serviceTypeId: serviceTypes[0]?.id || '',
    })
    setIsPackageModalOpen(true)
  }

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg)
    setPackageFormData({
      name: pkg.name,
      price: pkg.price,
      status: pkg.status,
      serviceTypeId: pkg.serviceTypeId,
    })
    setIsPackageModalOpen(true)
  }

  const handleDeletePackage = (id: string) => {
    setConfirmState({
      isOpen: true,
      message: 'Are you sure you want to delete this package?',
      onConfirm: async () => {
        try {
          await packagesApi.delete(id)
          await refreshPackages()
        } catch (err: any) {
          setError(err?.response?.data?.message || 'Failed to delete package')
        }
      },
    })
  }

  const handleSavePackage = async () => {
    try {
      setSubmitting(true)
      setError(null)
      if (!packageFormData.name.trim()) {
        setError('Package name is required')
        return
      }
      if (!packageFormData.serviceTypeId) {
        setError('Service type is required')
        return
      }

      if (editingPackage) {
        await packagesApi.update(editingPackage.id, packageFormData)
      } else {
        await packagesApi.create(packageFormData)
      }
      await refreshPackages()
      setIsPackageModalOpen(false)
      setEditingPackage(null)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save package')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddInclude = async (packageId: string) => {
    const pkg = packages.find((p) => p.id === packageId)
    if (pkg) {
      // Load existing includes for this service type, excluding ones already used in this package
      try {
        const includes = await packageIncludesApi.getByServiceType(pkg.serviceTypeId)
        const usedIncludeIds = new Set(pkg.includes.map((i) => i.includeId))
        const availableIncludes = includes.filter((inc) => !usedIncludeIds.has(inc.id))
        setExistingIncludes(availableIncludes)
      } catch (err) {
        console.error('Failed to load existing includes:', err)
        setExistingIncludes([])
      }
    }
    setIncludeFormData({ 
      packageId, 
      name: '', 
      status: 'active',
      mode: 'new',
      selectedIncludeId: '',
    })
    setIsIncludeModalOpen(true)
  }

  const handleEditInclude = async (pkgId: string, include: Package['includes'][number]) => {
    const pkg = packages.find((p) => p.id === pkgId)
    if (pkg) {
      // Load existing includes for this service type
      try {
        const includes = await packageIncludesApi.getByServiceType(pkg.serviceTypeId)
        setExistingIncludes(includes)
      } catch (err) {
        console.error('Failed to load existing includes:', err)
        setExistingIncludes([])
      }
    }
    setIncludeFormData({
      packageId: pkgId,
      includeId: include.includeId,
      detailId: include.detailId,
      name: include.name,
      status: include.status,
      mode: 'existing',
      selectedIncludeId: include.includeId,
    })
    setIsIncludeModalOpen(true)
  }

  const handleDeleteInclude = (include: Package['includes'][number]) => {
    setConfirmState({
      isOpen: true,
      message: 'Are you sure you want to delete this include?',
      onConfirm: async () => {
        try {
          // Only delete the link in package_details table so the include definition remains reusable
          if (include.detailId) {
            await packageDetailsApi.delete(include.detailId)
          }
          await refreshPackages()
        } catch (err: any) {
          setError(err?.response?.data?.message || 'Failed to delete include')
        }
      },
    })
  }

  const handleSaveInclude = async () => {
    if (!includeFormData.packageId) return
    try {
      setSubmitting(true)
      setError(null)
      const pkg = packages.find((p) => p.id === includeFormData.packageId)
      const serviceTypeId = pkg?.serviceTypeId || serviceTypes[0]?.id
      if (!serviceTypeId) {
        setError('Service type is required for includes')
        return
      }

      // Validate based on mode
      if (includeFormData.mode === 'new') {
        if (!includeFormData.name.trim()) {
          setError('Include name is required')
          return
        }
      } else {
        if (!includeFormData.selectedIncludeId) {
          setError('Please select an existing include')
          return
        }
      }

      if (includeFormData.includeId && includeFormData.detailId) {
        // Editing existing include detail
        if (includeFormData.mode === 'new') {
          // Update the include name
          await packageIncludesApi.update(includeFormData.includeId, {
            name: includeFormData.name,
            serviceTypeId,
            status: includeFormData.status,
          })
        }
        // Update the detail status
        await packageDetailsApi.update(includeFormData.detailId, { status: includeFormData.status })
      } else {
        // Creating new include detail
        let includeId: string

        if (includeFormData.mode === 'new') {
          // Create new include
          const createdInclude = await packageIncludesApi.create({
            name: includeFormData.name,
            serviceTypeId,
            status: includeFormData.status,
          })
          includeId = createdInclude.id
        } else {
          // Use existing include
          includeId = includeFormData.selectedIncludeId!
        }

        // Create package detail linking package to include
        await packageDetailsApi.create({
          packageId: includeFormData.packageId,
          includeId,
          status: includeFormData.status,
        })
      }

      await refreshPackages()
      setIsIncludeModalOpen(false)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save include')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleExpand = (packageId: string) => {
    setExpandedPackage(expandedPackage === packageId ? null : packageId)
  }

  // Group ONLY active packages by service type
  const packagesByServiceType = packages
    .filter((pkg) => pkg.status === 'active')
    .reduce((acc, pkg) => {
      const serviceTypeName = pkg.serviceTypeName || 'Other'
      if (!acc[serviceTypeName]) {
        acc[serviceTypeName] = []
      }
      acc[serviceTypeName].push(pkg)
      return acc
    }, {} as Record<string, Package[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Packages</h1>
          <p className="text-gray-600">Manage packages, includes, and service types</p>
        </div>
        <Button onClick={handleAddPackage}>
          <Plus className="w-4 h-4 mr-2 inline" />
          Add Package
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {loading && <div className="text-gray-600 text-sm">Loading packages...</div>}

      <div className="space-y-8">
        {Object.entries(packagesByServiceType).map(([serviceTypeName, servicePackages]) => (
          <div key={serviceTypeName} className="space-y-4">
            <div className="border-b-2 border-gray-300 pb-2">
              <h2 className="text-2xl font-bold text-gray-800">{serviceTypeName}</h2>
            </div>
            <div className="space-y-4">
              {servicePackages.map((pkg) => (
                <div key={pkg.id} className="glass-dark rounded-xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <button onClick={() => toggleExpand(pkg.id)} className="p-1 hover:bg-white/50 rounded">
                            {expandedPackage === pkg.id ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </button>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{pkg.name}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-gray-600">${pkg.price}</span>
                              <Badge variant={pkg.status === 'active' ? 'success' : 'danger'}>{pkg.status}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditPackage(pkg)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeletePackage(pkg.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {expandedPackage === pkg.id && (
                      <div className="mt-6 space-y-6 pl-10">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-800">Package Includes</h4>
                            <Button variant="ghost" size="sm" onClick={() => handleAddInclude(pkg.id)}>
                              <Plus className="w-4 h-4 mr-1" />
                              Add Include
                            </Button>
                          </div>
                          {pkg.includes.filter((include) => include.status === 'active').length === 0 ? (
                            <div className="text-sm text-gray-600">No includes added.</div>
                          ) : (
                            <div className="space-y-2">
                              {pkg.includes
                                .filter((include) => include.status === 'active')
                                .map((include) => (
                                <div key={`${include.detailId}-${include.includeId}`} className="glass rounded-lg p-4 flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-gray-800">{include.name}</div>
                                    <div className="text-sm text-gray-600">{include.serviceTypeName || 'Include'}</div>
                                    <Badge variant={include.status === 'active' ? 'success' : 'danger'}>{include.status}</Badge>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditInclude(pkg.id, include)}>
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDeleteInclude(include)}>
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        title={editingPackage ? 'Edit Package' : 'Add Package'}
      >
        <div className="space-y-4">
          <Input
            label="Package Name"
            value={packageFormData.name}
            onChange={(e) => setPackageFormData({ ...packageFormData, name: e.target.value })}
          />
          <Input
            label="Price"
            type="number"
            step="0.01"
            min="0"
            value={packageFormData.price === 0 ? '' : packageFormData.price}
            onChange={(e) => {
              const value = e.target.value
              if (value === '' || value === '-') {
                setPackageFormData({ ...packageFormData, price: 0 })
              } else {
                const numValue = parseFloat(value)
                if (!isNaN(numValue) && numValue >= 0) {
                  setPackageFormData({ ...packageFormData, price: numValue })
                }
              }
            }}
          />
          <Select
            label="Service Type"
            value={packageFormData.serviceTypeId}
            onChange={(e) => setPackageFormData({ ...packageFormData, serviceTypeId: e.target.value })}
            options={serviceTypes.map((s) => ({ value: s.id, label: s.name }))}
          />
          <Select
            label="Status"
            value={packageFormData.status}
            onChange={(e) => setPackageFormData({ ...packageFormData, status: e.target.value as 'active' | 'inactive' })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsPackageModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSavePackage} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isIncludeModalOpen}
        onClose={() => setIsIncludeModalOpen(false)}
        title={includeFormData.includeId && includeFormData.detailId ? 'Edit Include Detail' : 'Add Include Detail'}
      >
        <div className="space-y-4">
          {!includeFormData.includeId || !includeFormData.detailId ? (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Add Include</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="includeMode"
                      value="new"
                      checked={includeFormData.mode === 'new'}
                      onChange={() => setIncludeFormData({ ...includeFormData, mode: 'new', selectedIncludeId: '', name: '' })}
                      className="w-4 h-4"
                    />
                    <span>Create New Include</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="includeMode"
                      value="existing"
                      checked={includeFormData.mode === 'existing'}
                      onChange={() => setIncludeFormData({ ...includeFormData, mode: 'existing', name: '' })}
                      className="w-4 h-4"
                    />
                    <span>Select Existing Include</span>
                  </label>
                </div>
              </div>

              {includeFormData.mode === 'new' ? (
                <Input
                  label="Include Name"
                  value={includeFormData.name}
                  onChange={(e) => setIncludeFormData({ ...includeFormData, name: e.target.value })}
                  placeholder="Enter new include name"
                />
              ) : (
                <Select
                  label="Select Existing Include"
                  value={includeFormData.selectedIncludeId || ''}
                  onChange={(e) => {
                    const selectedInclude = existingIncludes.find(inc => inc.id === e.target.value)
                    setIncludeFormData({ 
                      ...includeFormData, 
                      selectedIncludeId: e.target.value,
                      name: selectedInclude?.name || ''
                    })
                  }}
                  options={[
                    { value: '', label: 'Select an include...' },
                    ...existingIncludes.map((inc) => ({ value: inc.id, label: inc.name }))
                  ]}
                />
              )}
            </>
          ) : (
            <Input
              label="Include Name"
              value={includeFormData.name}
              onChange={(e) => setIncludeFormData({ ...includeFormData, name: e.target.value })}
              disabled
            />
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsIncludeModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSaveInclude} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
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

