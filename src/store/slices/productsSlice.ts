// Placeholder for products slice
// Implement with Redux Toolkit or Zustand

export interface ProductsState {
  products: any[]
  categories: any[]
  loading: boolean
  error: string | null
}

export const initialProductsState: ProductsState = {
  products: [],
  categories: [],
  loading: false,
  error: null,
}

// TODO: Implement products slice actions and reducers

