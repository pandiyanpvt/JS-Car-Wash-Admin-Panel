import axiosInstance from './axiosInstance'

// Backend representations
interface BackendPackage {
  id: number
  package_name: string
  total_amount: string
  service_type_id: number
  is_active: boolean
  service_type?: { id: number; name: string }
  details?: BackendPackageDetail[]
}

interface BackendPackageDetail {
  id: number
  package_id: number
  package_includes_id: number
  is_active: boolean
  package_includes?: {
    id: number
    includes_details: string
    service_type_id: number
    is_active: boolean
    service_type?: { id: number; name: string }
  }
}

// Frontend representations
export interface PackageInclude {
  id: string
  packageId: string
  includeId: string
  name: string
  serviceTypeId: string
  serviceTypeName: string
  status: 'active' | 'inactive'
  detailId: string
}

export interface PackageDetail {
  id: string
  packageId: string
  includeId: string
  status: 'active' | 'inactive'
}

export interface Package {
  id: string
  name: string
  price: number
  status: 'active' | 'inactive'
  serviceTypeId: string
  serviceTypeName: string
  includes: PackageInclude[]
  details: PackageDetail[]
}

const mapBackendDetailToInclude = (pkg: BackendPackage, detail: BackendPackageDetail): PackageInclude => {
  const include = detail.package_includes
  return {
    id: String(include?.id ?? detail.package_includes_id),
    includeId: String(include?.id ?? detail.package_includes_id),
    detailId: String(detail.id),
    packageId: String(pkg.id),
    name: include?.includes_details || 'Include',
    serviceTypeId: String(include?.service_type_id ?? pkg.service_type_id),
    serviceTypeName: include?.service_type?.name || pkg.service_type?.name || '',
    status: detail.is_active ? 'active' : 'inactive',
  }
}

const mapBackendToFrontend = (backend: BackendPackage): Package => {
  const includes = (backend.details || []).map((d) => mapBackendDetailToInclude(backend, d))
  return {
    id: String(backend.id),
    name: backend.package_name,
    price: Number(backend.total_amount),
    status: backend.is_active ? 'active' : 'inactive',
    serviceTypeId: String(backend.service_type_id),
    serviceTypeName: backend.service_type?.name || '',
    includes,
    details: (backend.details || []).map((d) => ({
      id: String(d.id),
      packageId: String(d.package_id),
      includeId: String(d.package_includes_id),
      status: d.is_active ? 'active' : 'inactive',
    })),
  }
}

const mapFrontendToBackend = (frontend: Partial<Package>) => {
  const payload: Partial<BackendPackage> = {}
  if (frontend.name !== undefined) payload.package_name = frontend.name
  if (frontend.price !== undefined) payload.total_amount = String(frontend.price)
  if (frontend.status !== undefined) payload.is_active = frontend.status === 'active'
  if (frontend.serviceTypeId !== undefined) payload.service_type_id = Number(frontend.serviceTypeId)
  return payload
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

  create: async (data: Omit<Package, 'id' | 'includes' | 'details' | 'serviceTypeName'>): Promise<Package> => {
    const payload = mapFrontendToBackend(data)
    const response = await axiosInstance.post('/packages', payload)
    const backendPackage: BackendPackage = response.data.data || response.data
    return mapBackendToFrontend(backendPackage)
  },

  update: async (id: string, data: Partial<Package>): Promise<Package> => {
    const payload = mapFrontendToBackend(data)
    const response = await axiosInstance.put(`/packages/${id}`, payload)
    const backendPackage: BackendPackage = response.data.data || response.data
    return mapBackendToFrontend(backendPackage)
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/packages/${id}`)
  },
}

