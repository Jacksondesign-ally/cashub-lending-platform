"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react'

interface KYCDocument {
  id: string
  borrower_email: string
  borrower_id?: string
  document_type: string
  document_name: string
  file_data: string
  file_size: number
  status: string
  created_at: string
  notes?: string
  borrower?: { first_name: string; last_name: string }
}

export default function KYCReviewPage() {
  const [documents, setDocuments] = useState<KYCDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending')
  const [selectedDoc, setSelectedDoc] = useState<KYCDocument | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewing, setReviewing] = useState(false)

  useEffect(() => { fetchDocuments() }, [filter])

  const fetchDocuments = async () => {
    setLoading(true)
    let query = supabase
      .from('borrower_documents')
      .select('*, borrower:borrower_id(first_name, last_name)')
      .order('created_at', { ascending: false })
    
    if (filter !== 'all') query = query.eq('status', filter)
    
    const { data } = await query
    setDocuments(data || [])
    setLoading(false)
  }

  const handleReview = async (docId: string, newStatus: 'verified' | 'rejected') => {
    setReviewing(true)
    const adminEmail = localStorage.getItem('userName') || 'admin'
    await supabase.from('borrower_documents').update({
      status: newStatus,
      reviewed_by: adminEmail,
      reviewed_at: new Date().toISOString(),
      notes: reviewNotes || null,
    }).eq('id', docId)
    setSelectedDoc(null)
    setReviewNotes('')
    fetchDocuments()
    setReviewing(false)
  }

  const DOC_TYPE_LABELS: Record<string, string> = {
    id: 'National ID / Passport',
    payslip: 'Latest Payslip',
    bank: 'Bank Statement',
    residence: 'Proof of Residence',
    identity: 'Identity Document',
    income: 'Income Proof',
  }

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    verified: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">KYC Document Review</h2>
        <p className="text-neutral-500 text-sm">Review and approve borrower KYC documents</p>
      </div>

      <div className="flex gap-2">
        {(['all', 'pending', 'verified', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === f ? 'bg-cashub-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({documents.filter(d => f === 'all' || d.status === f).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cashub-600" />
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <FileText className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">No documents to review</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-neutral-900">{doc.borrower?.first_name} {doc.borrower?.last_name}</p>
                  <p className="text-xs text-neutral-500">{doc.borrower_email}</p>
                  <p className="text-xs text-neutral-600 mt-1 font-medium">{DOC_TYPE_LABELS[doc.document_type] || doc.document_type}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[doc.status] || 'bg-gray-100 text-gray-600'}`}>
                  {doc.status.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-neutral-400 mb-3">
                <p>File: {doc.document_name}</p>
                <p>Size: {(doc.file_size / 1024).toFixed(1)} KB</p>
                <p>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedDoc(doc)}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all">
                  <Eye className="w-3.5 h-3.5" /> Review
                </button>
                <a href={doc.file_data} download={doc.document_name}
                  className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center justify-center">
                  <Download className="w-3.5 h-3.5 text-neutral-600" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900">Review Document</h3>
              <p className="text-sm text-neutral-500">{selectedDoc.borrower?.first_name} {selectedDoc.borrower?.last_name} · {selectedDoc.borrower_email}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-1">Document Type</p>
                <p className="text-sm text-neutral-900">{DOC_TYPE_LABELS[selectedDoc.document_type] || selectedDoc.document_type}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-2">Document Preview</p>
                {selectedDoc.file_data.startsWith('data:image') ? (
                  <img src={selectedDoc.file_data} alt="Document" className="w-full rounded-lg border border-neutral-200" />
                ) : selectedDoc.file_data.startsWith('data:application/pdf') ? (
                  <iframe src={selectedDoc.file_data} className="w-full h-96 rounded-lg border border-neutral-200" />
                ) : (
                  <p className="text-sm text-neutral-500">Preview not available. <a href={selectedDoc.file_data} download={selectedDoc.document_name} className="text-blue-600 underline">Download file</a></p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Review Notes (optional)</label>
                <textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)}
                  rows={3} placeholder="Add any notes about this document..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
              </div>
            </div>
            <div className="p-6 border-t border-neutral-200 flex gap-3">
              <button onClick={() => { setSelectedDoc(null); setReviewNotes('') }}
                className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-sm font-semibold transition-all">
                Cancel
              </button>
              <button onClick={() => handleReview(selectedDoc.id, 'rejected')} disabled={reviewing}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button onClick={() => handleReview(selectedDoc.id, 'verified')} disabled={reviewing}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
