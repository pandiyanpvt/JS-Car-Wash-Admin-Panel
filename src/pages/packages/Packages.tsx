import { useState } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button, Modal, Input, Select, Badge } from '../../components/ui'
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react'

interface PackageInclude {
  id: string
  packageId: string
  serviceName: string
  description: string
}

interface PackageDetail {
  id: string
  packageId: string
  detailTitle: string
  detailDescription: string
}

interface Package {
  id: string
  name: string
  price: number
  duration: number
  status: 'active' | 'inactive'
  includes: PackageInclude[]
  details: PackageDetail[]
}

const dummyPackages: Package[] = [
  {
    id: '1',
    name: 'Premium Wash',
    price: 150,
    duration: 60,
    status: 'active',
    includes: [
      { id: '1', packageId: '1', serviceName: 'Exterior Wash', description: 'High-pressure wash' },
      { id: '2', packageId: '1', serviceName: 'Interior Vacuum', description: 'Complete interior cleaning' },
    ],
    details: [
      { id: '1', packageId: '1', detailTitle: 'Quality Guarantee', detailDescription: '100% satisfaction guaranteed' },
    ],
  },
  {
    id: '2',
    name: 'Full Detail',
    price: 300,
    duration: 120,
    status: 'active',
    includes: [
      { id: '3', packageId: '2', serviceName: 'Premium Wash', description: 'All premium wash features' },
      { id: '4', packageId: '2', serviceName: 'Wax Polish', description: 'Hand wax application' },
      { id: '5', packageId: '2', serviceName: 'Interior Deep Clean', description: 'Steam cleaning' },
    ],
    details: [
      { id: '2', packageId: '2', detailTitle: 'Premium Service', detailDescription: 'Top-tier detailing service' },
    ],
  },
]

export function Packages() {
  const [packages, setPackages] = useState<Package[]>(dummyPackages)
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null)
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false)
  const [isIncludeModalOpen, setIsIncludeModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [editingInclude, setEditingInclude] = useState<{ include: PackageInclude | null; packageId: string } | null>(null)
  const [editingDetail, setEditingDetail] = useState<{ detail: PackageDetail | null; packageId: string } | null>(null)
  const [packageFormData, setPackageFormData] = useState<Partial<Package>>({})
  const [includeFormData, setIncludeFormData] = useState<Partial<PackageInclude>>({})
  const [detailFormData, setDetailFormData] = useState<Partial<PackageDetail>>({})

  const handleAddPackage = () => {
    setEditingPackage(null)
    setPackageFormData({ name: '', price: 0, duration: 0, status: 'active', includes: [], details: [] })
    setIsPackageModalOpen(true)
  }

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg)
    setPackageFormData(pkg)
    setIsPackageModalOpen(true)
  }

  const handleAddInclude = (packageId: string) => {
    setEditingInclude({ include: null, packageId })
    setIncludeFormData({ packageId, serviceName: '', description: '' })
    setIsIncludeModalOpen(true)
  }

  const handleEditInclude = (include: PackageInclude) => {
    setEditingInclude({ include, packageId: include.packageId })
    setIncludeFormData(include)
    setIsIncludeModalOpen(true)
  }

  const handleAddDetail = (packageId: string) => {
    setEditingDetail({ detail: null, packageId })
    setDetailFormData({ packageId, detailTitle: '', detailDescription: '' })
    setIsDetailModalOpen(true)
  }

  const handleEditDetail = (detail: PackageDetail) => {
    setEditingDetail({ detail, packageId: detail.packageId })
    setDetailFormData(detail)
    setIsDetailModalOpen(true)
  }

  const handleSavePackage = () => {
    if (editingPackage) {
      setPackages(packages.map((p) => (p.id === editingPackage.id ? { ...packageFormData, id: p.id, includes: p.includes, details: p.details } as Package : p)))
    } else {
      const newPackage: Package = {
        ...packageFormData,
        id: String(packages.length + 1),
        includes: [],
        details: [],
      } as Package
      setPackages([...packages, newPackage])
    }
    setIsPackageModalOpen(false)
  }

  const handleSaveInclude = () => {
    if (!editingInclude) return
    const pkg = packages.find((p) => p.id === editingInclude.packageId)
    if (!pkg) return

    if (editingInclude.include) {
      const updatedIncludes = pkg.includes.map((inc) =>
        inc.id === editingInclude.include!.id ? { ...includeFormData, id: inc.id, packageId: pkg.id } as PackageInclude : inc
      )
      setPackages(packages.map((p) => (p.id === pkg.id ? { ...p, includes: updatedIncludes } : p)))
    } else {
      const newInclude: PackageInclude = {
        ...includeFormData,
        id: String(Date.now()),
        packageId: pkg.id,
      } as PackageInclude
      setPackages(packages.map((p) => (p.id === pkg.id ? { ...p, includes: [...p.includes, newInclude] } : p)))
    }
    setIsIncludeModalOpen(false)
  }

  const handleSaveDetail = () => {
    if (!editingDetail) return
    const pkg = packages.find((p) => p.id === editingDetail.packageId)
    if (!pkg) return

    if (editingDetail.detail) {
      const updatedDetails = pkg.details.map((det) =>
        det.id === editingDetail.detail!.id ? { ...detailFormData, id: det.id, packageId: pkg.id } as PackageDetail : det
      )
      setPackages(packages.map((p) => (p.id === pkg.id ? { ...p, details: updatedDetails } : p)))
    } else {
      const newDetail: PackageDetail = {
        ...detailFormData,
        id: String(Date.now()),
        packageId: pkg.id,
      } as PackageDetail
      setPackages(packages.map((p) => (p.id === pkg.id ? { ...p, details: [...p.details, newDetail] } : p)))
    }
    setIsDetailModalOpen(false)
  }

  const toggleExpand = (packageId: string) => {
    setExpandedPackage(expandedPackage === packageId ? null : packageId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Packages</h1>
          <p className="text-gray-600">Manage packages, includes, and details</p>
        </div>
        <Button onClick={handleAddPackage}>
          <Plus className="w-4 h-4 mr-2 inline" />
          Add Package
        </Button>
      </div>

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
                        <span className="text-gray-600">{pkg.duration} min</span>
                        <Badge variant={pkg.status === 'active' ? 'success' : 'danger'}>{pkg.status}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleEditPackage(pkg)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>

              {expandedPackage === pkg.id && (
                <div className="mt-6 space-y-6 pl-10">
                  {/* Package Includes */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">Package Includes</h4>
                      <Button variant="ghost" size="sm" onClick={() => handleAddInclude(pkg.id)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Include
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {pkg.includes.map((include) => (
                        <div key={include.id} className="glass rounded-lg p-4 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-800">{include.serviceName}</div>
                            <div className="text-sm text-gray-600">{include.description}</div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleEditInclude(include)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Package Details */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">Package Details</h4>
                      <Button variant="ghost" size="sm" onClick={() => handleAddDetail(pkg.id)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Detail
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {pkg.details.map((detail) => (
                        <div key={detail.id} className="glass rounded-lg p-4 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-800">{detail.detailTitle}</div>
                            <div className="text-sm text-gray-600">{detail.detailDescription}</div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleEditDetail(detail)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Package Modal */}
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
          <Input
            label="Duration (minutes)"
            type="number"
            value={packageFormData.duration}
            onChange={(e) => setPackageFormData({ ...packageFormData, duration: Number(e.target.value) })}
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
            <Button variant="secondary" onClick={() => setIsPackageModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePackage}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Include Modal */}
      <Modal
        isOpen={isIncludeModalOpen}
        onClose={() => setIsIncludeModalOpen(false)}
        title={editingInclude?.include ? 'Edit Include' : 'Add Include'}
      >
        <div className="space-y-4">
          <Input
            label="Service Name"
            value={includeFormData.serviceName}
            onChange={(e) => setIncludeFormData({ ...includeFormData, serviceName: e.target.value })}
          />
          <Input
            label="Description"
            value={includeFormData.description}
            onChange={(e) => setIncludeFormData({ ...includeFormData, description: e.target.value })}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsIncludeModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveInclude}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={editingDetail?.detail ? 'Edit Detail' : 'Add Detail'}
      >
        <div className="space-y-4">
          <Input
            label="Detail Title"
            value={detailFormData.detailTitle}
            onChange={(e) => setDetailFormData({ ...detailFormData, detailTitle: e.target.value })}
          />
          <Input
            label="Detail Description"
            value={detailFormData.detailDescription}
            onChange={(e) => setDetailFormData({ ...detailFormData, detailDescription: e.target.value })}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDetail}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

