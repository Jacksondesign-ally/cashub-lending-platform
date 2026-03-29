import React, { useState } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Banknote, 
  Wallet,
  CheckCircle,
  AlertCircle,
  Search,
  Calendar,
  User,
  Hash,
  FileText,
  Download,
  Printer,
  Send
} from 'lucide-react';

const PaymentProcessing = () => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    reference: '',
    notes: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const loans = [
    {
      id: 'L-2024-001',
      borrower: 'John Doe',
      borrowerId: 'BRW-2024-1234',
      phone: '+264811234567',
      loanAmount: 30000,
      outstanding: 22500,
      monthlyPayment: 5500,
      dueDate: '2024-02-15',
      status: 'active',
      daysOverdue: 0
    },
    {
      id: 'L-2024-002',
      borrower: 'Maria Santos',
      borrowerId: 'BRW-2024-1235',
      phone: '+264812345678',
      loanAmount: 25000,
      outstanding: 18750,
      monthlyPayment: 4500,
      dueDate: '2024-01-28',
      status: 'overdue',
      daysOverdue: 5
    },
    {
      id: 'L-2024-003',
      borrower: 'David Smith',
      borrowerId: 'BRW-2024-1236',
      phone: '+264813456789',
      loanAmount: 20000,
      outstanding: 15000,
      monthlyPayment: 3750,
      dueDate: '2024-02-10',
      status: 'active',
      daysOverdue: 0
    }
  ];

  const recentPayments = [
    {
      id: 'PAY-2024-156',
      borrower: 'Sarah Johnson',
      loanId: 'L-2024-015',
      amount: 4200,
      method: 'Bank Transfer',
      date: '2024-01-22',
      time: '14:35',
      status: 'completed'
    },
    {
      id: 'PAY-2024-155',
      borrower: 'Peter Williams',
      loanId: 'L-2024-008',
      amount: 5500,
      method: 'Cash',
      date: '2024-01-22',
      time: '11:20',
      status: 'completed'
    },
    {
      id: 'PAY-2024-154',
      borrower: 'Emma Brown',
      loanId: 'L-2024-022',
      amount: 3000,
      method: 'Mobile Money',
      date: '2024-01-21',
      time: '16:45',
      status: 'completed'
    }
  ];

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: Banknote, color: 'from-green-500 to-emerald-500' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: CreditCard, color: 'from-blue-500 to-cyan-500' },
    { id: 'mobile_money', name: 'Mobile Money', icon: Wallet, color: 'from-purple-500 to-pink-500' },
    { id: 'check', name: 'Check', icon: FileText, color: 'from-orange-500 to-red-500' }
  ];

  const filteredLoans = loans.filter(loan => 
    loan.borrower.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loan.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loan.borrowerId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLoanSelect = (loan) => {
    setSelectedLoan(loan);
    setPaymentData({
      ...paymentData,
      amount: loan.monthlyPayment.toString()
    });
  };

  const handleProcessPayment = () => {
    if (!selectedLoan || !paymentMethod || !paymentData.amount) {
      alert('Please complete all required fields');
      return;
    }
    setShowConfirmation(true);
  };

  const confirmPayment = () => {
    console.log('Payment processed:', {
      loan: selectedLoan,
      method: paymentMethod,
      data: paymentData
    });
    
    // Reset form
    setSelectedLoan(null);
    setPaymentMethod('');
    setPaymentData({
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      reference: '',
      notes: ''
    });
    setShowConfirmation(false);
    alert('Payment processed successfully!');
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      overdue: 'bg-red-500/20 text-red-300 border-red-500/30',
      completed: 'bg-green-500/20 text-green-300 border-green-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Payment Processing</h1>
          <p className="text-purple-200">Record and manage loan payments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Loan */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Select Loan</h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                <input
                  type="text"
                  placeholder="Search by borrower name, loan ID, or borrower ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredLoans.map((loan) => (
                  <div
                    key={loan.id}
                    onClick={() => handleLoanSelect(loan)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedLoan?.id === loan.id
                        ? 'bg-purple-500/20 border-purple-400'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-white font-semibold">{loan.borrower}</h3>
                        <p className="text-purple-200 text-sm">{loan.id} • {loan.borrowerId}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-purple-200">Outstanding</p>
                        <p className="text-white font-semibold">NAD {loan.outstanding.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-purple-200">Monthly Payment</p>
                        <p className="text-white font-semibold">NAD {loan.monthlyPayment.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-purple-200">Due Date</p>
                        <p className="text-white font-semibold">{loan.dueDate}</p>
                      </div>
                    </div>
                    {loan.daysOverdue > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle size={16} />
                        <span>{loan.daysOverdue} days overdue</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            {selectedLoan && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Payment Method</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === method.id
                          ? 'border-purple-400 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center`}>
                        <method.icon className="text-white" size={24} />
                      </div>
                      <p className="text-white text-sm font-medium text-center">{method.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Details */}
            {selectedLoan && paymentMethod && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Payment Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">
                        Payment Amount (NAD) <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                        <input
                          type="number"
                          value={paymentData.amount}
                          onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">
                        Payment Date <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                        <input
                          type="date"
                          value={paymentData.paymentDate}
                          onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Reference Number
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                      <input
                        type="text"
                        value={paymentData.reference}
                        onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                        placeholder="Transaction reference or receipt number"
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                      placeholder="Additional payment notes..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  <button
                    onClick={handleProcessPayment}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg text-white font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <CheckCircle size={20} />
                    Process Payment
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Summary & Recent Payments */}
          <div className="space-y-6">
            {/* Payment Summary */}
            {selectedLoan && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Payment Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/20">
                    <User className="text-purple-300" size={20} />
                    <div className="flex-1">
                      <p className="text-purple-200 text-sm">Borrower</p>
                      <p className="text-white font-medium">{selectedLoan.borrower}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pb-3 border-b border-white/20">
                    <FileText className="text-purple-300" size={20} />
                    <div className="flex-1">
                      <p className="text-purple-200 text-sm">Loan ID</p>
                      <p className="text-white font-medium">{selectedLoan.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pb-3 border-b border-white/20">
                    <DollarSign className="text-purple-300" size={20} />
                    <div className="flex-1">
                      <p className="text-purple-200 text-sm">Outstanding Balance</p>
                      <p className="text-white font-bold">NAD {selectedLoan.outstanding.toLocaleString()}</p>
                    </div>
                  </div>
                  {paymentData.amount && (
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg p-4 mt-4">
                      <p className="text-green-200 text-sm mb-1">New Balance After Payment</p>
                      <p className="text-white font-bold text-2xl">
                        NAD {(selectedLoan.outstanding - parseFloat(paymentData.amount || 0)).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Payments */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Payments</h3>
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-medium">{payment.borrower}</p>
                        <p className="text-purple-200 text-sm">{payment.loanId}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">NAD {payment.amount.toLocaleString()}</p>
                        <p className="text-purple-200 text-xs">{payment.method}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-200 text-xs">{payment.date}</p>
                        <p className="text-purple-200 text-xs">{payment.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl shadow-2xl border border-white/20 p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Confirm Payment</h2>
                <p className="text-purple-200">Please verify the payment details</p>
              </div>

              <div className="bg-white/10 rounded-lg p-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-200">Borrower:</span>
                  <span className="text-white font-medium">{selectedLoan?.borrower}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Loan ID:</span>
                  <span className="text-white font-medium">{selectedLoan?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Amount:</span>
                  <span className="text-white font-medium">NAD {parseFloat(paymentData.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Method:</span>
                  <span className="text-white font-medium capitalize">{paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Date:</span>
                  <span className="text-white font-medium">{paymentData.paymentDate}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPayment}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg text-white font-medium transition-all shadow-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentProcessing;