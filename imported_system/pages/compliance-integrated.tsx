import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import { 
  Shield,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Send,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Bell,
  Eye,
  RefreshCw,
  Upload,
  Award,
  XCircle,
  DollarSign,
  Users,
  AlertTriangle,
  FileCheck,
  Target,
  Edit
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ComplianceReport {
  id: string
  lender_id: string
  report_number: string
  report_year: number
  report_quarter: number
  total_loans: number
  total_portfolio: number
  default_rate: number
  collection_rate: number
  new_borrowers: number
  active_borrowers: number
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  submission_date?: string
  approval_date?: string
  is_locked: boolean
  created_at: string
  updated_at: string
  lender?: {
    legal_name: string
    registration_number: string
  }
}

const NAMFISAComplianceIntegrated = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedQuarter, setSelectedQuarter] = useState('Q4-2024');
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ComplianceReport[]>([]);

  // Compliance status - will be updated with real data
  const [complianceStatus, setComplianceStatus] = useState({
    overallScore: 85,
    reportingCompliance: 95,
    riskManagement: 78,
    capitalAdequacy: 65,
    consumerProtection: 88,
    lastUpdated: new Date().toISOString()
  });

  // Mock data for charts - will be replaced with real Supabase data
  const [trendData, setTrendData] = useState([
    { quarter: 'Q1-2024', compliance: 92, loans: 150, defaults: 3.2 },
    { quarter: 'Q2-2024', compliance: 88, loans: 180, defaults: 4.1 },
    { quarter: 'Q3-2024', compliance: 85, loans: 210, defaults: 5.8 },
    { quarter: 'Q4-2024', compliance: 85, loans: 195, defaults: 4.9 }
  ]);

  const [portfolioData, setPortfolioData] = useState([
    { name: 'Personal Loans', value: 45, color: '#8884d8' },
    { name: 'Business Loans', value: 30, color: '#82ca9d' },
    { name: 'Emergency Loans', value: 15, color: '#ffc658' },
    { name: 'Agricultural', value: 10, color: '#ff7300' }
  ]);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      
      // Fetch real compliance reports from Supabase
      const { data: reportsData, error } = await supabase
        .from('namfisa_reports')
        .select(`
          *,
          lenders (
            legal_name,
            registration_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setReports(reportsData || []);
      
      // Calculate real compliance metrics from data
      if (reportsData && reportsData.length > 0) {
        const latestReport = reportsData[0];
        setComplianceStatus({
          overallScore: calculateOverallScore(latestReport),
          reportingCompliance: latestReport.status === 'approved' ? 100 : 85,
          riskManagement: Math.max(0, 100 - (latestReport.default_rate * 10)),
          capitalAdequacy: 75, // Would be calculated from lender data
          consumerProtection: 90,
          lastUpdated: latestReport.updated_at
        });
      }
    } catch (error) {
      console.error('Error fetching compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallScore = (report: ComplianceReport) => {
    // Calculate overall compliance score based on report metrics
    const riskScore = Math.max(0, 100 - (report.default_rate * 10));
    const portfolioScore = report.total_portfolio > 1000000 ? 90 : 75;
    const loanScore = report.total_loans > 100 ? 85 : 70;
    
    return Math.round((riskScore + portfolioScore + loanScore) / 3);
  };

  // Quarterly reports data
  const quarterlyReports = [
    {
      id: '1',
      quarter: 'Q4-2024',
      status: 'submitted',
      submissionDate: '2024-01-15',
      dueDate: '2024-01-31',
      totalLoans: 195,
      portfolioValue: 2450000,
      defaultRate: 4.9,
      collectionRate: 91.2,
      newBorrowers: 28,
      complianceScore: 85
    },
    {
      id: '2',
      quarter: 'Q3-2024',
      status: 'approved',
      submissionDate: '2023-10-28',
      approvalDate: '2023-11-05',
      totalLoans: 210,
      portfolioValue: 2380000,
      defaultRate: 5.8,
      collectionRate: 89.7,
      newBorrowers: 35,
      complianceScore: 85
    }
  ];

  // Compliance requirements
  const requirements = [
    {
      id: '1',
      category: 'Reporting',
      title: 'Quarterly Financial Report',
      description: 'Detailed financial statements and loan portfolio analysis',
      frequency: 'Quarterly',
      dueDate: '2024-01-31',
      status: 'submitted',
      priority: 'high'
    },
    {
      id: '2',
      category: 'Risk Management',
      title: 'Loan Portfolio Risk Assessment',
      description: 'Comprehensive risk analysis of loan portfolio',
      frequency: 'Quarterly',
      dueDate: '2024-01-15',
      status: 'approved',
      priority: 'high'
    },
    {
      id: '3',
      category: 'Capital',
      title: 'Capital Adequacy Report',
      description: 'Verification of capital reserves against regulatory requirements',
      frequency: 'Monthly',
      dueDate: '2024-01-05',
      status: 'overdue',
      priority: 'high'
    },
    {
      id: '4',
      category: 'Consumer Protection',
      title: 'Consumer Protection Report',
      description: 'Report on consumer protection measures and complaint resolution',
      frequency: 'Quarterly',
      dueDate: '2024-01-20',
      status: 'pending',
      priority: 'medium'
    }
  ];

  // Alerts
  const alerts = [
    {
      id: '1',
      type: 'warning',
      title: 'Capital Adequacy Report Overdue',
      message: 'Monthly capital adequacy report was due on January 5, 2024',
      time: '3 days ago',
      priority: 'high'
    },
    {
      id: '2',
      type: 'info',
      title: 'Q4 2024 Report Ready for Review',
      message: 'Quarterly compliance report has been generated and ready for submission',
      time: '1 day ago',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'success',
      title: 'Q3 2024 Report Approved',
      message: 'NAMFISA has approved your Q3 2024 compliance report',
      time: '1 week ago',
      priority: 'low'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'submitted': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'submitted': return <Send className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-50 text-red-800 border-red-200';
      case 'info': return 'bg-blue-50 text-blue-800 border-blue-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <Layout title="NAMFISA Compliance">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="NAMFISA Compliance">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">NAMFISA Compliance</h2>
            <p className="text-neutral-500">Regulatory compliance monitoring and reporting</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
            >
              <option value="Q4-2024">Q4 2024</option>
              <option value="Q3-2024">Q3 2024</option>
              <option value="Q2-2024">Q2 2024</option>
              <option value="Q1-2024">Q1 2024</option>
            </select>
            <button className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Reports
            </button>
          </div>
        </div>

        {/* Compliance Score Overview */}
        <div className="bg-gradient-to-r from-cashub-600 to-accent-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Overall Compliance Score</h3>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">{complianceStatus.overallScore}%</span>
                <span className="ml-2 text-cashub-100">Compliant</span>
              </div>
              <p className="mt-2 text-cashub-100">
                Your platform meets most regulatory requirements. Review pending items for full compliance.
              </p>
            </div>
            <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Target className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Reports Submitted</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {reports.filter(r => r.status === 'submitted' || r.status === 'approved').length}
                </p>
                <p className="text-xs text-green-600 mt-1">+2 this month</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <FileCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Pending Actions</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {requirements.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-xs text-yellow-600 mt-1">Require attention</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Overdue Items</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {requirements.filter(r => r.status === 'overdue').length}
                </p>
                <p className="text-xs text-red-600 mt-1">Immediate action</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Next Deadline</p>
                <p className="text-lg font-bold text-neutral-900 mt-1">Jan 15</p>
                <p className="text-xs text-neutral-500 mt-1">5 days remaining</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
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
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </div>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Quarterly Reports
                  <span className="ml-2 bg-neutral-100 text-neutral-600 py-1 px-2 rounded-full text-xs">
                    {reports.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('requirements')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'requirements'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Requirements
                  <span className="ml-2 bg-neutral-100 text-neutral-600 py-1 px-2 rounded-full text-xs">
                    {requirements.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <PieChart className="w-4 h-4 mr-2" />
                  Analytics
                </div>
              </button>
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Compliance Metrics */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Compliance Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-neutral-700">Reporting Compliance</span>
                        <span className="text-sm font-bold text-green-600">{complianceStatus.reportingCompliance}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${complianceStatus.reportingCompliance}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-neutral-700">Risk Management</span>
                        <span className="text-sm font-bold text-yellow-600">{complianceStatus.riskManagement}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${complianceStatus.riskManagement}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-neutral-700">Capital Requirements</span>
                        <span className="text-sm font-bold text-red-600">{complianceStatus.capitalAdequacy}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${complianceStatus.capitalAdequacy}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-neutral-700">Consumer Protection</span>
                        <span className="text-sm font-bold text-green-600">{complianceStatus.consumerProtection}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${complianceStatus.consumerProtection}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Alerts */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Compliance Alerts</h3>
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 mt-0.5 mr-3" />
                          <div className="flex-1">
                            <p className="font-medium">{alert.title}</p>
                            <p className="text-sm mt-1 opacity-90">{alert.message}</p>
                            <p className="text-xs mt-2 opacity-75">{alert.time}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(alert.priority)}`}>
                            {alert.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab with Charts */}
          {activeTab === 'analytics' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Compliance Trends Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Compliance Trends</h3>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quarter" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="compliance" stroke="#8884d8" name="Compliance %" />
                        <Line type="monotone" dataKey="loans" stroke="#82ca9d" name="Total Loans" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Portfolio Distribution */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Portfolio Distribution</h3>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPie>
                        <Pie
                          data={portfolioData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {portfolioData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NAMFISAComplianceIntegrated;
