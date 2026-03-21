import React, { useState, useRef } from 'react'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Search, 
  Camera, 
  Upload, 
  FileText, 
  Eye, 
  Download, 
  RefreshCw,
  Zap,
  Database,
  Clock,
  MapPin,
  User,
  Building,
  TrendingUp,
  TrendingDown,
  Info,
  AlertCircle,
  Star,
  BarChart3,
  Filter,
  Settings
} from 'lucide-react'

interface DocumentAnalysis {
  id: string
  fileName: string
  documentType: 'payslip' | 'id_document' | 'bank_statement' | 'proof_of_address' | 'employment_letter'
  uploadDate: string
  uploadedBy: string
  borrowerId: string
  borrowerName: string
  authenticityScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  verificationStatus: 'pending' | 'verified' | 'suspicious' | 'rejected'
  analysisResults: AnalysisResult[]
  suspiciousIndicators: SuspiciousIndicator[]
  metadata: DocumentMetadata
  actions: DocumentAction[]
}

interface AnalysisResult {
  type: 'format' | 'content' | 'metadata' | 'cross_reference' | 'ai_analysis'
  category: string
  result: 'pass' | 'warning' | 'fail'
  confidence: number
  details: string
  recommendation: string
}

interface SuspiciousIndicator {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'manipulation' | 'forgery' | 'inconsistency' | 'pattern' | 'external'
  description: string
  evidence: string
  confidence: number
  requiresReview: boolean
}

interface DocumentMetadata {
  fileSize: number
  fileType: string
  dimensions?: { width: number; height: number }
  creationDate: string
  modificationDate: string
  exifData?: any
  digitalSignature?: boolean
  watermark?: boolean
  compressionLevel?: number
}

interface DocumentAction {
  type: 'verify' | 'flag' | 'approve' | 'reject' | 'request_resubmission'
  performedBy: string
  performedAt: string
  notes: string
}

interface FraudPattern {
  id: string
  pattern: string
  description: string
  frequency: number
  riskScore: number
  detectedIn: string[]
  lastDetected: string
}

export default function DocumentAuthentication() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis' | 'patterns' | 'settings'>('dashboard')
  const [documents, setDocuments] = useState<DocumentAnalysis[]>([])
  const [selectedDocument, setSelectedDocument] = useState<DocumentAnalysis | null>(null)
  const [fraudPatterns, setFraudPatterns] = useState<FraudPattern[]>([])
  const [loading, setLoading] = useState(true)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)

  useEffect(() => {
    fetchDocumentAnalysis()
    fetchFraudPatterns()
  }, [])

  const fetchDocumentAnalysis = async () => {
    try {
      setLoading(true)
      
      // Mock document analysis data
      const mockDocuments: DocumentAnalysis[] = [
        {
          id: '1',
          fileName: 'payslip_january_2024.pdf',
          documentType: 'payslip',
          uploadDate: '2024-01-15T10:30:00Z',
          uploadedBy: 'john.smith@email.com',
          borrowerId: 'borrower1',
          borrowerName: 'John Smith',
          authenticityScore: 92,
          riskLevel: 'low',
          verificationStatus: 'verified',
          analysisResults: [
            {
              type: 'format',
              category: 'Document Structure',
              result: 'pass',
              confidence: 95,
              details: 'Standard payslip format detected',
              recommendation: 'Document appears authentic'
            },
            {
              type: 'content',
              category: 'Company Information',
              result: 'pass',
              confidence: 88,
              details: 'Company details match registered business',
              recommendation: 'Company verification passed'
            },
            {
              type: 'cross_reference',
              category: 'Cross-Reference Check',
              result: 'pass',
              confidence: 92,
              details: 'Matches previous payslip patterns',
              recommendation: 'Consistent with historical data'
            }
          ],
          suspiciousIndicators: [],
          metadata: {
            fileSize: 245760,
            fileType: 'application/pdf',
            creationDate: '2024-01-10T08:00:00Z',
            modificationDate: '2024-01-10T08:00:00Z',
            digitalSignature: false,
            watermark: false
          },
          actions: [
            {
              type: 'verify',
              performedBy: 'system@cashub.com',
              performedAt: '2024-01-15T10:35:00Z',
              notes: 'Automated verification completed'
            }
          ]
        },
        {
          id: '2',
          fileName: 'id_document_suspicious.jpg',
          documentType: 'id_document',
          uploadDate: '2024-01-15T14:20:00Z',
          uploadedBy: 'suspicious.user@email.com',
          borrowerId: 'borrower2',
          borrowerName: 'Suspicious User',
          authenticityScore: 45,
          riskLevel: 'critical',
          verificationStatus: 'suspicious',
          analysisResults: [
            {
              type: 'format',
              category: 'Document Structure',
              result: 'fail',
              confidence: 78,
              details: 'Unusual document dimensions detected',
              recommendation: 'Manual review required'
            },
            {
              type: 'ai_analysis',
              category: 'AI Pattern Recognition',
              result: 'fail',
              confidence: 85,
              details: 'Digital manipulation detected in photo region',
              recommendation: 'High probability of forgery'
            },
            {
              type: 'metadata',
              category: 'EXIF Analysis',
              result: 'warning',
              confidence: 72,
              details: 'Metadata inconsistencies found',
              recommendation: 'Document may be altered'
            }
          ],
          suspiciousIndicators: [
            {
              id: '1',
              severity: 'critical',
              category: 'manipulation',
              description: 'Digital tampering detected in photo area',
              evidence: 'Pixel analysis shows cloning patterns',
              confidence: 85,
              requiresReview: true
            },
            {
              id: '2',
              severity: 'high',
              category: 'inconsistency',
              description: 'Font inconsistencies in text fields',
              evidence: 'Multiple font types detected in same document',
              confidence: 78,
              requiresReview: true
            }
          ],
          metadata: {
            fileSize: 524288,
            fileType: 'image/jpeg',
            dimensions: { width: 1200, height: 800 },
            creationDate: '2024-01-14T16:45:00Z',
            modificationDate: '2024-01-14T16:45:00Z',
            exifData: {
              camera: 'Adobe Photoshop',
              software: 'Adobe Photoshop CS6'
            },
            digitalSignature: false,
            watermark: false
          },
          actions: [
            {
              type: 'flag',
              performedBy: 'ai.system@cashub.com',
              performedAt: '2024-01-15T14:25:00Z',
              notes: 'Auto-flagged for manual review due to suspicious indicators'
            }
          ]
        }
      ]

      setDocuments(mockDocuments)
    } catch (error) {
      console.error('Error fetching document analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFraudPatterns = async () => {
    try {
      // Mock fraud patterns
      const mockPatterns: FraudPattern[] = [
        {
          id: '1',
          pattern: 'Photoshop Metadata',
          description: 'Documents created or modified in Adobe Photoshop',
          frequency: 12,
          riskScore: 85,
          detectedIn: ['id_document', 'payslip'],
          lastDetected: '2024-01-15T14:20:00Z'
        },
        {
          id: '2',
          pattern: 'Font Inconsistency',
          description: 'Multiple font types in same document field',
          frequency: 8,
          riskScore: 72,
          detectedIn: ['id_document', 'bank_statement'],
          lastDetected: '2024-01-14T09:15:00Z'
        },
        {
          id: '3',
          pattern: 'Pixel Cloning',
          description: 'Evidence of digital cloning or copying',
          frequency: 5,
          riskScore: 92,
          detectedIn: ['id_document'],
          lastDetected: '2024-01-15T14:20:00Z'
        }
      ]

      setFraudPatterns(mockPatterns)
    } catch (error) {
      console.error('Error fetching fraud patterns:', error)
    }
  }

  getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800'
      case 'suspicious': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Document Authentication & Fraud Detection</h2>
            <p className="text-neutral-500">AI-powered document verification and suspicious client detection</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">Documents Analyzed</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{documents.length}</p>
              <p className="text-xs text-green-600 mt-1">+24 today</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">Suspicious Detected</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {documents.filter(d => d.verificationStatus === 'suspicious').length}
              </p>
              <p className="text-xs text-red-600 mt-1">Requires review</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">Fraud Patterns</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{fraudPatterns.length}</p>
              <p className="text-xs text-orange-600 mt-1">Active patterns</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">Avg. Authenticity</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {Math.round(documents.reduce((sum, d) => sum + d.authenticityScore, 0) / documents.length)}%
              </p>
              <p className="text-xs text-green-600 mt-1">+5% improvement</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="border-b border-neutral-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-cashub-500 text-cashub-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Document Dashboard
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'analysis'
                  ? 'border-cashub-500 text-cashub-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center">
                <Search className="w-4 h-4 mr-2" />
                Analysis Results
              </div>
            </button>
            <button
              onClick={() => setActiveTab('patterns')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'patterns'
                  ? 'border-cashub-500 text-cashub-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Fraud Patterns
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-cashub-500 text-cashub-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Detection Settings
              </div>
            </button>
          </nav>
        </div>

        {/* Document Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Document Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Document
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Borrower
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Authenticity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Risk Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-neutral-900">{doc.fileName}</div>
                            <div className="text-sm text-neutral-500">{doc.documentType.replace('_', ' ')}</div>
                            <div className="text-xs text-neutral-400">
                              {new Date(doc.uploadDate).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-900">{doc.borrowerName}</div>
                          <div className="text-sm text-neutral-500">{doc.uploadedBy}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`text-lg font-bold ${getScoreColor(doc.authenticityScore)}`}>
                              {doc.authenticityScore}%
                            </span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${
                                doc.authenticityScore >= 80 ? 'bg-green-500' :
                                doc.authenticityScore >= 60 ? 'bg-yellow-500' :
                                doc.authenticityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${doc.authenticityScore}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(doc.riskLevel)}`}>
                            {doc.riskLevel.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.verificationStatus)}`}>
                            {doc.verificationStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedDocument(doc)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowAnalysisModal(true)}
                              className="text-green-600 hover:text-green-900"
                              title="Run Analysis"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results Tab */}
        {activeTab === 'analysis' && selectedDocument && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Analysis Results: {selectedDocument.fileName}
              </h3>
              <p className="text-neutral-500">
                Borrower: {selectedDocument.borrowerName} • 
                Score: {selectedDocument.authenticityScore}% • 
                Risk: {selectedDocument.riskLevel.toUpperCase()}
              </p>
            </div>

            {/* Analysis Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-neutral-900 mb-4">Analysis Results</h4>
                <div className="space-y-3">
                  {selectedDocument.analysisResults.map((result, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${
                      result.result === 'pass' ? 'border-green-200 bg-green-50' :
                      result.result === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                      'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-neutral-900">{result.category}</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          result.result === 'pass' ? 'bg-green-100 text-green-800' :
                          result.result === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {result.result.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">{result.details}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500">Confidence: {result.confidence}%</span>
                        <span className="text-xs text-neutral-500">{result.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suspicious Indicators */}
              <div>
                <h4 className="font-medium text-neutral-900 mb-4">
                  Suspicious Indicators ({selectedDocument.suspiciousIndicators.length})
                </h4>
                {selectedDocument.suspiciousIndicators.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDocument.suspiciousIndicators.map((indicator, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${getRiskColor(indicator.severity)}`}>
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium">{indicator.description}</span>
                          <span className="text-xs font-medium">
                            {indicator.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{indicator.evidence}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Confidence: {indicator.confidence}%</span>
                          <span className="text-xs">Category: {indicator.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p>No suspicious indicators detected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Document Metadata */}
            <div>
              <h4 className="font-medium text-neutral-900 mb-4">Document Metadata</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-neutral-500">File Size</p>
                  <p className="font-medium">{(selectedDocument.metadata.fileSize / 1024).toFixed(1)} KB</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">File Type</p>
                  <p className="font-medium">{selectedDocument.metadata.fileType}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Created</p>
                  <p className="font-medium">{new Date(selectedDocument.metadata.creationDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Digital Signature</p>
                  <p className="font-medium">{selectedDocument.metadata.digitalSignature ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fraud Patterns Tab */}
        {activeTab === 'patterns' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Detected Fraud Patterns</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fraudPatterns.map((pattern) => (
                <div key={pattern.id} className="border border-neutral-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-neutral-900">{pattern.pattern}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      pattern.riskScore >= 80 ? 'bg-red-100 text-red-800' :
                      pattern.riskScore >= 60 ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      Risk: {pattern.riskScore}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-4">{pattern.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Frequency:</span>
                      <span className="font-medium">{pattern.frequency} occurrences</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Last Detected:</span>
                      <span className="font-medium">{new Date(pattern.lastDetected).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Found In:</span>
                      <span className="font-medium">{pattern.detectedIn.join(', ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Detection Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-neutral-900">AI Analysis Settings</h4>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Enable AI-powered detection</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-cashub-600" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Strict mode (higher accuracy)</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-cashub-600" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Auto-flag suspicious documents</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-cashub-600" />
                </label>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-neutral-900">Threshold Settings</h4>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Minimum Authenticity Score (%)
                  </label>
                  <input type="number" defaultValue="70" className="w-full px-3 py-2 border border-neutral-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Suspicious Indicator Threshold
                  </label>
                  <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg">
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-900">Document Analysis Details</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600">Detailed document analysis view</p>
              <p className="text-sm text-neutral-500 mt-2">
                Authenticity: {selectedDocument.authenticityScore}% • Risk: {selectedDocument.riskLevel}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
