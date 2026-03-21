import React, { useState, useRef } from 'react'
import { 
  Camera, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Shield, 
  User, 
  FileText, 
  Home, 
  DollarSign,
  Star,
  Clock,
  Eye,
  RefreshCw,
  XCircle,
  AlertTriangle,
  Search
} from 'lucide-react'
import DocumentAuthentication from './DocumentAuthentication'

interface KYCLevel {
  level: number
  name: string
  description: string
  requirements: string[]
  benefits: string[]
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  completedAt?: string
}

interface KYCDocument {
  id: string
  type: 'id_document' | 'proof_of_income' | 'proof_of_address' | 'selfie' | 'enhanced_dd'
  name: string
  status: 'pending' | 'verified' | 'rejected' | 'expired'
  uploadDate: string
  fileUrl?: string
  metadata?: any
}

export default function KYCSystem() {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'verification' | 'authentication'>('overview')
  const [kycLevels, setKycLevels] = useState<KYCLevel[]>([
    {
      level: 1,
      name: 'Basic Verification',
      description: 'Phone number and name verification',
      requirements: ['Phone number', 'Full name', 'Email address'],
      benefits: ['Basic loan access', 'Lower loan limits'],
      status: 'completed',
      completedAt: '2024-01-10'
    },
    {
      level: 2,
      name: 'Identity Verification',
      description: 'Government ID document verification',
      requirements: ['National ID/Passport', 'Live selfie verification'],
      benefits: ['Increased loan limits', 'Faster approvals'],
      status: 'completed',
      completedAt: '2024-01-12'
    },
    {
      level: 3,
      name: 'Financial Verification',
      description: 'Proof of income and address verification',
      requirements: ['Latest payslip', 'Bank statements', 'Proof of address'],
      benefits: ['Higher loan amounts', 'Better interest rates'],
      status: 'in_progress'
    },
    {
      level: 4,
      name: 'Enhanced Due Diligence',
      description: 'Comprehensive background and financial checks',
      requirements: ['Tax clearance certificate', 'Credit bureau report', 'Employment verification'],
      benefits: ['Maximum loan limits', 'Premium rates', 'Priority processing'],
      status: 'pending'
    }
  ])

  const [documents, setDocuments] = useState<KYCDocument[]>([
    {
      id: '1',
      type: 'id_document',
      name: 'National ID Card',
      status: 'verified',
      uploadDate: '2024-01-10',
      metadata: { documentNumber: '9201015143087', expiryDate: '2028-01-01' }
    },
    {
      id: '2',
      type: 'selfie',
      name: 'Live Selfie Verification',
      status: 'verified',
      uploadDate: '2024-01-10',
      metadata: { deviceFingerprint: 'abc123', location: 'Windhoek, Namibia' }
    },
    {
      id: '3',
      type: 'proof_of_income',
      name: 'Latest Payslip',
      status: 'pending',
      uploadDate: '2024-01-15'
    },
    {
      id: '4',
      type: 'proof_of_address',
      name: 'Utility Bill',
      status: 'pending',
      uploadDate: '2024-01-15'
    }
  ])

  const [showCameraModal, setShowCameraModal] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      })
      setCameraStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
        const imageData = canvasRef.current.toDataURL('image/jpeg')
        setCapturedImage(imageData)
        stopCamera()
      }
    }
  }

  const handleFileUpload = async (file: File, documentType: string) => {
    // Mock file upload - in real app, upload to Supabase storage
    const newDoc: KYCDocument = {
      id: Date.now().toString(),
      type: documentType as any,
      name: file.name,
      status: 'pending',
      uploadDate: new Date().toISOString().split('T')[0],
      metadata: {
        fileSize: file.size,
        fileType: file.type,
        deviceFingerprint: navigator.userAgent,
        uploadTime: new Date().toISOString()
      }
    }
    
    setDocuments([...documents, newDoc])
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'in_progress': return <Clock className="w-5 h-5 text-yellow-600" />
      case 'pending': return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />
      case 'verified': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'expired': return <AlertTriangle className="w-5 h-5 text-orange-600" />
      default: return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'verified': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1: return <User className="w-6 h-6" />
      case 2: return <Shield className="w-6 h-6" />
      case 3: return <FileText className="w-6 h-6" />
      case 4: return <Star className="w-6 h-6" />
      default: return <User className="w-6 h-6" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">KYC & Compliance</h2>
            <p className="text-neutral-500">Complete your verification to unlock better loan terms</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-500">Current Level</p>
            <p className="text-2xl font-bold text-cashub-600">Level 2</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="border-b border-neutral-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-cashub-500 text-cashub-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Verification Levels
              </div>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-cashub-500 text-cashub-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Documents
              </div>
            </button>
            <button
              onClick={() => setActiveTab('authentication')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'authentication'
                  ? 'border-cashub-500 text-cashub-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center">
                <Search className="w-4 h-4 mr-2" />
                Document Authentication
              </div>
            </button>
          </nav>
        </div>

        {/* Verification Levels Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="space-y-4">
              {kycLevels.map((level) => (
                <div key={level.level} className="border border-neutral-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        level.status === 'completed' 
                          ? 'bg-green-100 text-green-600' 
                          : level.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getLevelIcon(level.level)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-neutral-900">
                            Level {level.level}: {level.name}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(level.status)}`}>
                            {level.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-neutral-600 mb-3">{level.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-neutral-900 mb-2">Requirements:</h4>
                            <ul className="space-y-1">
                              {level.requirements.map((req, index) => (
                                <li key={index} className="flex items-center text-sm text-neutral-600">
                                  <div className={`w-2 h-2 rounded-full mr-2 ${
                                    level.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                                  }`}></div>
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-neutral-900 mb-2">Benefits:</h4>
                            <ul className="space-y-1">
                              {level.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center text-sm text-neutral-600">
                                  <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {level.completedAt && (
                          <p className="text-sm text-green-600 mt-3">
                            Completed on {new Date(level.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {level.status === 'pending' && (
                      <button className="px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors">
                        Start Verification
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Upload Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-cashub-500 transition-colors">
                  <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-neutral-900 mb-1">Upload ID Document</p>
                  <p className="text-xs text-neutral-500 mb-3">National ID, Passport, or Driver's License</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'id_document')}
                    className="hidden"
                    id="id-upload"
                  />
                  <label
                    htmlFor="id-upload"
                    className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors cursor-pointer"
                  >
                    Choose File
                  </label>
                </div>

                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-cashub-500 transition-colors">
                  <DollarSign className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-neutral-900 mb-1">Upload Proof of Income</p>
                  <p className="text-xs text-neutral-500 mb-3">Latest payslip or income statement</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'proof_of_income')}
                    className="hidden"
                    id="income-upload"
                  />
                  <label
                    htmlFor="income-upload"
                    className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors cursor-pointer"
                  >
                    Choose File
                  </label>
                </div>

                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-cashub-500 transition-colors">
                  <Home className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-neutral-900 mb-1">Upload Proof of Address</p>
                  <p className="text-xs text-neutral-500 mb-3">Utility bill or bank statement</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'proof_of_address')}
                    className="hidden"
                    id="address-upload"
                  />
                  <label
                    htmlFor="address-upload"
                    className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors cursor-pointer"
                  >
                    Choose File
                  </label>
                </div>

                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-cashub-500 transition-colors">
                  <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-neutral-900 mb-1">Enhanced Documents</p>
                  <p className="text-xs text-neutral-500 mb-3">Tax clearance, credit reports</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'enhanced_dd')}
                    className="hidden"
                    id="enhanced-upload"
                  />
                  <label
                    htmlFor="enhanced-upload"
                    className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors cursor-pointer"
                  >
                    Choose File
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-neutral-900 mb-4">Uploaded Documents</h4>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(doc.status)}
                      <div>
                        <p className="font-medium text-neutral-900">{doc.name}</p>
                        <p className="text-sm text-neutral-500">
                          Uploaded: {doc.uploadDate} • Type: {doc.type.replace('_', ' ')}
                        </p>
                        {doc.metadata && (
                          <div className="text-xs text-neutral-400 mt-1">
                            {Object.entries(doc.metadata).map(([key, value]) => (
                              <span key={key} className="mr-3">
                                {key}: {JSON.stringify(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                        {doc.status.toUpperCase()}
                      </span>
                      <button className="text-cashub-600 hover:text-cashub-900">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                </div>
                <p className="text-neutral-600 mb-3">{level.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-neutral-900 mb-2">Requirements:</h4>
                    <ul className="space-y-1">
                      {level.requirements.map((req, index) => (
                        <li key={index} className="flex items-center text-sm text-neutral-600">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            level.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-neutral-900 mb-2">Benefits:</h4>
                    <ul className="space-y-1">
                      {level.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center text-sm text-neutral-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {level.completedAt && (
                  <p className="text-sm text-green-600 mt-3">
                    Completed on {new Date(level.completedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            {level.status === 'pending' && (
              <button className="px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors">
                Start Verification
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* Documents Tab */}
{activeTab === 'documents' && (
  <div className="p-6">
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Upload Documents</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-cashub-500 transition-colors">
          <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-neutral-900 mb-1">Upload ID Document</p>
          <p className="text-xs text-neutral-500 mb-3">National ID, Passport, or Driver's License</p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'id_document')}
            className="hidden"
            id="id-upload"
          />
          <label
            htmlFor="id-upload"
            className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors cursor-pointer"
          >
            Choose File
          </label>
        </div>

        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-cashub-500 transition-colors">
          <DollarSign className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-neutral-900 mb-1">Upload Proof of Income</p>
          <p className="text-xs text-neutral-500 mb-3">Latest payslip or income statement</p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'proof_of_income')}
            className="hidden"
            id="income-upload"
          />
          <label
            htmlFor="income-upload"
            className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors cursor-pointer"
          >
            Choose File
          </label>
        </div>

        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-cashub-500 transition-colors">
          <Home className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-neutral-900 mb-1">Upload Proof of Address</p>
          <p className="text-xs text-neutral-500 mb-3">Utility bill or bank statement</p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'proof_of_address')}
            className="hidden"
            id="address-upload"
          />
          <label
            htmlFor="address-upload"
            className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors cursor-pointer"
          >
            Choose File
          </label>
        </div>

        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-cashub-500 transition-colors">
          <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-neutral-900 mb-1">Enhanced Documents</p>
          <p className="text-xs text-neutral-500 mb-3">Tax clearance, credit reports</p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'enhanced_dd')}
            className="hidden"
            id="enhanced-upload"
          />
          <label
            htmlFor="enhanced-upload"
            className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors cursor-pointer"
          >
            Choose File
          </label>
        </div>
      </div>
    </div>

    <div>
      <h4 className="font-medium text-neutral-900 mb-4">Uploaded Documents</h4>
      <div className="space-y-3">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(doc.status)}
              <div>
                <p className="font-medium text-neutral-900">{doc.name}</p>
                <p className="text-sm text-neutral-500">
                  Uploaded: {doc.uploadDate} • Type: {doc.type.replace('_', ' ')}
                </p>
                {doc.metadata && (
                  <div className="text-xs text-neutral-400 mt-1">
                    {Object.entries(doc.metadata).map(([key, value]) => (
                      <span key={key} className="mr-3">
                        {key}: {JSON.stringify(value)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                {doc.status.toUpperCase()}
              </span>
              <button className="text-cashub-600 hover:text-cashub-900">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

{/* Live Verification Tab */}
{activeTab === 'verification' && (
  <div className="p-6">
    <div className="text-center">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Live Selfie Verification</h3>
      <p className="text-neutral-600 mb-6">
        Take a live photo to verify your identity. This helps prevent fraud and ensures your account security.
      </p>

      {!cameraStream && !capturedImage && (
        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-12">
          <Camera className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600 mb-4">Click below to start camera verification</p>
          <button
            onClick={() => {
              setShowCameraModal(true)
              startCamera()
            }}
            className="inline-flex items-center px-6 py-3 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors"
          >
            <Camera className="w-5 h-5 mr-2" />
            Start Camera
          </button>
        </div>
      )}

      {capturedImage && (
        <div className="max-w-md mx-auto">
          <img src={capturedImage} alt="Captured" className="w-full rounded-lg mb-4" />
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => {
                setCapturedImage(null)
                startCamera()
              }}
              className="inline-flex items-center px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retake
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors">
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Camera Modal */}
    {showCameraModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Camera Verification</h3>
            <button
              onClick={() => {
                setShowCameraModal(false)
                stopCamera()
              }}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="relative bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-96 object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={capturePhoto}
              className="inline-flex items-center px-6 py-3 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors"
            >
              <Camera className="w-5 h-5 mr-2" />
              Capture Photo
            </button>
            <button
              onClick={() => {
                setShowCameraModal(false)
                stopCamera()
              }}
              className="inline-flex items-center px-6 py-3 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Verification Tips:</strong> Ensure good lighting, face the camera directly, and remove any accessories that obscure your face.
            </p>
          </div>
        </div>
      </div>
    )}
  </div>
)}

{/* Document Authentication Tab */}
{activeTab === 'authentication' && (
  <div className="p-6">
    <DocumentAuthentication />
  </div>
)}
</div>
</div>
