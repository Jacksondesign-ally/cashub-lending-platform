import React, { useState } from 'react';
import { 
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Download,
  Eye,
  MessageSquare,
  FileText,
  User,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  Info
} from 'lucide-react';

const BlacklistDispute = () => {
  const [activeView, setActiveView] = useState('blacklist');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [newBlacklist, setNewBlacklist] = useState({
    borrowerId: '',
    reasonCode: '',
    reasonDescription: '',
    visibility: 'SHARED',
    evidence: []
  });

  const [newDispute, setNewDispute] = useState({
    disputeReason: '',
    evidence: []
  });

  // Blacklist records
  const blacklistRecords = [
    {
      id: 'BL-2024-001',
      borrower: {
        firstName: 'Michael',
        lastName: 'Johnson',
        idNumber: '88050312345',
        phone: '+264814567890',
        email: 'michael.j@email.com'
      },
      lender: 'ABC Microfinance',
      reasonCode: 'DEFAULT',
      reasonDescription: 'Failed to repay loan of NAD 45,000. Multiple payment reminders sent with no response.',
      status: 'CONFIRMED',
      dateBlacklisted: '2024-01-15',
      visibility: 'SHARED',
      outstandingAmount: 45000,
      evidence: [
        { id: 1, type: 'CONTRACT', fileName: 'loan_agreement_2023.pdf', uploadDate: '2024-01-15' },
        { id: 2, type: 'PAYMENT_HISTORY', fileName: 'payment_records.pdf', uploadDate: '2024-01-15' },
        { id: 3, type: 'COMMUNICATION', fileName: 'reminder_emails.pdf', uploadDate: '2024-01-15' }
      ],
      hasDispute: false
    },
    {
      id: 'BL-2024-002',
      borrower: {
        firstName: 'Sarah',
        lastName: 'Williams',
        idNumber: '92030456789',
        phone: '+264815678901',
        email: 'sarah.w@email.com'
      },
      lender: 'XYZ Credit Services',
      reasonCode: 'FRAUD',
      reasonDescription: 'Provided falsified employment documents and bank statements during loan application.',
      status: 'DISPUTED',
      dateBlacklisted: '2024-01-10',
      visibility: 'SHARED',
      outstandingAmount: 0,
      evidence: [
        { id: 1, type: 'COURT_DOC', fileName: 'fraud_report.pdf', uploadDate: '2024-01-10' },
        { id: 2, type: 'OTHER', fileName: 'investigation_summary.pdf', uploadDate: '2024-01-10' }
      ],
      hasDispute: true,
      dispute: {
        id: 'DS-2024-001',
        status: 'UNDER_REVIEW',
        disputeReason: 'Documents were genuine. Error in verification process.',
        createdAt: '2024-01-12',
        evidence: [
          { fileName: 'original_documents.pdf', uploadDate: '2024-01-12' },
          { fileName: 'employer_verification.pdf', uploadDate: '2024-01-12' }
        ]
      }
    },
    {
      id: 'BL-2024-003',
      borrower: {
        firstName: 'David',
        lastName: 'Brown',
        idNumber: '85070198765',
        phone: '+264816789012',
        email: 'david.b@email.com'
      },
      lender: 'Quick Loans Ltd',
      reasonCode: 'ABSCONDED',
      reasonDescription: 'Borrower relocated without notice and cannot be contacted. Outstanding balance unpaid.',
      status: 'PENDING',
      dateBlacklisted: '2024-01-20',
      visibility: 'PRIVATE',
      outstandingAmount: 28000,
      evidence: [
        { id: 1, type: 'COMMUNICATION', fileName: 'failed_contact_attempts.pdf', uploadDate: '2024-01-20' }
      ],
      hasDispute: false
    },
    {
      id: 'BL-2024-004',
      borrower: {
        firstName: 'Emma',
        lastName: 'Davis',
        idNumber: '90010567890',
        phone: '+264817890123',
        email: 'emma.d@email.com'
      },
      lender: 'ABC Microfinance',
      reasonCode: 'DEFAULT',
      reasonDescription: 'Partial default on NAD 15,000 loan. Recently made partial payment.',
      status: 'CLEARED',
      dateBlacklisted: '2023-11-05',
      clearedDate: '2024-01-18',
      visibility: 'SHARED',
      outstandingAmount: 0,
      originalAmount: 15000,
      evidence: [
        { id: 1, type: 'CONTRACT', fileName: 'loan_contract.pdf', uploadDate: '2023-11-05' }
      ],
      hasDispute: false,
      clearance: {
        amountPaid: 15000,
        paymentDate: '2024-01-15',
        paymentReference: 'PAY-2024-789'
      }
    }
  ];

  // Disputes
  const disputes = blacklistRecords.filter(r => r.hasDispute).map(r => ({
    ...r.dispute,
    blacklistId: r.id,
    borrower: r.borrower,
    lender: r.lender,
    reasonCode: r.reasonCode
  }));

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      CONFIRMED: 'bg-red-500/20 text-red-300 border-red-500/30',
      DISPUTED: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      CLEARED: 'bg-green-500/20 text-green-300 border-green-500/30',
      UNDER_REVIEW: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      RESOLVED: 'bg-green-500/20 text-green-300 border-green-500/30',
      REJECTED: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getReasonColor = (code) => {
    const colors = {
      DEFAULT: 'text-red-400',
      FRAUD: 'text-orange-400',
      MISREPRESENTATION: 'text-yellow-400',
      ABSCONDED: 'text-purple-400',
      COURT_ORDER: 'text-blue-400'
    };
    return colors[code] || 'text-gray-400';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'CONFIRMED': return <XCircle size={20} />;
      case 'CLEARED': return <CheckCircle size={20} />;
      case 'PENDING': return <Clock size={20} />;
      case 'DISPUTED': return <AlertCircle size={20} />;
      default: return <Info size={20} />;
    }
  };

  const filteredRecords = blacklistRecords.filter(record => {
    const matchesSearch = 
      record.borrower.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.borrower.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.borrower.idNumber.includes(searchQuery) ||
      record.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Total Blacklisted', value: blacklistRecords.length, icon: Shield, color: 'from-red-500 to-pink-500' },
    { label: 'Active Disputes', value: disputes.filter(d => d.status === 'UNDER_REVIEW').length, icon: MessageSquare, color: 'from-orange-500 to-yellow-500' },
    { label: 'Cleared', value: blacklistRecords.filter(r => r.status === 'CLEARED').length, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
    { label: 'Pending Evidence', value: blacklistRecords.filter(r => r.status === 'PENDING').length, icon: Clock, color: 'from-blue-500 to-cyan-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Shield size={40} />
                Blacklist & Dispute Management
              </h1>
              <p className="text-purple-200">Manage borrower blacklist registry and dispute resolution</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              Add to Blacklist
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} inline-block mb-4`}>
                <stat.icon className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-purple-200 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 mb-6">
          <div className="border-b border-white/20 px-6">
            <div className="flex gap-6">
              {[
                { id: 'blacklist', name: 'Blacklist Registry', icon: Shield },
                { id: 'disputes', name: 'Disputes', icon: MessageSquare }
              ].map(tab => (
                <button
                  onClick={() => {
                    alert('Blacklist record created');
                    setShowAddModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all shadow-lg"
                >
                  Add to Blacklist
                </button>
              </div>
            </div>
          </div>
        )}

        {/* File Dispute Modal */}
        {showDisputeModal && selectedRecord && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl shadow-2xl border border-white/20 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">File Dispute</h2>

              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <h3 className="text-white font-semibold mb-3">Blacklist Record Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-purple-200">Record ID:</p>
                    <p className="text-white font-medium">{selectedRecord.id}</p>
                  </div>
                  <div>
                    <p className="text-purple-200">Borrower:</p>
                    <p className="text-white font-medium">{selectedRecord.borrower.firstName} {selectedRecord.borrower.lastName}</p>
                  </div>
                  <div>
                    <p className="text-purple-200">Reason:</p>
                    <p className="text-white font-medium">{selectedRecord.reasonCode}</p>
                  </div>
                  <div>
                    <p className="text-purple-200">Date:</p>
                    <p className="text-white font-medium">{selectedRecord.dateBlacklisted}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Dispute Reason <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={newDispute.disputeReason}
                    onChange={(e) => setNewDispute({ ...newDispute, disputeReason: e.target.value })}
                    rows={4}
                    placeholder="Explain why you believe this blacklist entry is incorrect..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Upload Supporting Evidence
                  </label>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      id="dispute-evidence-upload"
                    />
                    <label htmlFor="dispute-evidence-upload" className="cursor-pointer">
                      <div className="text-center">
                        <Upload className="mx-auto mb-2 text-purple-300" size={32} />
                        <p className="text-white font-medium mb-1">Click to upload documents</p>
                        <p className="text-purple-200 text-sm">Payment receipts, communications, agreements, etc.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="text-blue-300 flex-shrink-0" size={20} />
                    <div className="text-blue-200 text-sm">
                      <p className="font-semibold mb-1">Dispute Process:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Your dispute will be reviewed within 5-7 business days</li>
                        <li>Both parties will be notified of the outcome</li>
                        <li>During review, the blacklist entry will be marked as "DISPUTED"</li>
                        <li>You may be contacted for additional information</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Dispute filed successfully');
                    setShowDisputeModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 rounded-lg text-white font-medium transition-all shadow-lg"
                >
                  File Dispute
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {selectedRecord && !showDisputeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl shadow-2xl border border-white/20 p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">Blacklist Record Details</h2>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-purple-300 hover:text-purple-100"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Borrower Information */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User size={20} />
                  Borrower Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-purple-200">Full Name:</p>
                    <p className="text-white font-medium">{selectedRecord.borrower.firstName} {selectedRecord.borrower.lastName}</p>
                  </div>
                  <div>
                    <p className="text-purple-200">ID Number:</p>
                    <p className="text-white font-medium">{selectedRecord.borrower.idNumber}</p>
                  </div>
                  <div>
                    <p className="text-purple-200">Phone:</p>
                    <p className="text-white font-medium">{selectedRecord.borrower.phone}</p>
                  </div>
                  <div>
                    <p className="text-purple-200">Email:</p>
                    <p className="text-white font-medium">{selectedRecord.borrower.email}</p>
                  </div>
                </div>
              </div>

              {/* Blacklist Details */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield size={20} />
                  Blacklist Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Record ID:</span>
                    <span className="text-white font-medium">{selectedRecord.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Lender:</span>
                    <span className="text-white font-medium">{selectedRecord.lender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Date Blacklisted:</span>
                    <span className="text-white font-medium">{selectedRecord.dateBlacklisted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Status:</span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedRecord.status)}`}>
                      {selectedRecord.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Visibility:</span>
                    <span className="text-white font-medium">{selectedRecord.visibility}</span>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-purple-200 mb-2">Reason Code:</p>
                    <span className={`px-3 py-1 text-sm font-semibold rounded ${getReasonColor(selectedRecord.reasonCode)}`}>
                      {selectedRecord.reasonCode}
                    </span>
                  </div>
                  <div>
                    <p className="text-purple-200 mb-2">Description:</p>
                    <p className="text-white bg-white/5 p-3 rounded">{selectedRecord.reasonDescription}</p>
                  </div>
                  {selectedRecord.outstandingAmount > 0 && (
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200">Outstanding Amount:</span>
                        <span className="text-red-400 font-bold text-lg">NAD {selectedRecord.outstandingAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Evidence Files */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Evidence Files ({selectedRecord.evidence.length})
                </h3>
                <div className="space-y-2">
                  {selectedRecord.evidence.map((file) => (
                    <div key={file.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="text-purple-300" size={20} />
                        <div>
                          <p className="text-white font-medium text-sm">{file.fileName}</p>
                          <p className="text-purple-200 text-xs">{file.type} • Uploaded: {file.uploadDate}</p>
                        </div>
                      </div>
                      <button className="text-purple-300 hover:text-purple-100">
                        <Download size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit Trail */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity size={20} />
                  Audit Trail
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 pb-3 border-b border-white/10">
                    <Clock className="text-purple-300 flex-shrink-0 mt-1" size={16} />
                    <div>
                      <p className="text-white text-sm">Blacklist created</p>
                      <p className="text-purple-200 text-xs">{selectedRecord.dateBlacklisted}</p>
                    </div>
                  </div>
                  {selectedRecord.evidence.map((file, idx) => (
                    <div key={idx} className="flex items-start gap-3 pb-3 border-b border-white/10 last:border-0">
                      <Upload className="text-purple-300 flex-shrink-0 mt-1" size={16} />
                      <div>
                        <p className="text-white text-sm">Evidence uploaded: {file.type}</p>
                        <p className="text-purple-200 text-xs">{file.uploadDate}</p>
                      </div>
                    </div>
                  ))}
                  {selectedRecord.hasDispute && (
                    <div className="flex items-start gap-3 pb-3 border-b border-white/10">
                      <MessageSquare className="text-orange-400 flex-shrink-0 mt-1" size={16} />
                      <div>
                        <p className="text-white text-sm">Dispute filed</p>
                        <p className="text-purple-200 text-xs">{selectedRecord.dispute.createdAt}</p>
                      </div>
                    </div>
                  )}
                  {selectedRecord.status === 'CLEARED' && (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={16} />
                      <div>
                        <p className="text-white text-sm">Blacklist cleared</p>
                        <p className="text-purple-200 text-xs">{selectedRecord.clearedDate}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all"
                >
                  Close
                </button>
                <button className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-all flex items-center gap-2">
                  <Download size={18} />
                  Export Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlacklistDispute;
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`py-4 px-2 font-medium border-b-2 flex items-center gap-2 ${
                    activeView === tab.id
                      ? 'border-purple-400 text-white'
                      : 'border-transparent text-purple-200 hover:text-white'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, ID, or record number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
              >
                <option value="all" className="bg-slate-800">All Status</option>
                <option value="PENDING" className="bg-slate-800">Pending</option>
                <option value="CONFIRMED" className="bg-slate-800">Confirmed</option>
                <option value="DISPUTED" className="bg-slate-800">Disputed</option>
                <option value="CLEARED" className="bg-slate-800">Cleared</option>
              </select>
              <button className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all flex items-center justify-center gap-2">
                <Filter size={18} />
                More Filters
              </button>
            </div>

            {/* Blacklist Registry Tab */}
            {activeView === 'blacklist' && (
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <div key={record.id} className="bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">
                              {record.borrower.firstName} {record.borrower.lastName}
                            </h3>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${getStatusColor(record.status)}`}>
                              {getStatusIcon(record.status)}
                              {record.status}
                            </span>
                            {record.visibility === 'SHARED' ? (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs rounded-full flex items-center gap-1">
                                <Unlock size={12} />
                                SHARED
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-500/20 text-gray-300 border border-gray-500/30 text-xs rounded-full flex items-center gap-1">
                                <Lock size={12} />
                                PRIVATE
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                            <div>
                              <p className="text-purple-200">ID Number</p>
                              <p className="text-white font-medium">{record.borrower.idNumber}</p>
                            </div>
                            <div>
                              <p className="text-purple-200">Record ID</p>
                              <p className="text-white font-medium">{record.id}</p>
                            </div>
                            <div>
                              <p className="text-purple-200">Date Blacklisted</p>
                              <p className="text-white font-medium">{record.dateBlacklisted}</p>
                            </div>
                            <div>
                              <p className="text-purple-200">Lender</p>
                              <p className="text-white font-medium">{record.lender}</p>
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4 mb-3">
                            <div className="flex items-start gap-2 mb-2">
                              <span className={`px-2 py-1 text-xs font-semibold rounded ${getReasonColor(record.reasonCode)}`}>
                                {record.reasonCode}
                              </span>
                            </div>
                            <p className="text-purple-100 text-sm">{record.reasonDescription}</p>
                          </div>
                          {record.outstandingAmount > 0 && (
                            <div className="flex items-center gap-2 text-red-400">
                              <DollarSign size={16} />
                              <span className="font-semibold">Outstanding: NAD {record.outstandingAmount.toLocaleString()}</span>
                            </div>
                          )}
                          {record.status === 'CLEARED' && record.clearance && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mt-3">
                              <div className="flex items-center gap-2 text-green-300 mb-1">
                                <CheckCircle size={16} />
                                <span className="font-semibold">Cleared on {record.clearedDate}</span>
                              </div>
                              <p className="text-green-200 text-sm">
                                Payment of NAD {record.clearance.amountPaid.toLocaleString()} received. 
                                Reference: {record.clearance.paymentReference}
                              </p>
                            </div>
                          )}
                          {record.hasDispute && (
                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mt-3">
                              <div className="flex items-center gap-2 text-orange-300">
                                <AlertCircle size={16} />
                                <span className="font-semibold">Active Dispute - {record.dispute.status}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2"
                          >
                            <Eye size={16} />
                            View Details
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-purple-200 text-sm">
                              <FileText size={16} />
                              <span>{record.evidence.length} Evidence Files</span>
                            </div>
                            {record.borrower.phone && (
                              <div className="flex items-center gap-2 text-purple-200 text-sm">
                                <Phone size={16} />
                                <span>{record.borrower.phone}</span>
                              </div>
                            )}
                            {record.borrower.email && (
                              <div className="flex items-center gap-2 text-purple-200 text-sm">
                                <Mail size={16} />
                                <span>{record.borrower.email}</span>
                              </div>
                            )}
                          </div>
                          {!record.hasDispute && record.status !== 'CLEARED' && (
                            <button
                              onClick={() => {
                                setSelectedRecord(record);
                                setShowDisputeModal(true);
                              }}
                              className="text-purple-300 hover:text-purple-100 text-sm font-medium flex items-center gap-1"
                            >
                              <MessageSquare size={16} />
                              File Dispute (Borrower)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Disputes Tab */}
            {activeView === 'disputes' && (
              <div className="space-y-4">
                {disputes.length > 0 ? (
                  disputes.map((dispute) => (
                    <div key={dispute.id} className="bg-white/5 rounded-lg border border-white/10 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">
                              Dispute {dispute.id}
                            </h3>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(dispute.status)}`}>
                              {dispute.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                            <div>
                              <p className="text-purple-200">Borrower</p>
                              <p className="text-white font-medium">{dispute.borrower.firstName} {dispute.borrower.lastName}</p>
                            </div>
                            <div>
                              <p className="text-purple-200">Blacklist Record</p>
                              <p className="text-white font-medium">{dispute.blacklistId}</p>
                            </div>
                            <div>
                              <p className="text-purple-200">Filed Date</p>
                              <p className="text-white font-medium">{dispute.createdAt}</p>
                            </div>
                            <div>
                              <p className="text-purple-200">Lender</p>
                              <p className="text-white font-medium">{dispute.lender}</p>
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4 mb-3">
                            <p className="text-purple-200 text-xs mb-1">Dispute Reason:</p>
                            <p className="text-white">{dispute.disputeReason}</p>
                          </div>
                          <div className="flex items-center gap-2 text-purple-200 text-sm">
                            <FileText size={16} />
                            <span>{dispute.evidence.length} Evidence Files Submitted</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition-all">
                            Resolve
                          </button>
                          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-all">
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto mb-4 text-purple-300" size={48} />
                    <p className="text-purple-200">No active disputes</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add to Blacklist Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl shadow-2xl border border-white/20 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Add to Blacklist</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Borrower ID Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newBlacklist.borrowerId}
                    onChange={(e) => setNewBlacklist({ ...newBlacklist, borrowerId: e.target.value })}
                    placeholder="Enter ID number"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Reason Code <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={newBlacklist.reasonCode}
                    onChange={(e) => setNewBlacklist({ ...newBlacklist, reasonCode: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="" className="bg-slate-800">Select reason...</option>
                    <option value="DEFAULT" className="bg-slate-800">Default</option>
                    <option value="FRAUD" className="bg-slate-800">Fraud</option>
                    <option value="MISREPRESENTATION" className="bg-slate-800">Misrepresentation</option>
                    <option value="ABSCONDED" className="bg-slate-800">Absconded</option>
                    <option value="COURT_ORDER" className="bg-slate-800">Court Order</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Detailed Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={newBlacklist.reasonDescription}
                    onChange={(e) => setNewBlacklist({ ...newBlacklist, reasonDescription: e.target.value })}
                    rows={4}
                    placeholder="Provide detailed explanation..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Visibility <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={newBlacklist.visibility}
                    onChange={(e) => setNewBlacklist({ ...newBlacklist, visibility: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="SHARED" className="bg-slate-800">Shared (Visible to all lenders)</option>
                    <option value="PRIVATE" className="bg-slate-800">Private (Only this institution)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Upload Evidence <span className="text-red-400">*</span>
                  </label>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      id="evidence-upload"
                    />
                    <label htmlFor="evidence-upload" className="cursor-pointer">
                      <div className="text-center">
                        <Upload className="mx-auto mb-2 text-purple-300" size={32} />
                        <p className="text-white font-medium mb-1">Click to upload evidence</p>
                        <p className="text-purple-200 text-sm">Contract, payment history, communications, etc.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="text-red-300 flex-shrink-0" size={20} />
                    <div className="text-red-200 text-sm">
                      <p className="font-semibold mb-1">Important:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>At least one evidence file must be uploaded</li>
                        <li>Blacklist cannot be confirmed without evidence</li>
                        <li>False reporting may result in legal action</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all"
                >
                  Cancel
                </button>
                <button