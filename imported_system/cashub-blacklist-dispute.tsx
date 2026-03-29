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
  DollarSign,
  Phone,
  Mail,
  Info,
  Lock,
  Unlock
} from 'lucide-react';

const BlacklistDispute = () => {
  const [activeView, setActiveView] = useState('blacklist');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
      reasonDescription: 'Failed to repay loan of NAD 45,000. Multiple payment reminders sent.',
      status: 'CONFIRMED',
      dateBlacklisted: '2024-01-15',
      visibility: 'SHARED',
      outstandingAmount: 45000,
      evidence: [
        { id: 1, type: 'CONTRACT', fileName: 'loan_agreement.pdf', uploadDate: '2024-01-15' },
        { id: 2, type: 'PAYMENT_HISTORY', fileName: 'payment_records.pdf', uploadDate: '2024-01-15' }
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
      lender: 'XYZ Credit',
      reasonCode: 'FRAUD',
      reasonDescription: 'Provided falsified documents.',
      status: 'DISPUTED',
      dateBlacklisted: '2024-01-10',
      visibility: 'SHARED',
      outstandingAmount: 0,
      evidence: [
        { id: 1, type: 'COURT_DOC', fileName: 'fraud_report.pdf', uploadDate: '2024-01-10' }
      ],
      hasDispute: true,
      dispute: {
        id: 'DS-2024-001',
        status: 'UNDER_REVIEW',
        disputeReason: 'Documents were genuine.',
        createdAt: '2024-01-12'
      }
    }
  ];

  const stats = [
    { label: 'Total Blacklisted', value: blacklistRecords.length, icon: Shield, color: 'from-red-500 to-pink-500' },
    { label: 'Active Disputes', value: 1, icon: MessageSquare, color: 'from-orange-500 to-yellow-500' },
    { label: 'Cleared', value: 0, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
    { label: 'Pending', value: 0, icon: Clock, color: 'from-blue-500 to-cyan-500' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      CONFIRMED: 'bg-red-500/20 text-red-300 border-red-500/30',
      DISPUTED: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      CLEARED: 'bg-green-500/20 text-green-300 border-green-500/30',
      UNDER_REVIEW: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getReasonColor = (code) => {
    const colors = {
      DEFAULT: 'text-red-400',
      FRAUD: 'text-orange-400',
      ABSCONDED: 'text-purple-400'
    };
    return colors[code] || 'text-gray-400';
  };

  const filteredRecords = blacklistRecords.filter(record => {
    const matchesSearch = 
      record.borrower.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.borrower.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.borrower.idNumber.includes(searchQuery);
    
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Shield size={40} />
                Blacklist & Dispute Management
              </h1>
              <p className="text-purple-200">Manage borrower blacklist registry and disputes</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium flex items-center gap-2"
            >
              <Plus size={20} />
              Add to Blacklist
            </button>
          </div>
        </div>

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

        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 mb-6">
          <div className="border-b border-white/20 px-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveView('blacklist')}
                className={`py-4 px-2 font-medium border-b-2 flex items-center gap-2 ${
                  activeView === 'blacklist'
                    ? 'border-purple-400 text-white'
                    : 'border-transparent text-purple-200'
                }`}
              >
                <Shield size={18} />
                Blacklist Registry
              </button>
              <button
                onClick={() => setActiveView('disputes')}
                className={`py-4 px-2 font-medium border-b-2 flex items-center gap-2 ${
                  activeView === 'disputes'
                    ? 'border-purple-400 text-white'
                    : 'border-transparent text-purple-200'
                }`}
              >
                <MessageSquare size={18} />
                Disputes
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="all" className="bg-slate-800">All Status</option>
                <option value="CONFIRMED" className="bg-slate-800">Confirmed</option>
                <option value="DISPUTED" className="bg-slate-800">Disputed</option>
              </select>
            </div>

            {activeView === 'blacklist' && (
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <div key={record.id} className="bg-white/5 rounded-lg border border-white/10 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">
                            {record.borrower.firstName} {record.borrower.lastName}
                          </h3>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(record.status)}`}>
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
                            <p className="text-purple-200">Date</p>
                            <p className="text-white font-medium">{record.dateBlacklisted}</p>
                          </div>
                          <div>
                            <p className="text-purple-200">Lender</p>
                            <p className="text-white font-medium">{record.lender}</p>
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 mb-3">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${getReasonColor(record.reasonCode)}`}>
                            {record.reasonCode}
                          </span>
                          <p className="text-purple-100 text-sm mt-2">{record.reasonDescription}</p>
                        </div>
                        {record.outstandingAmount > 0 && (
                          <div className="flex items-center gap-2 text-red-400">
                            <DollarSign size={16} />
                            <span className="font-semibold">Outstanding: NAD {record.outstandingAmount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeView === 'disputes' && (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto mb-4 text-purple-300" size={48} />
                <p className="text-purple-200">No active disputes</p>
              </div>
            )}
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl border border-white/20 p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-white mb-6">Add to Blacklist</h2>
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Borrower ID Number"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300"
                />
                <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white">
                  <option value="" className="bg-slate-800">Select reason...</option>
                  <option value="DEFAULT" className="bg-slate-800">Default</option>
                  <option value="FRAUD" className="bg-slate-800">Fraud</option>
                </select>
                <textarea
                  rows={4}
                  placeholder="Description..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 rounded-lg text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Added to blacklist');
                    setShowAddModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 rounded-lg text-white"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedRecord && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl border border-white/20 p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">Record Details</h2>
                <button onClick={() => setSelectedRecord(null)} className="text-purple-300">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Borrower Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-purple-200">Name:</p>
                    <p className="text-white">{selectedRecord.borrower.firstName} {selectedRecord.borrower.lastName}</p>
                  </div>
                  <div>
                    <p className="text-purple-200">ID:</p>
                    <p className="text-white">{selectedRecord.borrower.idNumber}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Evidence Files</h3>
                <div className="space-y-2">
                  {selectedRecord.evidence.map((file) => (
                    <div key={file.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="text-purple-300" size={20} />
                        <div>
                          <p className="text-white text-sm">{file.fileName}</p>
                          <p className="text-purple-200 text-xs">{file.type}</p>
                        </div>
                      </div>
                      <Download className="text-purple-300" size={20} />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="w-full px-4 py-3 bg-white/10 rounded-lg text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlacklistDispute;