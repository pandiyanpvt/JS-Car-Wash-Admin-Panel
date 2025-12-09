import { useEffect, useState } from 'react'
import { Button, Modal, Input, Select, Badge } from '../../components/ui'
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { packagesApi, type Package } from '../../api/packages.api'
import { packageIncludesApi } from '../../api/package-includes.api'
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
}

export function Packages() {
  const [packages, setPackages] = useState<Package[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null)
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false)
  const [isIncludeModalOpen, setIsIncludeModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [includeFormData, setIncludeFormData] = useState<IncludeForm>({
    packageId: '',
    name: '',
    status: 'active',
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

  const handleDeletePackage = async (id: string) => {
    if (!window.confirm('Delete this package?')) return
    try {
      await packagesApi.delete(id)
      await refreshPackages()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete package')
    }
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

  const handleAddInclude = (packageId: string) => {
    setIncludeFormData({ packageId, name: '', status: 'active' })
    setIsIncludeModalOpen(true)
  }

  const handleEditInclude = (pkgId: string, include: Package['includes'][number]) => {
    setIncludeFormData({
      packageId: pkgId,
      includeId: include.includeId,
      detailId: include.detailId,
      name: include.name,
      status: include.status,
    })
    setIsIncludeModalOpen(true)
  }

  const handleDeleteInclude = async (include: Package['includes'][number]) => {
    if (!window.confirm('Delete this include?')) return
    try {
      await packageIncludesApi.delete(include.includeId)
      if (include.detailId) {
        await packageDetailsApi.delete(include.detailId)
      }
      await refreshPackages()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete include')
    }
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

      if (includeFormData.includeId) {
        await packageIncludesApi.update(includeFormData.includeId, {
          name: includeFormData.name,
          serviceTypeId,
          status: includeFormData.status,
        })
        if (includeFormData.detailId) {
          await packageDetailsApi.update(includeFormData.detailId, { status: includeFormData.status })
        }
      } else {
        const createdInclude = await packageIncludesApi.create({
          name: includeFormData.name,
          serviceTypeId,
          status: includeFormData.status,
        })
        await packageDetailsApi.create({
          packageId: includeFormData.packageId,
          includeId: createdInclude.id,
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

      <div className="space-y-4">
        {packages.map((pkg) => (
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
                        {pkg.serviceTypeName && <Badge variant="default">{pkg.serviceTypeName}</Badge>}
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
                    {pkg.includes.length === 0 ? (
                      <div className="text-sm text-gray-600">No includes added.</div>
                    ) : (
                      <div className="space-y-2">
                        {pkg.includes.map((include) => (
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
            value={packageFormData.price}
            onChange={(e) => setPackageFormData({ ...packageFormData, price: Number(e.target.value) })}
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
        title={includeFormData.includeId ? 'Edit Include' : 'Add Include'}
      >
        <div className="space-y-4">
          <Input
            label="Include Name"
            value={includeFormData.name}
            onChange={(e) => setIncludeFormData({ ...includeFormData, name: e.target.value })}
          />
          <Select
            label="Status"
            value={includeFormData.status}
            onChange={(e) => setIncludeFormData({ ...includeFormData, status: e.target.value as 'active' | 'inactive' })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
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
    </div>
  )
}

