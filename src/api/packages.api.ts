import axiosInstance from './axiosInstance'

// Backend representations
interface BackendPackagePrice {
  id: number
  package_id: number
  branch_id: number
  vehicle_type: string
  price: string
  is_active: boolean
  createdAt?: string
  updatedAt?: string
  branch?: {
    id: number
    branch_name: string
    address: string
    phone_number: string
    email_address: string
    is_active: boolean
    createdAt?: string
    updatedAt?: string
  }
}

interface BackendPackage {
  id: number
  package_name: string
  service_type_id: number
  is_active: boolean
  createdAt?: string
  updatedAt?: string
  service_type?: {
    id: number
    name: string
    createdAt?: string
    updatedAt?: string
  }
  prices?: BackendPackagePrice[]
  details?: any[] // Legacy field, may not be used in new structure
}

// Frontend representations
export interface PackageBranchPrice {
  id?: string
  branchId: string
  branchName?: string
  vehicleType: string
  price: number
  isActive: boolean
}

// PackageInclude represents an include linked to a package (via package_details)
export interface PackageInclude {
  id: string // This is the includeId (from package_includes table)
  packageId: string
  includeId: string // Same as id, for consistency
  detailId: string // ID from package_details table
  name: string
  serviceTypeId: string
  serviceTypeName: string
  status: 'active' | 'inactive'
}

export interface Package {
  id: string
  name: string
  status: 'active' | 'inactive'
  serviceTypeId: string
  serviceTypeName: string
  vehicleTypes: string[]
  branchPrices: PackageBranchPrice[]
  includes?: PackageInclude[] // Includes are fetched separately
}

// Request payload types
export interface CreatePackagePayload {
  package_name: string
  service_type_id: number
  is_active: boolean
  vehicle_types: string[]
  branch_prices: Array<{
    branch_id: number
    vehicle_type: string
    price: number
    is_active: boolean
  }>
}

export interface UpdatePackagePayload extends CreatePackagePayload {}

const mapBackendToFrontend = (backend: BackendPackage): Package => {
  // Extract unique vehicle types from prices
  const vehicleTypesSet = new Set<string>()
  const branchPrices: PackageBranchPrice[] = []

  if (backend.prices) {
    backend.prices.forEach((price) => {
      vehicleTypesSet.add(price.vehicle_type)
      branchPrices.push({
        id: String(price.id),
        branchId: String(price.branch_id),
        branchName: price.branch?.branch_name,
        vehicleType: price.vehicle_type,
        price: parseFloat(price.price) || 0,
        isActive: price.is_active,
      })
    })
  }

  return {
    id: String(backend.id),
    name: backend.package_name,
    status: backend.is_active ? 'active' : 'inactive',
    serviceTypeId: String(backend.service_type_id),
    serviceTypeName: backend.service_type?.name || '',
    vehicleTypes: Array.from(vehicleTypesSet).sort(),
    branchPrices,
  }
}

const mapFrontendToBackend = (frontend: {
  name?: string
  status?: 'active' | 'inactive'
  serviceTypeId?: string
  vehicleTypes?: string[]
  branchPrices?: PackageBranchPrice[]
}): CreatePackagePayload => {
  return {
    package_name: frontend.name || '',
    service_type_id: frontend.serviceTypeId ? Number(frontend.serviceTypeId) : 0,
    is_active: frontend.status === 'active',
    vehicle_types: frontend.vehicleTypes || [],
    branch_prices: (frontend.branchPrices || []).map((bp) => ({
      branch_id: Number(bp.branchId),
      vehicle_type: bp.vehicleType,
      price: bp.price,
      is_active: bp.isActive,
    })),
  }
}

export const packagesApi = {
  getAll: async (): Promise<Package[]> => {
    const response = await axiosInstance.get('/packages')
    const backendPackages: BackendPackage[] = response.data.data || response.data
    return Array.isArray(backendPackages) ? backendPackages.map(mapBackendToFrontend) : []
  },

  getById: async (id: string): Promise<Package> => {
    const response = await axiosInstance.get(`/packages/${id}`)
    const backendPackage: BackendPackage = response.data.data || response.data
    return mapBackendToFrontend(backendPackage)
  },

  create: async (data: {
    name: string
    status: 'active' | 'inactive'
    serviceTypeId: string
    vehicleTypes: string[]
    branchPrices: PackageBranchPrice[]
  }): Promise<Package> => {
    const payload = mapFrontendToBackend(data)
    const response = await axiosInstance.post('/packages', payload)
    const backendPackage: BackendPackage = response.data.data || response.data
    return mapBackendToFrontend(backendPackage)
  },

  update: async (
    id: string,
    data: {
      name: string
      status: 'active' | 'inactive'
      serviceTypeId: string
      vehicleTypes: string[]
      branchPrices: PackageBranchPrice[]
    }
  ): Promise<Package> => {
    const payload = mapFrontendToBackend(data)
    const response = await axiosInstance.put(`/packages/${id}`, payload)
    const backendPackage: BackendPackage = response.data.data || response.data
    return mapBackendToFrontend(backendPackage)
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/packages/${id}`)
  },
}
