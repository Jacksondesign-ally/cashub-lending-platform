import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Edit,
  Download,
  MessageSquare,
  Activity
} from 'lucide-react';

const BorrowerProfile = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const borrower = {
    id: 'BRW-2024-1234',
    firstName: 'John',
    lastName: 'Doe',
    idNumber: '850***345',
    email: 'john.doe@example.com',
    phone: '+264811234567',
    alternatePhone: '+264812345678',
    address: {
      street: '123 Independence Avenue',
      city: 'Windhoek',
      region: 'Khomas',
      postalCode: '9000'
    },
    employment: {
      status: 'Salaried',
      employer: 'ABC Corporation',
      jobTitle: 'Senior Manager',
      monthlyIncome: 25000,
      duration: '5+ years'
    },
    dateOfBirth: '1985-03-15',
    joinDate: '2023-01-15',
    status: 'active_borrower',
    riskLevel: 'low',
    creditScore: 78,
    behaviorClassification: 'good_payer'
  };

  const stats = [
    {
      label: 'Total Loans',
      value: '5',
      change: '+1',
      trend: 'up',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Total Borrowed',
      value: 'NAD 125K',
      change: '+15K',
      trend: 'up',
      icon: DollarSign,
      color: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Outstanding',
      value: 'NAD 22.5K',
      change: '-5K',
      trend: 'down',
      icon: Activity,
      color: 'from-orange-500 to-red-500'
    },
    {
      label: 'Payment Rate',
      value: '96.5%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const loanHistory = [
    {
      id: 'L-2024-001',
      amount: 'NAD 30,000',
      purpose: 'Business Investment',
      status: 'active',
      disbursedDate: '2024-01-15',
      dueDate: '2024-07-15',
      monthlyPayment: 'NAD 5,500',
      outstanding: 'NAD 22,500',
      paymentsOnTime: 4,
      totalPayments: 6
    },
    {
      id: 'L-2023-045',
      amount: 'NAD 25,000',
      purpose: 'Home Improvement',
      status: 'completed',
      disbursedDate: '2023-06-10',
      completedDate: '2023-12-10',
      monthlyPayment: 'NAD 4,500',
      outstanding: 'NAD 0',
      paymentsOnTime: 6,
      totalPayments: 6
    },
    {
      id: 'L-2023-012',
      amount: 'NAD 20,000',
      purpose: 'Education',
      status: 'completed',
      disbursedDate: '2023-02-01',
      completedDate: '2023-08-01',
      monthlyPayment: 'NAD 3,500',
      outstanding: 'NAD 0',
      paymentsOnTime: 6,
      totalPayments: 6
    }
  ];

  const paymentHistory = [
    { date: '2024-01-15', amount: 'NAD 5,500', status: 'paid', method: 'Bank Transfer' },
    { date: '2024-02-15', amount: 'NAD 5,500', status: 'paid', method: 'Bank Transfer' },
    { date: '2024-03-15', amount: 'NAD 5,500', status: 'paid', method: 'Cash' },
    { date: '2024-04-15', amount: 'NAD 5,500', status: 'paid', method: 'Bank Transfer' },
    { date: '2024-05-15', amount: 'NAD 5,500', status: 'pending', method: '-' }
  ];

  const documents = [
    { name: 'National ID', status: 'verified', uploadDate: '2023-01-10', type: 'Identity' },
    { name: 'Proof of Income', status: 'verified', uploadDate: '2023-01-10', type: 'Income' },
    { name: 'Bank Statement', status: 'verified', uploadDate: '2023-01-10', type: 'Financial' },
    { name: 'Proof of Residence', status: 'verified', uploadDate: '2023-01-10', type: 'Address' }
  ];

  const activities = [
    { type: 'payment', message: 'Payment of NAD 5,500 received', time: '2 days ago' },
    { type: 'note', message: 'Follow-up call completed - client confirmed next payment', time: '5 days ago' },
    { type: 'update', message: 'Credit score updated: 78 (+3)', time: '1 week ago' },
    { type: 'payment', message: 'Payment of NAD 5,500 received', time: '1 month ago' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      completed: 'bg-green-500/20 text-green-300 border-green-500/30',
      overdue: 'bg-red-500/20 text-red-300 border-red-500/30',
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      paid: 'bg-green-500/20 text-green-300 border-green-500/30',
      verified: 'bg-green-500/20 text-green-300 border-green-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getRiskColor = (level) => {
    const colors = {
      low: 'text-green-400',
      medium: 'text-yellow-400',
      high: 'text-red-400'
    };
    return colors[level] || 'text-gray-400';
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'loans', label: 'Loan History' },
    { id: 'payments', label: 'Payment History' },
    { id: 'documents', label: 'Documents' },
    { id: 'activity', label: 'Activity Log' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
                {borrower.firstName[0]}{borrower.lastName[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {borrower.firstName} {borrower.lastName}
                </h1>
                <div className="flex items-center gap-3 text-purple-200">
                  <span>{borrower.id}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(borrower.status)}`}>
                    {borrower.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all hover:scale-105 flex items-center gap-2">
                <MessageSquare size={18} />
                Message
              </button>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all hover:scale-105 flex items-center gap-2">
                <Edit size={18} />
                Edit
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white transition-all hover:scale-105 flex items-center gap-2">
                <Download size={18} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="text-white" size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-purple-200 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 mb-6">
          <div className="border-b border-white/20 px-6">
            <div className="flex gap-6 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-400 text-white'
                      : 'border-transparent text-purple-200 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <User size={20} />
                      Personal Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-200">ID Number:</span>
                        <span className="text-white font-medium">{borrower.idNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Date of Birth:</span>
                        <span className="text-white font-medium">{borrower.dateOfBirth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Email:</span>
                        <span className="text-white font-medium">{borrower.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Phone:</span>
                        <span className="text-white font-medium">{borrower.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Alt. Phone:</span>
                        <span className="text-white font-medium">{borrower.alternatePhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Member Since:</span>
                        <span className="text-white font-medium">{borrower.joinDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <MapPin size={20} />
                      Address
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-200">Street:</span>
                        <span className="text-white font-medium">{borrower.address.street}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">City:</span>
                        <span className="text-white font-medium">{borrower.address.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Region:</span>
                        <span className="text-white font-medium">{borrower.address.region}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Postal Code:</span>
                        <span className="text-white font-medium">{borrower.address.postalCode}</span>
                      </div>
                    </div>
                  </div>

                  {/* Employment */}
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Briefcase size={20} />
                      Employment
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-200">Status:</span>
                        <span className="text-white font-medium">{borrower.employment.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Employer:</span>
                        <span className="text-white font-medium">{borrower.employment.employer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Job Title:</span>
                        <span className="text-white font-medium">{borrower.employment.jobTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Monthly Income:</span>
                        <span className="text-white font-medium">NAD {borrower.employment.monthlyIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Duration:</span>
                        <span className="text-white font-medium">{borrower.employment.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Activity size={20} />
                      Risk Assessment
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-purple-200 text-sm">Credit Score</span>
                          <span className="text-white font-bold">{borrower.creditScore}/100</span>
                        </div>
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{ width: `${borrower.creditScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Risk Level:</span>
                        <span className={`font-semibold uppercase ${getRiskColor(borrower.riskLevel)}`}>
                          {borrower.riskLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Behavior:</span>
                        <span className="text-white font-medium capitalize">{borrower.behaviorClassification.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loans Tab */}
            {activeTab === 'loans' && (
              <div className="space-y-4">
                {loanHistory.map((loan) => (
                  <div key={loan.id} className="bg-white/5 rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-white font-semibold text-lg">{loan.id}</h4>
                        <p className="text-purple-200 text-sm">{loan.purpose}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-purple-200 mb-1">Loan Amount</p>
                        <p className="text-white font-semibold">{loan.amount}</p>
                      </div>
                      <div>
                        <p className="text-purple-200 mb-1">Monthly Payment</p>
                        <p className="text-white font-semibold">{loan.monthlyPayment}</p>
                      </div>
                      <div>
                        <p className="text-purple-200 mb-1">Outstanding</p>
                        <p className="text-white font-semibold">{loan.outstanding}</p>
                      </div>
                      <div>
                        <p className="text-purple-200 mb-1">Payment Record</p>
                        <p className="text-white font-semibold">{loan.paymentsOnTime}/{loan.totalPayments}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {paymentHistory.map((payment, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-white">{payment.date}</td>
                        <td className="px-4 py-3 text-white font-medium">{payment.amount}</td>
                        <td className="px-4 py-3 text-purple-200">{payment.method}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc, idx) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <FileText className="text-purple-300" size={24} />
                        <div>
                          <h4 className="text-white font-medium">{doc.name}</h4>
                          <p className="text-purple-200 text-sm">{doc.type}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-purple-200">Uploaded: {doc.uploadDate}</span>
                      <button className="text-purple-300 hover:text-purple-100 font-medium">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-3">
                {activities.map((activity, idx) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {activity.type === 'payment' && <DollarSign className="text-green-400" size={20} />}
                        {activity.type === 'note' && <MessageSquare className="text-blue-400" size={20} />}
                        {activity.type === 'update' && <Activity className="text-purple-400" size={20} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-white mb-1">{activity.message}</p>
                        <p className="text-purple-200 text-sm">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowerProfile;