import React, { useState } from 'react';
import { AlertTriangle, Upload, FileText, MessageSquare, CheckCircle, XCircle, Scale, DollarSign, Clock, Shield } from 'lucide-react';

const BlacklistDisputeUI = () => {
  const [view, setView] = useState('create'); // create, dispute, review
  const [step, setStep] = useState(1);
  
  // Blacklist creation state
  const [blacklistForm, setBlacklistForm] = useState({
    borrower: { id: '1', name: 'John Doe', idNumber: '850***345' },
    reason: '',
    detailedReason: '',
    outstandingAmount: '',
    loanId: 'LN-2025-001234',
    isShared: true
  });

  const [evidenceUploads, setEvidenceUploads] = useState([
    { category: 'signed_agreement', required: true, uploaded: false, file: null },
    { category: 'payment_history', required: true, uploaded: false, file: null },
    { category: 'communication_logs', required: false, uploaded: false, file: null },
    { category: 'court_documents', required: false, uploaded: false, file: null },
    { category: 'identity_verification', required: true, uploaded: false, file: null }
  ]);

  // Dispute state
  const [disputeForm, setDisputeForm] = useState({
    blacklistId: 'BL-2025-000123',
    reason: '',
    offerPayment: false,
    paymentAmount: ''
  });

  const reasons = [
    { value: 'defaulted', label: 'Defaulted on Loan' },
    { value: 'fraud', label: 'Fraud / Identity Theft' },
    { value: 'misrepresentation', label: 'Misrepresentation of Information' },
    { value: 'absconded', label: 'Absconded / Cannot Be Reached' },
    { value: 'court_judgement', label: 'Court Judgement Against Borrower' }
  ];

  const evidenceCategories = {
    signed_agreement: { label: 'Signed Loan Agreement', icon: FileText },
    payment_history: { label: 'Payment History', icon: DollarSign },
    communication_logs: { label: 'Communication Logs', icon: MessageSquare },
    court_documents: { label: 'Court Documents', icon: Scale },
    identity_verification: { label: 'Identity Verification', icon: Shield }
  };

  const allRequiredUploaded = evidenceUploads
    .filter(e => e.required)
    .every(e => e.uploaded);

  const handleFileUpload = (category, file) => {
    setEvidenceUploads(prev => prev.map(e =>
      e.category === category ? { ...e, uploaded: true, file } : e
    ));
  };

  const handleCreateBlacklist = () => {
    if (!blacklistForm.reason) {
      alert('Please select a blacklist reason');
      return;
    }
    if (blacklistForm.detailedReason.length < 50) {
      alert('Detailed reason must be at least 50 characters');
      return;
    }
    if (!allRequiredUploaded) {
      alert('Please upload all required evidence documents');
      return;
    }
    alert('Blacklist created successfully! Status: Pending Review');
    setStep(1);
  };

  const handleOpenDispute = () => {
    if (disputeForm.reason.length < 50) {
      alert('Dispute reason must be at least 50 characters');
      return;
    }
    alert('Dispute opened successfully! Lender has 14 days to respond.');
    setView('create');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6 flex gap-2">
          <button
            onClick={() => { setView('create'); setStep(1); }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              view === 'create' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Create Blacklist
          </button>
          <button
            onClick={() => setView('dispute')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              view === 'dispute' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Open Dispute
          </button>
          <button
            onClick={() => setView('review')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              view === 'review' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Review Disputes
          </button>
        </div>

        {/* CREATE BLACKLIST VIEW */}
        {view === 'create' && (
          <div className="space-y-6">
            
            {/* Progress Indicator */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                {[
                  { num: 1, label: 'Borrower & Reason' },
                  { num: 2, label: 'Evidence Upload' },
                  { num: 3, label: 'Review & Submit' }
                ].map((s, idx) => (
                  <React.Fragment key={s.num}>
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        step >= s.num ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step > s.num ? <CheckCircle size={20} /> : s.num}
                      </div>
                      <span className={`text-xs font-medium ${step >= s.num ? 'text-red-600' : 'text-gray-500'}`}>
                        {s.label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div className={`flex-1 h-1 mx-2 ${step > s.num ? 'bg-red-600' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step 1: Borrower & Reason */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-red-600" />
                    Blacklist Borrower
                  </h2>
                  
                  <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800">
                      <strong>Important:</strong> Blacklisting is a serious action with legal implications. 
                      You must provide evidence for all required categories. False or malicious blacklisting 
                      may result in account suspension and legal action.
                    </p>
                  </div>

                  {/* Borrower Details */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Borrower Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{blacklistForm.borrower.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">ID Number</p>
                        <p className="font-medium">{blacklistForm.borrower.idNumber}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Related Loan</p>
                        <p className="font-medium">{blacklistForm.loanId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Blacklist Reason */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blacklist Reason <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={blacklistForm.reason}
                        onChange={(e) => setBlacklistForm({ ...blacklistForm, reason: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Select reason...</option>
                        {reasons.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Detailed Explanation <span className="text-red-600">*</span>
                        <span className="text-xs text-gray-500 ml-2">(Minimum 50 characters)</span>
                      </label>
                      <textarea
                        value={blacklistForm.detailedReason}
                        onChange={(e) => setBlacklistForm({ ...blacklistForm, detailedReason: e.target.value })}
                        rows={6}
                        placeholder="Provide a detailed explanation of why this borrower is being blacklisted. Include specific dates, amounts, and actions taken to resolve the situation..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <p className={`text-xs mt-1 ${blacklistForm.detailedReason.length < 50 ? 'text-red-600' : 'text-green-600'}`}>
                        {blacklistForm.detailedReason.length} / 50 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Outstanding Amount (NAD)
                      </label>
                      <input
                        type="number"
                        value={blacklistForm.outstandingAmount}
                        onChange={(e) => setBlacklistForm({ ...blacklistForm, outstandingAmount: e.target.value })}
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="shared"
                        checked={blacklistForm.isShared}
                        onChange={(e) => setBlacklistForm({ ...blacklistForm, isShared: e.target.checked })}
                        className="rounded text-red-600 focus:ring-2 focus:ring-red-500"
                      />
                      <label htmlFor="shared" className="text-sm text-gray-700">
                        Share with other lenders in the registry (Recommended)
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!blacklistForm.reason || blacklistForm.detailedReason.length < 50}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Evidence Upload
                </button>
              </div>
            )}

            {/* Step 2: Evidence Upload */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4">Upload Evidence</h2>
                  
                  <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>Evidence Requirements:</strong> You must upload documents for all categories 
                      marked as "Required". Additional evidence strengthens your case.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {evidenceUploads.map((evidence) => {
                      const CategoryIcon = evidenceCategories[evidence.category].icon;
                      return (
                        <div key={evidence.category} className={`p-4 border-2 rounded-lg ${
                          evidence.uploaded ? 'border-green-500 bg-green-50' : 
                          evidence.required ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CategoryIcon className={evidence.uploaded ? 'text-green-600' : 'text-gray-400'} size={24} />
                              <div>
                                <p className="font-medium">
                                  {evidenceCategories[evidence.category].label}
                                  {evidence.required && <span className="text-red-600 ml-1">*</span>}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {evidence.required ? 'Required' : 'Optional'}
                                </p>
                              </div>
                            </div>
                            
                            {evidence.uploaded ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle size={20} />
                                <span className="text-sm font-medium">Uploaded</span>
                              </div>
                            ) : (
                              <label className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer font-medium text-sm transition-colors flex items-center gap-2">
                                <Upload size={16} />
                                Upload File
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(evidence.category, e.target.files[0])}
                                  accept=".pdf,.jpg,.jpeg,.png"
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!allRequiredUploaded}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Review
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4">Review Blacklist Details</h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold mb-3">Borrower Information</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <span className="ml-2 font-medium">{blacklistForm.borrower.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">ID:</span>
                          <span className="ml-2 font-medium">{blacklistForm.borrower.idNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold mb-3">Blacklist Details</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Reason:</span>
                          <span className="ml-2 font-medium">
                            {reasons.find(r => r.value === blacklistForm.reason)?.label}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Explanation:</span>
                          <p className="mt-1 text-gray-800">{blacklistForm.detailedReason}</p>
                        </div>
                        {blacklistForm.outstandingAmount && (
                          <div>
                            <span className="text-gray-600">Outstanding Amount:</span>
                            <span className="ml-2 font-medium">NAD {parseFloat(blacklistForm.outstandingAmount).toLocaleString()}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Shared with Registry:</span>
                          <span className="ml-2 font-medium">{blacklistForm.isShared ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold mb-3">Evidence Uploaded</h3>
                      <div className="space-y-2">
                        {evidenceUploads.filter(e => e.uploaded).map((evidence) => (
                          <div key={evidence.category} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="text-green-600" size={16} />
                            <span>{evidenceCategories[evidence.category].label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Final Confirmation:</strong> By submitting this blacklist, you confirm that all 
                        information provided is accurate and that you have supporting evidence. This action will 
                        be reviewed and may be subject to dispute. Abuse of the blacklisting system may result 
                        in penalties.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreateBlacklist}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Submit Blacklist
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* OPEN DISPUTE VIEW */}
        {view === 'dispute' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Scale className="text-blue-600" />
                Open Dispute
              </h2>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Your Rights:</strong> If you believe you've been blacklisted unfairly, you have the 
                  right to dispute. The lender must respond within 14 days. If unresolved, an admin will arbitrate.
                </p>
              </div>

              {/* Blacklist Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">Blacklist Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Blacklist ID:</span>
                    <span className="ml-2 font-medium">BL-2025-000123</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Lender:</span>
                    <span className="ml-2 font-medium">ABC Microfinance</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Reason:</span>
                    <span className="ml-2 font-medium">Defaulted on Loan</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Outstanding:</span>
                    <span className="ml-2 font-medium">NAD 7,500.00</span>
                  </div>
                </div>
              </div>

              {/* Dispute Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dispute Reason <span className="text-red-600">*</span>
                    <span className="text-xs text-gray-500 ml-2">(Minimum 50 characters)</span>
                  </label>
                  <textarea
                    value={disputeForm.reason}
                    onChange={(e) => setDisputeForm({ ...disputeForm, reason: e.target.value })}
                    rows={6}
                    placeholder="Explain why you believe this blacklist is incorrect or unfair. Provide specific details, dates, and any evidence you have..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className={`text-xs mt-1 ${disputeForm.reason.length < 50 ? 'text-red-600' : 'text-green-600'}`}>
                    {disputeForm.reason.length} / 50 characters
                  </p>
                </div>

                {/* Payment Option */}
                <div className="p-4 border-2 border-gray-200 rounded-lg">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={disputeForm.offerPayment}
                      onChange={(e) => setDisputeForm({ ...disputeForm, offerPayment: e.target.checked })}
                      className="mt-1 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium">Offer Payment for Name Clearance</p>
                      <p className="text-sm text-gray-600 mt-1">
                        If you acknowledge the debt but want to clear your name, you can offer a payment.
                      </p>
                      
                      {disputeForm.offerPayment && (
                        <input
                          type="number"
                          value={disputeForm.paymentAmount}
                          onChange={(e) => setDisputeForm({ ...disputeForm, paymentAmount: e.target.value })}
                          placeholder="Payment amount (NAD)"
                          className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </label>
                </div>

                {/* Evidence Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Counter-Evidence (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-600 mb-2">Upload proof of payment, correspondence, or other evidence</p>
                    <label className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer font-medium text-sm transition-colors">
                      Choose Files
                      <input type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenDispute}
              disabled={disputeForm.reason.length < 50}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Dispute
            </button>
          </div>
        )}

        {/* REVIEW DISPUTES VIEW (Admin) */}
        {view === 'review' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Active Disputes</h2>
              
              <div className="space-y-4">
                {[1, 2].map((_, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">DISP-2025-00012{idx}</p>
                        <p className="text-sm text-gray-600">Borrower: John Doe • Lender: ABC Microfinance</p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        Under Review
                      </span>
                    </div>
                    
                    <div className="mb-3 text-sm">
                      <p className="text-gray-600 mb-1">Dispute Reason:</p>
                      <p className="text-gray-800">Borrower claims loan was fully repaid but not recorded properly...</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock size={14} />
                      <span>Opened 3 days ago</span>
                      <span>•</span>
                      <span>Response deadline: 11 days</span>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Remove Blacklist
                      </button>
                      <button className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Downgrade
                      </button>
                      <button className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Uphold
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlacklistDisputeUI;