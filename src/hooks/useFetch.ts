import { useState, useEffect } from 'react'

interface UseFetchOptions {
  immediate?: boolean
}

interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions = { immediate: true }
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(options.immediate ?? true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (options.immediate) {
      fetchData()
    }
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

