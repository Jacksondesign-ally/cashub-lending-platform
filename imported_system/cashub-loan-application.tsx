import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Calendar,
  Briefcase,
  Home,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

const LoanApplicationForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    idNumber: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    email: '',
    phone: '',
    alternatePhone: '',
    
    // Address
    street: '',
    city: '',
    region: '',
    postalCode: '',
    
    // Employment
    employmentStatus: '',
    employer: '',
    jobTitle: '',
    monthlyIncome: '',
    employmentDuration: '',
    
    // Loan Details
    loanAmount: '',
    loanPurpose: '',
    loanTerm: '',
    
    // Documents
    idDocument: null,
    proofOfIncome: null,
    proofOfResidence: null,
    bankStatement: null
  });

  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.idNumber) newErrors.idNumber = 'ID number is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.phone) newErrors.phone = 'Phone is required';
    }
    
    if (currentStep === 2) {
      if (!formData.street) newErrors.street = 'Street address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.region) newErrors.region = 'Region is required';
    }
    
    if (currentStep === 3) {
      if (!formData.employmentStatus) newErrors.employmentStatus = 'Employment status is required';
      if (!formData.monthlyIncome) newErrors.monthlyIncome = 'Monthly income is required';
    }
    
    if (currentStep === 4) {
      if (!formData.loanAmount) newErrors.loanAmount = 'Loan amount is required';
      if (!formData.loanPurpose) newErrors.loanPurpose = 'Loan purpose is required';
      if (!formData.loanTerm) newErrors.loanTerm = 'Loan term is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    if (validateStep(step)) {
      console.log('Form submitted:', formData);
      alert('Loan application submitted successfully!');
    }
  };

  const handleFileUpload = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [field]: file });
    }
  };

  const InputField = ({ icon: Icon, label, type = "text", field, placeholder, required = false }) => (
    <div>
      <label className="block text-sm font-medium text-purple-200 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />}
        <input
          type={type}
          value={formData[field]}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-white/10 border ${errors[field] ? 'border-red-500' : 'border-white/20'} rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent`}
        />
      </div>
      {errors[field] && <p className="text-red-400 text-sm mt-1">{errors[field]}</p>}
    </div>
  );

  const SelectField = ({ icon: Icon, label, field, options, required = false }) => (
    <div>
      <label className="block text-sm font-medium text-purple-200 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />}
        <select
          value={formData[field]}
          onChange={(e) => updateField(field, e.target.value)}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-white/10 border ${errors[field] ? 'border-red-500' : 'border-white/20'} rounded-lg text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent`}
        >
          <option value="" className="bg-slate-800">Select...</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-slate-800">{opt.label}</option>
          ))}
        </select>
      </div>
      {errors[field] && <p className="text-red-400 text-sm mt-1">{errors[field]}</p>}
    </div>
  );

  const FileUploadField = ({ label, field, accept, required = false }) => (
    <div>
      <label className="block text-sm font-medium text-purple-200 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className={`relative border-2 border-dashed ${formData[field] ? 'border-green-400' : 'border-white/20'} rounded-lg p-6 hover:border-purple-400 transition-colors`}>
        <input
          type="file"
          accept={accept}
          onChange={(e) => handleFileUpload(field, e)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="text-center">
          {formData[field] ? (
            <div className="flex items-center justify-center gap-2 text-green-400">
              <CheckCircle size={24} />
              <span className="font-medium">{formData[field].name}</span>
            </div>
          ) : (
            <>
              <Upload className="mx-auto mb-2 text-purple-300" size={32} />
              <p className="text-white font-medium mb-1">Click to upload</p>
              <p className="text-purple-200 text-sm">or drag and drop</p>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const steps = [
    { num: 1, title: 'Personal Info', icon: User },
    { num: 2, title: 'Address', icon: MapPin },
    { num: 3, title: 'Employment', icon: Briefcase },
    { num: 4, title: 'Loan Details', icon: DollarSign },
    { num: 5, title: 'Documents', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Loan Application</h1>
          <p className="text-purple-200">Complete all steps to submit your application</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex justify-between items-center">
            {steps.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    step === s.num 
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400 scale-110' 
                      : step > s.num 
                      ? 'bg-green-500 border-green-400' 
                      : 'bg-white/10 border-white/20'
                  }`}>
                    {step > s.num ? (
                      <CheckCircle className="text-white" size={24} />
                    ) : (
                      <s.icon className="text-white" size={20} />
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${step === s.num ? 'text-white' : 'text-purple-200'}`}>
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${step > s.num ? 'bg-green-400' : 'bg-white/20'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-8">
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField icon={User} label="First Name" field="firstName" placeholder="John" required />
                <InputField icon={User} label="Last Name" field="lastName" placeholder="Doe" required />
                <InputField icon={FileText} label="ID Number" field="idNumber" placeholder="85010112345" required />
                <InputField icon={Calendar} label="Date of Birth" field="dateOfBirth" type="date" required />
                <SelectField 
                  label="Gender" 
                  field="gender" 
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' }
                  ]}
                  required 
                />
                <SelectField 
                  label="Marital Status" 
                  field="maritalStatus" 
                  options={[
                    { value: 'single', label: 'Single' },
                    { value: 'married', label: 'Married' },
                    { value: 'divorced', label: 'Divorced' },
                    { value: 'widowed', label: 'Widowed' }
                  ]}
                  required 
                />
                <InputField icon={Mail} label="Email Address" field="email" type="email" placeholder="john.doe@example.com" required />
                <InputField icon={Phone} label="Phone Number" field="phone" type="tel" placeholder="+264811234567" required />
                <InputField icon={Phone} label="Alternate Phone" field="alternatePhone" type="tel" placeholder="+264812345678" />
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Residential Address</h2>
              <div className="grid grid-cols-1 gap-6">
                <InputField icon={Home} label="Street Address" field="street" placeholder="123 Main Street" required />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SelectField 
                    icon={MapPin}
                    label="City" 
                    field="city" 
                    options={[
                      { value: 'windhoek', label: 'Windhoek' },
                      { value: 'swakopmund', label: 'Swakopmund' },
                      { value: 'walvis_bay', label: 'Walvis Bay' },
                      { value: 'oshakati', label: 'Oshakati' },
                      { value: 'rundu', label: 'Rundu' }
                    ]}
                    required 
                  />
                  <SelectField 
                    label="Region" 
                    field="region" 
                    options={[
                      { value: 'khomas', label: 'Khomas' },
                      { value: 'erongo', label: 'Erongo' },
                      { value: 'oshana', label: 'Oshana' },
                      { value: 'kavango', label: 'Kavango' }
                    ]}
                    required 
                  />
                  <InputField label="Postal Code" field="postalCode" placeholder="9000" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Employment */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Employment Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField 
                  icon={Briefcase}
                  label="Employment Status" 
                  field="employmentStatus" 
                  options={[
                    { value: 'salaried', label: 'Salaried Employee' },
                    { value: 'self_employed', label: 'Self Employed' },
                    { value: 'business_owner', label: 'Business Owner' },
                    { value: 'informal', label: 'Informal Trader' }
                  ]}
                  required 
                />
                <InputField icon={Briefcase} label="Employer Name" field="employer" placeholder="ABC Company" />
                <InputField label="Job Title" field="jobTitle" placeholder="Manager" />
                <InputField icon={DollarSign} label="Monthly Income (NAD)" field="monthlyIncome" type="number" placeholder="15000" required />
                <SelectField 
                  label="Employment Duration" 
                  field="employmentDuration" 
                  options={[
                    { value: 'less_than_1', label: 'Less than 1 year' },
                    { value: '1_to_3', label: '1-3 years' },
                    { value: '3_to_5', label: '3-5 years' },
                    { value: 'more_than_5', label: 'More than 5 years' }
                  ]}
                />
              </div>
            </div>
          )}

          {/* Step 4: Loan Details */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Loan Requirements</h2>
              <div className="grid grid-cols-1 gap-6">
                <InputField 
                  icon={DollarSign} 
                  label="Requested Loan Amount (NAD)" 
                  field="loanAmount" 
                  type="number" 
                  placeholder="50000" 
                  required 
                />
                <SelectField 
                  label="Loan Purpose" 
                  field="loanPurpose" 
                  options={[
                    { value: 'business', label: 'Business Investment' },
                    { value: 'education', label: 'Education' },
                    { value: 'home_improvement', label: 'Home Improvement' },
                    { value: 'medical', label: 'Medical Expenses' },
                    { value: 'debt_consolidation', label: 'Debt Consolidation' },
                    { value: 'other', label: 'Other' }
                  ]}
                  required 
                />
                <SelectField 
                  icon={Calendar}
                  label="Loan Term" 
                  field="loanTerm" 
                  options={[
                    { value: '3', label: '3 months' },
                    { value: '6', label: '6 months' },
                    { value: '12', label: '12 months' },
                    { value: '24', label: '24 months' },
                    { value: '36', label: '36 months' }
                  ]}
                  required 
                />
                
                {/* Loan Summary */}
                {formData.loanAmount && formData.loanTerm && (
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-6 mt-4">
                    <h3 className="text-white font-semibold mb-4">Estimated Loan Summary</h3>
                    <div className="space-y-2 text-purple-100">
                      <div className="flex justify-between">
                        <span>Loan Amount:</span>
                        <span className="font-semibold">NAD {parseInt(formData.loanAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Interest Rate:</span>
                        <span className="font-semibold">15% per annum</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Term:</span>
                        <span className="font-semibold">{formData.loanTerm} months</span>
                      </div>
                      <div className="border-t border-purple-400/30 pt-2 mt-2">
                        <div className="flex justify-between text-white font-bold">
                          <span>Monthly Payment:</span>
                          <span>NAD {Math.round((parseInt(formData.loanAmount) * 1.15) / parseInt(formData.loanTerm)).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Documents */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Required Documents</h2>
              <div className="space-y-4">
                <FileUploadField 
                  label="ID Document (Front & Back)" 
                  field="idDocument" 
                  accept="image/*,application/pdf"
                  required 
                />
                <FileUploadField 
                  label="Proof of Income (Payslip/Bank Statement)" 
                  field="proofOfIncome" 
                  accept="image/*,application/pdf"
                  required 
                />
                <FileUploadField 
                  label="Proof of Residence (Utility Bill)" 
                  field="proofOfResidence" 
                  accept="image/*,application/pdf"
                  required 
                />
                <FileUploadField 
                  label="Bank Statement (Last 3 months)" 
                  field="bankStatement" 
                  accept="application/pdf"
                />
              </div>

              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mt-6">
                <div className="flex gap-3">
                  <AlertCircle className="text-blue-300 flex-shrink-0" size={20} />
                  <div className="text-blue-100 text-sm">
                    <p className="font-semibold mb-1">Document Requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>All documents must be clear and readable</li>
                      <li>Accepted formats: PDF, JPG, PNG</li>
                      <li>Maximum file size: 5MB per document</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/20">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Previous
            </button>
            
            {step < 5 ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
              >
                Next
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg text-white font-medium transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
              >
                <CheckCircle size={20} />
                Submit Application
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApplicationForm;