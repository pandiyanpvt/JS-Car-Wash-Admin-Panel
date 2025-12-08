import { useState } from 'react'
import { Button, Modal } from '../../components/ui'
import { Plus, Trash2, Upload, X } from 'lucide-react'

interface GalleryImage {
  id: string
  url: string
  title?: string
  uploadedAt: string
}

const dummyImages: GalleryImage[] = [
  { id: '1', url: 'https://via.placeholder.com/400x300?text=Image+1', title: 'Car Wash Service', uploadedAt: '2024-01-15' },
  { id: '2', url: 'https://via.placeholder.com/400x300?text=Image+2', title: 'Interior Detail', uploadedAt: '2024-01-14' },
  { id: '3', url: 'https://via.placeholder.com/400x300?text=Image+3', title: 'Exterior Polish', uploadedAt: '2024-01-13' },
  { id: '4', url: 'https://via.placeholder.com/400x300?text=Image+4', title: 'Premium Service', uploadedAt: '2024-01-12' },
  { id: '5', url: 'https://via.placeholder.com/400x300?text=Image+5', title: 'Full Detail', uploadedAt: '2024-01-11' },
  { id: '6', url: 'https://via.placeholder.com/400x300?text=Image+6', title: 'Express Wash', uploadedAt: '2024-01-10' },
]

export function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>(dummyImages)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [uploadUrl, setUploadUrl] = useState('')

  const handleUpload = () => {
    if (!uploadUrl.trim()) return
    const newImage: GalleryImage = {
      id: String(Date.now()),
      url: uploadUrl,
      uploadedAt: new Date().toISOString().split('T')[0],
    }
    setImages([newImage, ...images])
    setUploadUrl('')
    setIsUploadModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      setImages(images.filter((img) => img.id !== id))
      if (selectedImage?.id === id) {
        setIsPreviewModalOpen(false)
        setSelectedImage(null)
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
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload}>Upload</Button>
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

