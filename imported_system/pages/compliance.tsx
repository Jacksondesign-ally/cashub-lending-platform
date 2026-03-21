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

interface ComplianceRequirement {
  id: string
  name: string
  description: string
  category: 'reporting' | 'capital' | 'risk' | 'governance' | 'consumer_protection'
  frequency: 'monthly' | 'quarterly' | 'annually'
  due_date: string
  status: 'compliant' | 'pending' | 'overdue' | 'non_compliant'
  last_completed?: string
  next_due: string
  priority: 'high' | 'medium' | 'low'
}

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'requirements' | 'analytics'>('overview')
  const [reports, setReports] = useState<ComplianceReport[]>([])
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuarter, setSelectedQuarter] = useState('Q4-2024')
  const [complianceScore, setComplianceScore] = useState(85)

  useEffect(() => {
    fetchComplianceData()
  }, [])

  const fetchComplianceData = async () => {
    try {
      setLoading(true)
      
      // Fetch compliance reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('namfisa_reports')
        .select(`
          *,
          lenders (
            legal_name,
            registration_number
          )
        `)
        .order('created_at', { ascending: false })

      if (reportsError) throw reportsError

      // Mock requirements data (in real app, this would come from database)
      const mockRequirements: ComplianceRequirement[] = [
        {
          id: '1',
          name: 'Quarterly Financial Report',
          description: 'Submit detailed financial statements for the quarter',
          category: 'reporting',
          frequency: 'quarterly',
          due_date: '2024-01-31',
          status: 'compliant',
          last_completed: '2023-10-31',
          next_due: '2024-01-31',
          priority: 'high'
        },
        {
          id: '2',
          name: 'Loan Portfolio Analysis',
          description: 'Analysis of loan portfolio performance and risk metrics',
          category: 'risk',
          frequency: 'quarterly',
          due_date: '2024-01-15',
          status: 'pending',
          next_due: '2024-01-15',
          priority: 'high'
        },
        {
          id: '3',
          name: 'Capital Adequacy Assessment',
          description: 'Verify capital reserves meet regulatory requirements',
          category: 'capital',
          frequency: 'monthly',
          due_date: '2024-01-05',
          status: 'overdue',
          next_due: '2024-02-05',
          priority: 'high'
        },
        {
          id: '4',
          name: 'Consumer Protection Report',
          description: 'Report on consumer protection measures and complaints',
          category: 'consumer_protection',
          frequency: 'quarterly',
          due_date: '2024-01-20',
          status: 'compliant',
          last_completed: '2023-10-20',
          next_due: '2024-01-20',
          priority: 'medium'
        },
        {
          id: '5',
          name: 'Board Meeting Minutes',
          description: 'Submit minutes from board meetings',
          category: 'governance',
          frequency: 'quarterly',
          due_date: '2024-01-25',
          status: 'pending',
          next_due: '2024-01-25',
          priority: 'medium'
        }
      ]

      setReports(reportsData || [])
      setRequirements(mockRequirements)
    } catch (error) {
      console.error('Error fetching compliance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200'
      case 'non_compliant': return 'bg-red-100 text-red-800 border-red-200'
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'under_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reporting': return <FileText className="w-4 h-4" />
      case 'capital': return <DollarSign className="w-4 h-4" />
      case 'risk': return <AlertTriangle className="w-4 h-4" />
      case 'governance': return <Shield className="w-4 h-4" />
      case 'consumer_protection': return <Users className="w-4 h-4" />
      default: return <FileCheck className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const generateReport = async (quarter: string, year: number) => {
    try {
      // Mock report generation
      console.log(`Generating report for ${quarter} ${year}`)
      // In real app, this would call Supabase function to generate report
    } catch (error) {
      console.error('Error generating report:', error)
    }
  }

  if (loading) {
    return (
      <Layout title="NAMFISA Compliance">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
        </div>
      </Layout>
    )
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
                <span className="text-4xl font-bold">{complianceScore}%</span>
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
                {/* Recent Alerts */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Compliance Alerts</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
                        <div>
                          <p className="font-medium text-red-800">Capital Adequacy Assessment Overdue</p>
                          <p className="text-sm text-red-600 mt-1">Was due on January 5, 2024 - Immediate action required</p>
                          <p className="text-xs text-red-500 mt-2">3 days overdue</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <Clock className="w-5 h-5 text-yellow-500 mt-0.5 mr-3" />
                        <div>
                          <p className="font-medium text-yellow-800">Loan Portfolio Analysis Due Soon</p>
                          <p className="text-sm text-yellow-600 mt-1">Due on January 15, 2024 - 5 days remaining</p>
                          <p className="text-xs text-yellow-500 mt-2">High priority</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                        <div>
                          <p className="font-medium text-green-800">Quarterly Financial Report Completed</p>
                          <p className="text-sm text-green-600 mt-1">Successfully submitted on January 28, 2024</p>
                          <p className="text-xs text-green-500 mt-2">Next due April 30, 2024</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compliance Metrics */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Compliance Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-neutral-700">Reporting Compliance</span>
                        <span className="text-sm font-bold text-green-600">95%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-neutral-700">Risk Management</span>
                        <span className="text-sm font-bold text-yellow-600">78%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-neutral-700">Capital Requirements</span>
                        <span className="text-sm font-bold text-red-600">65%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-neutral-700">Consumer Protection</span>
                        <span className="text-sm font-bold text-green-600">88%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-neutral-900">Quarterly NAMFISA Reports</h3>
                <button 
                  onClick={() => generateReport(selectedQuarter.split('-')[0], parseInt(selectedQuarter.split('-')[1]))}
                  className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Report Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Lender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Key Metrics
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
                    {reports.length > 0 ? (
                      reports.map((report) => (
                        <tr key={report.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-neutral-900">{report.report_number}</div>
                              <div className="text-sm text-neutral-500">
                                Q{report.report_quarter} {report.report_year}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-neutral-900">
                              {report.lender?.legal_name}
                            </div>
                            <div className="text-sm text-neutral-500">
                              {report.lender?.registration_number}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="flex items-center text-neutral-600 mb-1">
                                <DollarSign className="w-3 h-3 mr-1" />
                                Portfolio: N$ {report.total_portfolio.toLocaleString()}
                              </div>
                              <div className="flex items-center text-neutral-600 mb-1">
                                <Users className="w-3 h-3 mr-1" />
                                Loans: {report.total_loans}
                              </div>
                              <div className="flex items-center text-neutral-600">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Default: {report.default_rate}%
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                              {report.status.replace('_', ' ')}
                            </span>
                            {report.is_locked && (
                              <div className="text-xs text-neutral-500 mt-1">Locked</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-cashub-600 hover:text-cashub-900" title="View">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-blue-600 hover:text-blue-900" title="Download">
                                <Download className="w-4 h-4" />
                              </button>
                              {!report.is_locked && (
                                <button className="text-green-600 hover:text-green-900" title="Edit">
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                          No reports found. Generate your first quarterly report.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Requirements Tab */}
          {activeTab === 'requirements' && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Requirement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Frequency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Next Due
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Priority
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {requirements.map((requirement) => (
                      <tr key={requirement.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-neutral-900">{requirement.name}</div>
                            <div className="text-sm text-neutral-500">{requirement.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-2 bg-neutral-100 rounded-lg mr-3">
                              {getCategoryIcon(requirement.category)}
                            </div>
                            <span className="text-sm text-neutral-900 capitalize">
                              {requirement.category.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-neutral-900 capitalize">{requirement.frequency}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900">
                            {new Date(requirement.next_due).toLocaleDateString()}
                          </div>
                          {requirement.last_completed && (
                            <div className="text-xs text-neutral-500">
                              Last: {new Date(requirement.last_completed).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(requirement.status)}`}>
                            {requirement.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(requirement.priority)}`}>
                            {requirement.priority.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Compliance Trends */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Compliance Trends</h3>
                  <div className="bg-neutral-50 rounded-lg p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Q1 2024</span>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm font-medium text-green-600">92%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Q2 2024</span>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm font-medium text-green-600">88%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Q3 2024</span>
                        <div className="flex items-center">
                          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                          <span className="text-sm font-medium text-red-600">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Q4 2024</span>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm font-medium text-green-600">85%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Distribution */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Risk Distribution</h3>
                  <div className="bg-neutral-50 rounded-lg p-6">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-neutral-600">Low Risk</span>
                          <span className="text-sm font-medium">45%</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-neutral-600">Medium Risk</span>
                          <span className="text-sm font-medium">35%</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-neutral-600">High Risk</span>
                          <span className="text-sm font-medium">20%</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
