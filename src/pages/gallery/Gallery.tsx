import { useState, useEffect } from 'react'
import { Button, Modal } from '../../components/ui'
import { Plus, Trash2, Upload, X } from 'lucide-react'
import { galleryApi } from '../../api/gallery.api'
import type { GalleryImage } from '../../api/gallery.api'

export function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [uploadUrl, setUploadUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await galleryApi.getAll()
      setImages(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch gallery images')
      console.error('Error fetching gallery images:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!uploadUrl.trim()) return
    
    try {
      setIsUploading(true)
      setError(null)
      const newImage = await galleryApi.createFromUrl(uploadUrl)
      setImages([newImage, ...images])
      setUploadUrl('')
      setIsUploadModalOpen(false)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload image')
      console.error('Error uploading image:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await galleryApi.delete(id)
        setImages(images.filter((img) => img.id !== id))
        if (selectedImage?.id === id) {
          setIsPreviewModalOpen(false)
          setSelectedImage(null)
        }
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete image')
        console.error('Error deleting image:', err)
      }
    }
  }

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image)
    setIsPreviewModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gallery</h1>
          <p className="text-gray-600">Manage gallery images</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Upload className="w-4 h-4 mr-2 inline" />
          Upload Image
        </Button>
      </div>

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading gallery images...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No images found</p>
        </div>
      ) : (
        <>
          {/* Image Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className="glass-dark rounded-xl overflow-hidden group cursor-pointer card-hover"
            onClick={() => handleImageClick(image)}
          >
            <div className="relative aspect-video bg-gray-200">
              <img
                src={image.url}
                alt={image.title || 'Gallery image'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(image.id)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            {image.title && (
              <div className="p-4">
                <p className="font-medium text-gray-800">{image.title}</p>
                <p className="text-sm text-gray-500 mt-1">Uploaded: {image.uploadedAt}</p>
              </div>
            )}
          </div>
          ))}
          </div>
        </>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Image"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
            <input
              type="text"
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
              className="input-field"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsUploadModalOpen(false)
                setError(null)
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading || !uploadUrl.trim()}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      {selectedImage && (
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title={selectedImage.title || 'Image Preview'}
          size="lg"
        >
          <div className="space-y-4">
            <img src={selectedImage.url} alt={selectedImage.title} className="w-full rounded-lg" />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Uploaded: {selectedImage.uploadedAt}</p>
              <Button variant="danger" onClick={() => handleDelete(selectedImage.id)}>
                <Trash2 className="w-4 h-4 mr-2 inline" />
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

