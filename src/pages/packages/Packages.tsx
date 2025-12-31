import { useEffect, useState } from 'react'
import { Button, Modal, Input, Select, Badge, ConfirmDialog } from '../../components/ui'
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { packagesApi, type Package, type PackageBranchPrice, type PackageInclude } from '../../api/packages.api'
import { packageIncludesApi, type PackageInclude as PackageIncludeDefinition } from '../../api/package-includes.api'
import { packageDetailsApi } from '../../api/package-details.api'
import { serviceTypesApi, type ServiceType } from '../../api/service-types.api'
import { branchesApi, type Branch } from '../../api/branches.api'
import { VEHICLE_TYPES } from '../../utils/constants'
import { useAuth } from '../../context/AuthContext'

type PackageForm = {
  name: string
  status: 'active' | 'inactive'
  serviceTypeId: string
  vehicleTypes: string[]
  branchPrices: PackageBranchPrice[]
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
  const { isRestrictedAdmin } = useAuth()
  const isRestricted = isRestrictedAdmin()
  const [packages, setPackages] = useState<Package[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [existingIncludes, setExistingIncludes] = useState<PackageIncludeDefinition[]>([])
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
    status: 'active',
    serviceTypeId: '',
    vehicleTypes: [],
    branchPrices: [],
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
        const [pkgRes, serviceTypesRes, branchesRes] = await Promise.all([
          packagesApi.getAll(),
          serviceTypesApi.getAll(),
          branchesApi.getAll(),
        ])
        // Fetch includes for each package
        const packagesWithIncludes = await Promise.all(
          pkgRes.map(async (pkg) => {
            try {
              const details = await packageDetailsApi.getByPackage(pkg.id)
              // Fetch include information for each detail
              const includes = await Promise.all(
                details.map(async (detail) => {
                  try {
                    // Get includes for this service type and match them
                    const allIncludes = await packageIncludesApi.getByServiceType(pkg.serviceTypeId)
                    const includeDef = allIncludes.find((inc) => inc.id === detail.includeId)
                    if (includeDef) {
                      return {
                        id: includeDef.id,
                        packageId: pkg.id,
                        includeId: includeDef.id,
                        detailId: detail.id,
                        name: includeDef.name,
                        serviceTypeId: includeDef.serviceTypeId,
                        serviceTypeName: pkg.serviceTypeName,
                        status: detail.status,
                      } as PackageInclude
                    }
                    return null
                  } catch {
                    return null
                  }
                })
              )
              return {
                ...pkg,
                includes: includes.filter((inc): inc is PackageInclude => inc !== null),
              }
            } catch {
              return { ...pkg, includes: [] }
            }
          })
        )
        setPackages(packagesWithIncludes)
        setServiceTypes(serviceTypesRes)
        setBranches(branchesRes)
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
    // Fetch includes for each package
    const packagesWithIncludes = await Promise.all(
      data.map(async (pkg) => {
        try {
          const details = await packageDetailsApi.getByPackage(pkg.id)
          // Fetch include information for each detail
          const includes = await Promise.all(
            details.map(async (detail) => {
              try {
                // We need to get the include details - since we only have includeId, we need to fetch all includes
                // and match them, or the backend might return include info with details
                // For now, let's try to get includes for this service type and match
                const allIncludes = await packageIncludesApi.getByServiceType(pkg.serviceTypeId)
                const include = allIncludes.find((inc) => inc.id === detail.includeId)
                if (include) {
                  return {
                    id: include.id,
                    packageId: pkg.id,
                    includeId: include.id,
                    detailId: detail.id,
                    name: include.name,
                    serviceTypeId: include.serviceTypeId,
                    serviceTypeName: pkg.serviceTypeName,
                    status: detail.status,
                  }
                }
                return null
              } catch {
                return null
              }
            })
          )
          return {
            ...pkg,
            includes: includes.filter((inc): inc is NonNullable<typeof inc> => inc !== null),
          }
        } catch {
          return { ...pkg, includes: [] }
        }
      })
    )
    setPackages(packagesWithIncludes)
  }

  const initializeBranchPrices = (selectedVehicleTypes: string[], existingPrices: PackageBranchPrice[] = []) => {
    const newBranchPrices: PackageBranchPrice[] = []
    
    branches.forEach((branch) => {
      selectedVehicleTypes.forEach((vehicleType) => {
        // Check if price already exists for this branch and vehicle type combination
        const existingPrice = existingPrices.find(
          (p) => p.branchId === branch.id && p.vehicleType === vehicleType
        )
        
        if (existingPrice) {
          // Preserve existing price data
          newBranchPrices.push({
            ...existingPrice,
            branchName: branch.name,
          })
        } else {
          // Create new price entry
          newBranchPrices.push({
            branchId: branch.id,
            branchName: branch.name,
            vehicleType,
            price: 0,
            isActive: true,
          })
        }
      })
    })
    
    return newBranchPrices
  }

  const handleAddPackage = () => {
    setEditingPackage(null)
    setError(null)
    // Initialize with all 6 vehicle types
    const allVehicleTypes = [...VEHICLE_TYPES]
    const initialBranchPrices = initializeBranchPrices(allVehicleTypes, [])
    setPackageFormData({
      name: '',
      status: 'active',
      serviceTypeId: serviceTypes[0]?.id || '',
      vehicleTypes: allVehicleTypes,
      branchPrices: initialBranchPrices,
    })
    setIsPackageModalOpen(true)
  }

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg)
    setError(null)
    setPackageFormData({
      name: pkg.name,
      status: pkg.status,
      serviceTypeId: pkg.serviceTypeId,
      vehicleTypes: [...pkg.vehicleTypes],
      branchPrices: pkg.branchPrices.map((bp) => ({ ...bp })),
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


  const handleBranchPriceChange = (branchId: string, vehicleType: string, price: number) => {
    setPackageFormData({
      ...packageFormData,
      branchPrices: packageFormData.branchPrices.map((bp) =>
        bp.branchId === branchId && bp.vehicleType === vehicleType
          ? { ...bp, price }
          : bp
      ),
    })
  }

  const handleBranchPriceActiveToggle = (branchId: string, vehicleType: string) => {
    // When toggling active, ensure price is maintained
    setPackageFormData({
      ...packageFormData,
      branchPrices: packageFormData.branchPrices.map((bp) => {
        if (bp.branchId === branchId && bp.vehicleType === vehicleType) {
          return { ...bp, isActive: !bp.isActive }
        }
        return bp
      }),
    })
  }

  // Initialize branch prices when editing to ensure all vehicle types are included
  useEffect(() => {
    if (isPackageModalOpen && editingPackage && branches.length > 0) {
      // Ensure all 6 vehicle types are in the form data
      const allVehicleTypes = [...VEHICLE_TYPES]
      const updatedBranchPrices = initializeBranchPrices(allVehicleTypes, editingPackage.branchPrices)
      setPackageFormData(prev => ({
        ...prev,
        vehicleTypes: allVehicleTypes,
        branchPrices: updatedBranchPrices,
      }))
    }
  }, [isPackageModalOpen, editingPackage, branches.length])

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
      // Validate that all 6 vehicle types are selected
      if (packageFormData.vehicleTypes.length !== VEHICLE_TYPES.length) {
        setError(`All ${VEHICLE_TYPES.length} vehicle types must be included`)
        return
      }

      // Validate that all 6 vehicle types have prices for all branches (6 × branches = 12 prices for 2 branches)
      const missingOrInvalidPrices: string[] = []
      
      branches.forEach((branch) => {
        VEHICLE_TYPES.forEach((vehicleType) => {
          const price = packageFormData.branchPrices.find(
            (bp) => bp.branchId === branch.id && bp.vehicleType === vehicleType
          )
          if (!price || price.price <= 0 || isNaN(price.price)) {
            missingOrInvalidPrices.push(`${branch.name} - ${vehicleType}`)
          }
        })
      })

      if (missingOrInvalidPrices.length > 0) {
        setError(`Please enter valid prices (greater than 0) for: ${missingOrInvalidPrices.join(', ')}`)
        return
      }

      // Double-check: Ensure we have exactly the required number of valid prices
      const requiredPricesCount = VEHICLE_TYPES.length * branches.length
      const validPrices = packageFormData.branchPrices.filter(
        bp => bp.price > 0 && !isNaN(bp.price)
      )
      if (validPrices.length !== requiredPricesCount) {
        setError(`Please enter valid prices for all ${requiredPricesCount} combinations (${VEHICLE_TYPES.length} vehicle types × ${branches.length} branches)`)
        return
      }

      // Ensure all prices are marked as active before saving
      const packageDataToSave = {
        ...packageFormData,
        branchPrices: packageFormData.branchPrices.map(bp => ({
          ...bp,
          isActive: true, // All prices must be active
        })),
      }

      if (editingPackage) {
        await packagesApi.update(editingPackage.id, packageDataToSave)
      } else {
        await packagesApi.create(packageDataToSave)
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
        const usedIncludeIds = new Set((pkg.includes || []).map((i) => i.includeId))
        const availableIncludes = includes.filter((inc) => !usedIncludeIds.has(inc.id))
        // Map to the format expected by existingIncludes state (which expects PackageIncludeDefinition from package-includes.api)
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

  const handleEditInclude = async (pkgId: string, include: PackageInclude) => {
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

  const handleDeleteInclude = (include: PackageInclude) => {
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

  // Get prices grouped by branch for display
  const getPricesByBranch = (pkg: Package) => {
    const pricesByBranch: Record<string, PackageBranchPrice[]> = {}
    pkg.branchPrices.forEach((bp) => {
      if (!pricesByBranch[bp.branchId]) {
        pricesByBranch[bp.branchId] = []
      }
      pricesByBranch[bp.branchId].push(bp)
    })
    return pricesByBranch
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Packages</h1>
          <p className="text-gray-600">Manage packages, vehicle types, and branch pricing</p>
        </div>
        {!isRestricted && (
          <Button onClick={handleAddPackage}>
            <Plus className="w-4 h-4 mr-2 inline" />
            Add Package
          </Button>
        )}
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
              {servicePackages.map((pkg) => {
                const pricesByBranch = getPricesByBranch(pkg)
                return (
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
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600">Vehicle Types:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {pkg.vehicleTypes.map((vt) => (
                                      <Badge key={vt} variant="success" className="text-xs">
                                        {vt}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <Badge variant={pkg.status === 'active' ? 'success' : 'danger'}>{pkg.status}</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!isRestricted && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleEditPackage(pkg)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => handleDeletePackage(pkg.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {expandedPackage === pkg.id && (
                        <div className="mt-6 space-y-6 pl-10">
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold text-gray-800">Package Includes</h4>
                              {!isRestricted && (
                                <Button variant="ghost" size="sm" onClick={() => handleAddInclude(pkg.id)}>
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add Include
                                </Button>
                              )}
                            </div>
                            {!pkg.includes || pkg.includes.filter((include) => include.status === 'active').length === 0 ? (
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
                                        {!isRestricted && (
                                          <>
                                            <Button variant="ghost" size="sm" onClick={() => handleEditInclude(pkg.id, include)}>
                                              <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDeleteInclude(include)}>
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>

                          <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Branch Prices</h4>
                            {Object.keys(pricesByBranch).length === 0 ? (
                              <div className="text-sm text-gray-600">No branch prices configured.</div>
                            ) : (
                              <div className="space-y-4">
                                {Object.entries(pricesByBranch).map(([branchId, prices]) => {
                                  const branch = branches.find((b) => b.id === branchId)
                                  return (
                                    <div key={branchId} className="glass rounded-lg p-4">
                                      <h5 className="font-semibold text-gray-800 mb-3">{branch?.name || 'Unknown Branch'}</h5>
                                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {prices
                                          .filter((p) => p.isActive)
                                          .map((price) => (
                                            <div key={`${branchId}-${price.vehicleType}`} className="text-sm">
                                              <div className="text-gray-600">{price.vehicleType}</div>
                                              <div className="font-semibold text-gray-800">${price.price.toFixed(2)}</div>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isPackageModalOpen}
        onClose={() => {
          setIsPackageModalOpen(false)
          setError(null)
        }}
        title={editingPackage ? 'Edit Package' : 'Add Package'}
        size="xl"
      >
        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
          <Input
            label="Package Name"
            value={packageFormData.name}
            onChange={(e) => setPackageFormData({ ...packageFormData, name: e.target.value })}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Types <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2">(All 6 types required)</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
              {VEHICLE_TYPES.map((vehicleType) => (
                <div key={vehicleType} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={packageFormData.vehicleTypes.includes(vehicleType)}
                    disabled
                    className="w-4 h-4 rounded border-gray-300 cursor-not-allowed"
                  />
                  <span className="text-sm text-gray-700 font-medium">{vehicleType}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              All vehicle types are required. You must enter prices for all {VEHICLE_TYPES.length} types across all {branches.length} branches ({VEHICLE_TYPES.length * branches.length} prices total).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Branch Prices <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2">(All {VEHICLE_TYPES.length * branches.length} prices required)</span>
            </label>
            <div className="space-y-4">
              {branches.map((branch) => (
                <div key={branch.id} className="border rounded-lg p-4 space-y-3">
                  <h5 className="font-semibold text-gray-800">{branch.name}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {VEHICLE_TYPES.map((vehicleType) => {
                      const priceData = packageFormData.branchPrices.find(
                        (bp) => bp.branchId === branch.id && bp.vehicleType === vehicleType
                      )
                      return (
                        <div key={`${branch.id}-${vehicleType}`} className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            {vehicleType} <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            required
                            value={priceData?.price === 0 ? '' : priceData?.price || ''}
                            onChange={(e) => {
                              const value = e.target.value
                              const numValue = value === '' ? 0 : parseFloat(value)
                              if (!isNaN(numValue) && numValue >= 0) {
                                handleBranchPriceChange(branch.id, vehicleType, numValue)
                              }
                            }}
                            placeholder="0.00"
                            className={!priceData || priceData.price <= 0 ? 'border-red-300' : ''}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Required: Enter prices for all {VEHICLE_TYPES.length} vehicle types in all {branches.length} branches
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
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
