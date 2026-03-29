"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Shield, FileText, Calendar, AlertCircle, CheckCircle, 
  Clock, Download, Send, TrendingUp, TrendingDown, 
  BarChart3, PieChart, Activity, Bell, Eye, RefreshCw, 
  Upload, Award, XCircle, DollarSign, Users, AlertTriangle, 
  FileCheck, Target, Edit
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

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

interface LenderOption { id: string; legal_name: string; registration_number: string }

export default function CompliancePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'requirements' | 'analytics'>('overview')
  const [reports, setReports] = useState<ComplianceReport[]>([])
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuarter, setSelectedQuarter] = useState('Q4-2024')
  const [complianceScore, setComplianceScore] = useState(85)
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [lenderOptions, setLenderOptions] = useState<LenderOption[]>([])
  const [showNewReport, setShowNewReport] = useState(false)
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [newReport, setNewReport] = useState({
    lender_id: '', report_year: new Date().getFullYear(), report_quarter: Math.ceil((new Date().getMonth() + 1) / 3),
    total_loans: '', total_portfolio: '', default_rate: '', collection_rate: '', new_borrowers: '', active_borrowers: ''
  })

  useEffect(() => {
    const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
    const allowedRoles = ['super_admin', 'admin', 'lender_admin', 'lender', 'viewer']
    if (role && allowedRoles.includes(role)) {
      setAllowed(true)
      fetchComplianceData()
    } else {
      setAllowed(false)
    }
  }, [])

  const fetchComplianceData = async () => {
    try {
      setLoading(true)
      
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

      // Fetch compliance requirements from database
      const { data: reqData, error: reqError } = await supabase
        .from('compliance_requirements')
        .select('*')
        .order('due_date', { ascending: true })

      if (reqError) throw reqError

      setReports(reportsData || [])
      setRequirements(reqData || [])

      const { data: lendersData } = await supabase
        .from('lenders')
        .select('id, legal_name, registration_number')
        .eq('is_active', true)
        .order('legal_name')
      setLenderOptions(lendersData || [])
    } catch (error) {
      console.error('Error fetching compliance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitNewReport = async () => {
    if (!newReport.lender_id) return
    setReportSubmitting(true)
    try {
      const quarter = newReport.report_quarter
      const year = newReport.report_year
      const reportNumber = `NAMFISA-${year}-Q${quarter}-${newReport.lender_id.slice(0, 6).toUpperCase()}`
      const { error } = await supabase.from('namfisa_reports').insert({
        lender_id: newReport.lender_id,
        report_number: reportNumber,
        report_year: year,
        report_quarter: quarter,
        total_loans: parseInt(newReport.total_loans) || 0,
        total_portfolio: parseFloat(newReport.total_portfolio) || 0,
        default_rate: parseFloat(newReport.default_rate) || 0,
        collection_rate: parseFloat(newReport.collection_rate) || 0,
        new_borrowers: parseInt(newReport.new_borrowers) || 0,
        active_borrowers: parseInt(newReport.active_borrowers) || 0,
        status: 'submitted',
        submission_date: new Date().toISOString(),
        is_locked: false,
      })
      if (error) throw error
      setShowNewReport(false)
      setNewReport({ lender_id: '', report_year: new Date().getFullYear(), report_quarter: Math.ceil((new Date().getMonth() + 1) / 3), total_loans: '', total_portfolio: '', default_rate: '', collection_rate: '', new_borrowers: '', active_borrowers: '' })
      await fetchComplianceData()
    } catch (err) {
      console.error('Error submitting compliance report:', err)
    }
    setReportSubmitting(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-50 text-green-700 border-green-100'
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100'
      case 'overdue': return 'bg-red-50 text-red-700 border-red-100'
      case 'non_compliant': return 'bg-red-50 text-red-700 border-red-100'
      case 'draft': return 'bg-neutral-50 text-neutral-700 border-neutral-100'
      case 'submitted': return 'bg-blue-50 text-blue-700 border-blue-100'
      case 'under_review': return 'bg-yellow-50 text-yellow-700 border-yellow-100'
      case 'approved': return 'bg-green-50 text-green-700 border-green-100'
      case 'rejected': return 'bg-red-50 text-red-700 border-red-100'
      default: return 'bg-neutral-50 text-neutral-700 border-neutral-100'
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
      default: return 'text-neutral-600 bg-neutral-50'
    }
  }

  if (allowed === false) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Access restricted</h1>
        <p className="text-neutral-500 text-sm max-w-md">
          The NAMFISA compliance module is available to system administrators only. Contact your administrator if you need access.
        </p>
      </div>
    )
  }

  if (loading || allowed === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cashub-600"></div>
      </div>
    )
  }

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">NAMFISA Compliance</h1>
          <p className="text-neutral-500">Regulatory compliance monitoring and reporting</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500 outline-none"
          >
            <option value="Q4-2024">Q4 2024</option>
            <option value="Q3-2024">Q3 2024</option>
            <option value="Q2-2024">Q2 2024</option>
            <option value="Q1-2024">Q1 2024</option>
          </select>
          <button onClick={() => setShowNewReport(true)} className="inline-flex items-center px-4 py-2 bg-cashub-600 text-white rounded-lg hover:bg-cashub-700 transition-colors">
            <Send className="w-4 h-4 mr-2" />
            Submit Report
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
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
            <p className="mt-2 text-cashub-100 max-w-lg">
              Your platform meets most regulatory requirements. Review pending items for full compliance.
            </p>
          </div>
          <div className="hidden sm:flex w-24 h-24 bg-white/20 rounded-full items-center justify-center">
            <Target className="w-12 h-12 text-white" />
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
              <p className="text-2xl font-bold text-neutral-900 mt-1">Jan 15</p>
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
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'reports', label: 'Quarterly Reports', icon: FileText, count: reports.length },
              { id: 'requirements', label: 'Requirements', icon: Shield, count: requirements.length },
              { id: 'analytics', label: 'Analytics', icon: PieChart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-cashub-500 text-cashub-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 bg-neutral-100 text-neutral-600 py-1 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Compliance Alerts</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800">Capital Adequacy Assessment Overdue</p>
                      <p className="text-sm text-red-600 mt-1">Was due on January 5, 2024 - Immediate action required</p>
                      <span className="inline-block mt-2 text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded">High Priority</span>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg flex items-start">
                    <Clock className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-800">Loan Portfolio Analysis Due Soon</p>
                      <p className="text-sm text-yellow-600 mt-1">Due on January 15, 2024 - 5 days remaining</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Metric Performance</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Reporting Compliance', value: 95, color: 'bg-green-500' },
                    { label: 'Risk Management', value: 78, color: 'bg-yellow-500' },
                    { label: 'Capital Requirements', value: 65, color: 'bg-red-500' },
                    { label: 'Consumer Protection', value: 88, color: 'bg-green-500' }
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-neutral-700">{metric.label}</span>
                        <span className="text-sm font-bold text-neutral-900">{metric.value}%</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2">
                        <div className={`${metric.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${metric.value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-y border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Report</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Lender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Key Metrics</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {reports.length > 0 ? (
                    reports.map((report) => (
                      <tr key={report.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-900">{report.report_number}</div>
                          <div className="text-sm text-neutral-500">Q{report.report_quarter} {report.report_year}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900">{report.lender?.legal_name}</div>
                          <div className="text-sm text-neutral-500">{report.lender?.registration_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs space-y-1">
                            <div className="text-neutral-600">Portfolio: N$ {report.total_portfolio.toLocaleString()}</div>
                            <div className="text-neutral-600">Default Rate: {report.default_rate}%</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-neutral-400 hover:text-cashub-600 transition-colors"><Eye className="w-4 h-4" /></button>
                            <button className="text-neutral-400 hover:text-blue-600 transition-colors"><Download className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                        <div className="flex flex-col items-center justify-center">
                          <FileText className="w-12 h-12 text-neutral-200 mb-4" />
                          <p>No reports found for the selected period.</p>
                          <button className="mt-4 text-cashub-600 font-medium hover:underline">Generate Quarter Report</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-y border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Requirement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Priority</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {requirements.map((req) => (
                    <tr key={req.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-neutral-900">{req.name}</div>
                        <div className="text-xs text-neutral-500">{req.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-neutral-900">
                          <span className="mr-2 text-neutral-400">{getCategoryIcon(req.category)}</span>
                          <span className="capitalize">{req.category.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {new Date(req.next_due).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(req.priority)}`}>
                          {req.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-neutral-50 rounded-xl">
                <h4 className="font-semibold text-neutral-900 mb-6 flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-cashub-600" />
                  Compliance Score History
                </h4>
                <div className="space-y-4">
                  {[
                    { period: 'Q4 2024', score: 85, trend: 'up' },
                    { period: 'Q3 2024', score: 82, trend: 'down' },
                    { period: 'Q2 2024', score: 88, trend: 'up' },
                    { period: 'Q1 2024', score: 92, trend: 'up' }
                  ].map((item) => (
                    <div key={item.period} className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">{item.period}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-neutral-200 rounded-full h-1.5">
                          <div className="bg-cashub-500 h-1.5 rounded-full" style={{ width: `${item.score}%` }}></div>
                        </div>
                        <span className="text-sm font-bold text-neutral-900 w-8">{item.score}%</span>
                        {item.trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-neutral-50 rounded-xl">
                <h4 className="font-semibold text-neutral-900 mb-6 flex items-center">
                  <PieChart className="w-4 h-4 mr-2 text-cashub-600" />
                  Risk Category Distribution
                </h4>
                <div className="space-y-4">
                  {[
                    { label: 'Low Risk', value: 45, color: 'bg-green-500' },
                    { label: 'Medium Risk', value: 35, color: 'bg-yellow-500' },
                    { label: 'High Risk', value: 20, color: 'bg-red-500' }
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-600">{item.label}</span>
                        <span className="font-bold text-neutral-900">{item.value}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-1.5">
                        <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Submit New Report Modal */}
    {showNewReport && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Submit NAMFISA Compliance Report</h2>
              <p className="text-xs text-neutral-500">Submit a quarterly regulatory report on behalf of a lender</p>
            </div>
            <button onClick={() => setShowNewReport(false)} className="p-1.5 hover:bg-neutral-100 rounded-lg">
              <XCircle className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Lender <span className="text-red-500">*</span></label>
              <select value={newReport.lender_id} onChange={e => setNewReport({...newReport, lender_id: e.target.value})}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 bg-white">
                <option value="">Select lender...</option>
                {lenderOptions.map(l => (
                  <option key={l.id} value={l.id}>{l.legal_name} ({l.registration_number})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Report Year</label>
                <input type="number" value={newReport.report_year} min={2020} max={2030}
                  onChange={e => setNewReport({...newReport, report_year: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Quarter</label>
                <select value={newReport.report_quarter} onChange={e => setNewReport({...newReport, report_quarter: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500 bg-white">
                  <option value={1}>Q1 (Jan–Mar)</option>
                  <option value={2}>Q2 (Apr–Jun)</option>
                  <option value={3}>Q3 (Jul–Sep)</option>
                  <option value={4}>Q4 (Oct–Dec)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Total Loans</label>
                <input type="number" value={newReport.total_loans} min={0}
                  onChange={e => setNewReport({...newReport, total_loans: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Total Portfolio (N$)</label>
                <input type="number" value={newReport.total_portfolio} min={0}
                  onChange={e => setNewReport({...newReport, total_portfolio: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Default Rate (%)</label>
                <input type="number" step="0.1" value={newReport.default_rate} min={0} max={100}
                  onChange={e => setNewReport({...newReport, default_rate: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Collection Rate (%)</label>
                <input type="number" step="0.1" value={newReport.collection_rate} min={0} max={100}
                  onChange={e => setNewReport({...newReport, collection_rate: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">New Borrowers</label>
                <input type="number" value={newReport.new_borrowers} min={0}
                  onChange={e => setNewReport({...newReport, new_borrowers: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Active Borrowers</label>
                <input type="number" value={newReport.active_borrowers} min={0}
                  onChange={e => setNewReport({...newReport, active_borrowers: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500" />
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-neutral-200 flex gap-3">
            <button onClick={() => setShowNewReport(false)}
              className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700 transition-all">Cancel</button>
            <button onClick={submitNewReport} disabled={!newReport.lender_id || reportSubmitting}
              className="flex-1 px-4 py-2.5 bg-cashub-600 hover:bg-cashub-700 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {reportSubmitting ? <><RefreshCw className="w-4 h-4 animate-spin" />Submitting...</> : <><Send className="w-4 h-4" />Submit Report</>}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
