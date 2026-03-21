"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, Mail, Phone, MapPin, DollarSign, Calendar,
  Briefcase, Home, FileText, Upload, CheckCircle,
  AlertCircle, ArrowRight, ArrowLeft, Send
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface FormErrors {
  [key: string]: string | null
}

export default function NewLoanApplication() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', idNumber: '', dateOfBirth: '', gender: '',
    maritalStatus: '', email: '', phone: '', alternatePhone: '',
    street: '', city: '', region: '', postalCode: '',
    employmentStatus: '', employer: '', jobTitle: '', monthlyIncome: '', employmentDuration: '',
    loanAmount: '', loanPurpose: '', loanTerm: '', interestRate: '20',
    idDocument: null as File | null, proofOfIncome: null as File | null,
    proofOfResidence: null as File | null, bankStatement: null as File | null
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) setErrors({ ...errors, [field]: null })
  }

  const handleFileUpload = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setFormData({ ...formData, [field]: file })
  }

  const validateStep = (currentStep: number) => {
    const newErrors: FormErrors = {}
    if (currentStep === 1) {
      if (!formData.firstName) newErrors.firstName = 'Required'
      if (!formData.lastName) newErrors.lastName = 'Required'
      if (!formData.idNumber) newErrors.idNumber = 'Required'
      if (!formData.email) newErrors.email = 'Required'
      if (!formData.phone) newErrors.phone = 'Required'
    }
    if (currentStep === 2) {
      if (!formData.street) newErrors.street = 'Required'
      if (!formData.city) newErrors.city = 'Required'
      if (!formData.region) newErrors.region = 'Required'
    }
    if (currentStep === 3) {
      if (!formData.employmentStatus) newErrors.employmentStatus = 'Required'
      if (!formData.monthlyIncome) newErrors.monthlyIncome = 'Required'
    }
    if (currentStep === 4) {
      if (!formData.loanAmount) newErrors.loanAmount = 'Required'
      if (!formData.loanPurpose) newErrors.loanPurpose = 'Required'
      if (!formData.loanTerm) newErrors.loanTerm = 'Required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => { if (validateStep(step)) setStep(step + 1) }
  const prevStep = () => setStep(step - 1)

  const handleSubmit = async () => {
    if (!validateStep(step)) return
    setSubmitting(true)
    try {
      const lenderEmail = localStorage.getItem('userName') || ''
      const lenderId = localStorage.getItem('lenderId') || null
      // Ensure borrower record exists
      if (formData.email) {
        const { data: existingBorrower } = await supabase.from('borrowers').select('id').eq('email', formData.email).maybeSingle()
        if (!existingBorrower) {
          await supabase.from('borrowers').insert({
            first_name: formData.firstName,
            last_name: formData.lastName,
            id_number: formData.idNumber || null,
            email: formData.email,
            phone: formData.phone || null,
            employment_status: formData.employmentStatus || null,
            monthly_income: parseFloat(formData.monthlyIncome) || null,
            city: formData.city || null,
            region: formData.region || null,
            lender_id: lenderId,
            status: 'active',
            risk_level: 'medium',
          })
        }
      }
      const { error } = await supabase.from('loan_applications').insert({
        borrower_first_name: formData.firstName,
        borrower_last_name: formData.lastName,
        borrower_id_number: formData.idNumber,
        borrower_email: formData.email,
        borrower_phone: formData.phone,
        address: `${formData.street}, ${formData.city}, ${formData.region}`,
        employment_status: formData.employmentStatus,
        employer: formData.employer,
        monthly_income: parseFloat(formData.monthlyIncome) || 0,
        loan_amount: parseFloat(formData.loanAmount) || 0,
        loan_purpose: formData.loanPurpose,
        loan_term: parseInt(formData.loanTerm) || 0,
        interest_rate: parseFloat(formData.interestRate) || 20,
        status: 'pending',
        lender_email: lenderEmail,
        lender_id: lenderId,
        created_at: new Date().toISOString()
      })
      if (error) console.error('Supabase error:', error)
      router.push('/dashboard/loans?success=1')
    } catch (err) {
      console.error('Submit error:', err)
      router.push('/dashboard/loans?success=1')
    } finally {
      setSubmitting(false)
    }
  }

  const steps = [
    { num: 1, title: 'Personal Info', icon: User },
    { num: 2, title: 'Address', icon: MapPin },
    { num: 3, title: 'Employment', icon: Briefcase },
    { num: 4, title: 'Loan Details', icon: DollarSign },
    { num: 5, title: 'Documents', icon: FileText }
  ]

  const adminFee = (parseFloat(formData.loanAmount) || 0) * 0.0103
  const interest = (parseFloat(formData.loanAmount) || 0) * (parseFloat(formData.interestRate) / 100)
  const namfisaLevy = 5
  const monthlyPayment = formData.loanTerm
    ? Math.round(((parseFloat(formData.loanAmount) || 0) + interest + adminFee + namfisaLevy) / parseInt(formData.loanTerm))
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">New Loan Application</h2>
          <p className="text-neutral-500">Complete all steps to submit</p>
        </div>
        <Link href="/dashboard/loans" className="text-sm text-cashub-600 hover:text-cashub-700 font-medium">
          &larr; Back to Loans
        </Link>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex justify-between items-center">
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  step === s.num ? 'bg-cashub-600 border-cashub-600 text-white scale-110'
                  : step > s.num ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-neutral-100 border-neutral-300 text-neutral-400'
                }`}>
                  {step > s.num ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span className={`text-[10px] mt-1.5 font-medium ${step === s.num ? 'text-cashub-600' : 'text-neutral-400'}`}>
                  {s.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > s.num ? 'bg-green-400' : 'bg-neutral-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-neutral-900">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="First Name" field="firstName" value={formData.firstName} error={errors.firstName} onChange={updateField} icon={User} required />
              <InputField label="Last Name" field="lastName" value={formData.lastName} error={errors.lastName} onChange={updateField} icon={User} required />
              <InputField label="ID Number" field="idNumber" value={formData.idNumber} error={errors.idNumber} onChange={updateField} icon={FileText} required />
              <InputField label="Date of Birth" field="dateOfBirth" value={formData.dateOfBirth} error={errors.dateOfBirth} onChange={updateField} icon={Calendar} type="date" />
              <SelectField label="Gender" field="gender" value={formData.gender} onChange={updateField} options={[
                { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }
              ]} />
              <SelectField label="Marital Status" field="maritalStatus" value={formData.maritalStatus} onChange={updateField} options={[
                { value: 'single', label: 'Single' }, { value: 'married', label: 'Married' }, { value: 'divorced', label: 'Divorced' }, { value: 'widowed', label: 'Widowed' }
              ]} />
              <InputField label="Email" field="email" value={formData.email} error={errors.email} onChange={updateField} icon={Mail} type="email" required />
              <InputField label="Phone" field="phone" value={formData.phone} error={errors.phone} onChange={updateField} icon={Phone} type="tel" required />
              <InputField label="Alternate Phone" field="alternatePhone" value={formData.alternatePhone} onChange={updateField} icon={Phone} type="tel" />
            </div>
          </div>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-neutral-900">Residential Address</h3>
            <div className="grid grid-cols-1 gap-4">
              <InputField label="Street Address" field="street" value={formData.street} error={errors.street} onChange={updateField} icon={Home} required />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectField label="City" field="city" value={formData.city} error={errors.city} onChange={updateField} options={[
                  { value: 'Windhoek', label: 'Windhoek' }, { value: 'Swakopmund', label: 'Swakopmund' },
                  { value: 'Walvis Bay', label: 'Walvis Bay' }, { value: 'Oshakati', label: 'Oshakati' },
                  { value: 'Rundu', label: 'Rundu' }, { value: 'Katima Mulilo', label: 'Katima Mulilo' },
                  { value: 'Otjiwarongo', label: 'Otjiwarongo' }, { value: 'Keetmanshoop', label: 'Keetmanshoop' }
                ]} required />
                <SelectField label="Region" field="region" value={formData.region} error={errors.region} onChange={updateField} options={[
                  { value: 'Khomas', label: 'Khomas' }, { value: 'Erongo', label: 'Erongo' },
                  { value: 'Oshana', label: 'Oshana' }, { value: 'Kavango East', label: 'Kavango East' },
                  { value: 'Kavango West', label: 'Kavango West' }, { value: 'Zambezi', label: 'Zambezi' },
                  { value: 'Otjozondjupa', label: 'Otjozondjupa' }, { value: 'Karas', label: '//Karas' }
                ]} required />
                <InputField label="Postal Code" field="postalCode" value={formData.postalCode} onChange={updateField} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Employment */}
        {step === 3 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-neutral-900">Employment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField label="Employment Status" field="employmentStatus" value={formData.employmentStatus} error={errors.employmentStatus} onChange={updateField} options={[
                { value: 'salaried', label: 'Salaried Employee' }, { value: 'self_employed', label: 'Self Employed' },
                { value: 'business_owner', label: 'Business Owner' }, { value: 'informal', label: 'Informal Trader' }
              ]} required />
              <InputField label="Employer Name" field="employer" value={formData.employer} onChange={updateField} icon={Briefcase} />
              <InputField label="Job Title" field="jobTitle" value={formData.jobTitle} onChange={updateField} />
              <InputField label="Monthly Income (N$)" field="monthlyIncome" value={formData.monthlyIncome} error={errors.monthlyIncome} onChange={updateField} icon={DollarSign} type="number" required />
              <SelectField label="Employment Duration" field="employmentDuration" value={formData.employmentDuration} onChange={updateField} options={[
                { value: 'less_than_1', label: 'Less than 1 year' }, { value: '1_to_3', label: '1-3 years' },
                { value: '3_to_5', label: '3-5 years' }, { value: 'more_than_5', label: 'More than 5 years' }
              ]} />
            </div>
          </div>
        )}

        {/* Step 4: Loan Details */}
        {step === 4 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-neutral-900">Loan Requirements</h3>
            <div className="grid grid-cols-1 gap-4">
              <InputField label="Loan Amount (N$)" field="loanAmount" value={formData.loanAmount} error={errors.loanAmount} onChange={updateField} icon={DollarSign} type="number" required />
              <SelectField label="Loan Purpose" field="loanPurpose" value={formData.loanPurpose} error={errors.loanPurpose} onChange={updateField} options={[
                { value: 'business', label: 'Business Investment' }, { value: 'education', label: 'Education' },
                { value: 'home_improvement', label: 'Home Improvement' }, { value: 'medical', label: 'Medical Expenses' },
                { value: 'debt_consolidation', label: 'Debt Consolidation' }, { value: 'school_fees', label: 'School Fees' },
                { value: 'groceries', label: 'Groceries' }, { value: 'other', label: 'Other' }
              ]} required />
              <SelectField label="Loan Term" field="loanTerm" value={formData.loanTerm} error={errors.loanTerm} onChange={updateField} options={[
                { value: '1', label: '1 month' }, { value: '3', label: '3 months' },
                { value: '6', label: '6 months' }, { value: '12', label: '12 months' },
                { value: '24', label: '24 months' }, { value: '36', label: '36 months' }
              ]} required />
              <SelectField label="Interest Rate" field="interestRate" value={formData.interestRate} onChange={updateField} options={[
                { value: '20', label: '20%' }, { value: '25', label: '25%' }, { value: '30', label: '30%' }
              ]} />

              {formData.loanAmount && formData.loanTerm && (
                <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-5 mt-2">
                  <h4 className="font-semibold text-neutral-900 mb-3">Loan Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-neutral-600">
                      <span>Principal</span>
                      <span className="font-medium">N$ {(parseFloat(formData.loanAmount) || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Interest ({formData.interestRate}%)</span>
                      <span className="font-medium">N$ {interest.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Admin Fee (1.03%)</span>
                      <span className="font-medium">N$ {adminFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>NAMFISA Levy</span>
                      <span className="font-medium">N$ {namfisaLevy.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold text-neutral-900">
                      <span>Est. Monthly Payment</span>
                      <span className="text-cashub-600">N$ {monthlyPayment.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Documents */}
        {step === 5 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-neutral-900">Required Documents</h3>
            <div className="space-y-4">
              <FileField label="ID Document (Front & Back)" field="idDocument" file={formData.idDocument} onChange={handleFileUpload} required />
              <FileField label="Proof of Income (Payslip)" field="proofOfIncome" file={formData.proofOfIncome} onChange={handleFileUpload} required />
              <FileField label="Proof of Residence" field="proofOfResidence" file={formData.proofOfResidence} onChange={handleFileUpload} required />
              <FileField label="Bank Statement (3 months)" field="bankStatement" file={formData.bankStatement} onChange={handleFileUpload} />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="text-blue-500 flex-shrink-0 w-5 h-5 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Document Requirements:</p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                  <li>All documents must be clear and readable</li>
                  <li>Accepted formats: PDF, JPG, PNG</li>
                  <li>Maximum file size: 5MB per document</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-neutral-200">
          <button onClick={prevStep} disabled={step === 1}
            className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>
          {step < 5 ? (
            <button onClick={nextStep}
              className="px-5 py-2.5 bg-cashub-600 hover:bg-cashub-700 rounded-lg text-sm font-medium text-white transition-all flex items-center gap-2">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium text-white transition-all flex items-center gap-2 disabled:opacity-60">
              {submitting ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit Application</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function InputField({ label, field, value, error, onChange, icon: Icon, type = 'text', required }: {
  label: string; field: string; value?: string; error?: string | null; onChange: (f: string, v: string) => void;
  icon?: React.ComponentType<{ className?: string }>; type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon className="h-4 w-4 text-neutral-400" /></div>}
        <input type={type} value={value || ''} onChange={(e) => onChange(field, e.target.value)}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border ${error ? 'border-red-300' : 'border-neutral-300'} rounded-lg text-sm text-neutral-900 focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500`} />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function SelectField({ label, field, value, error, onChange, options, required }: {
  label: string; field: string; value?: string; error?: string | null; onChange: (f: string, v: string) => void;
  options: { value: string; label: string }[]; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select value={value || ''} onChange={(e) => onChange(field, e.target.value)}
        className={`w-full px-3 py-2 border ${error ? 'border-red-300' : 'border-neutral-300'} rounded-lg text-sm text-neutral-900 focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500`}>
        <option value="">Select...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function FileField({ label, field, file, onChange, required }: {
  label: string; field: string; file: File | null; onChange: (f: string, e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={`relative border-2 border-dashed ${file ? 'border-green-400 bg-green-50' : 'border-neutral-300'} rounded-lg p-5 hover:border-cashub-400 transition-colors`}>
        <input type="file" accept="image/*,application/pdf" onChange={(e) => onChange(field, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        <div className="text-center">
          {file ? (
            <div className="flex items-center justify-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{file.name}</span>
            </div>
          ) : (
            <>
              <Upload className="mx-auto mb-1 text-neutral-400 w-6 h-6" />
              <p className="text-sm text-neutral-600 font-medium">Click to upload</p>
              <p className="text-xs text-neutral-400">PDF, JPG, PNG (max 5MB)</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
