import React, { useState } from 'react';
import { 
  Building2,
  FileText,
  Shield,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  Globe
} from 'lucide-react';

const LenderOnboarding = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('MEDIUM');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [formData, setFormData] = useState({
    // Company Information
    legalName: '',
    tradingName: '',
    registrationNumber: '',
    taxNumber: '',
    namfisaLicenseNumber: '',
    registrationDate: '',
    businessType: '',
    
    // Contact Information
    physicalAddress: '',
    city: '',
    region: '',
    postalCode: '',
    email: '',
    phone: '',
    website: '',
    
    // Primary Contact Person
    contactFirstName: '',
    contactLastName: '',
    contactPosition: '',
    contactEmail: '',
    contactPhone: '',
    
    // Account Setup
    adminEmail: '',
    adminPassword: '',
    adminConfirmPassword: '',
    
    // Documents
    registrationCertificate: null,
    namfisaLicenseDoc: null,
    taxClearance: null,
    directorIds: null,
    
    // Subscription
    selectedPackage: 'MEDIUM',
    paymentMethod: '',
    agreedToTerms: false
  });

  const [errors, setErrors] = useState({});

  const packages = [
    {
      id: 'BASIC',
      name: 'Basic',
      price: 2500,
      popular: false,
      features: ['100 borrowers', 'View blacklist', 'Monthly reports', 'Single user']
    },
    {
      id: 'MEDIUM',
      name: 'Professional',
      price: 5500,
      popular: true,
      features: ['500 borrowers', 'Create blacklist', 'Dispute resolution', 'Advanced reports', 'Single user']
    },
    {
      id: 'ADVANCED',
      name: 'Advanced',
      price: 12000,
      popular: false,
      features: ['2000 borrowers', 'API access', 'NAMFISA automation', 'Multi-user (5)', 'Priority support']
    }
  ];

  const businessTypes = [
    { value: 'microfinance', label: 'Microfinance Institution' },
    { value: 'credit_provider', label: 'Credit Provider' },
    { value: 'cooperative', label: 'Savings & Credit Cooperative' },
    { value: 'bank', label: 'Commercial Bank' },
    { value: 'other', label: 'Other Financial Institution' }
  ];

  const regions = [
    { value: 'khomas', label: 'Khomas' },
    { value: 'erongo', label: 'Erongo' },
    { value: 'oshana', label: 'Oshana' },
    { value: 'kavango_east', label: 'Kavango East' },
    { value: 'kavango_west', label: 'Kavango West' },
    { value: 'ohangwena', label: 'Ohangwena' },
    { value: 'omusati', label: 'Omusati' },
    { value: 'oshikoto', label: 'Oshikoto' },
    { value: 'otjozondjupa', label: 'Otjozondjupa' },
    { value: 'omaheke', label: 'Omaheke' },
    { value: 'hardap', label: 'Hardap' },
    { value: 'karas', label: 'Karas' },
    { value: 'kunene', label: 'Kunene' },
    { value: 'zambezi', label: 'Zambezi' }
  ];

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleFileUpload = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [field]: file });
      if (errors[field]) {
        setErrors({ ...errors, [field]: null });
      }
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.legalName) newErrors.legalName = 'Legal name is required';
      if (!formData.registrationNumber) newErrors.registrationNumber = 'Registration number is required';
      if (!formData.namfisaLicenseNumber) newErrors.namfisaLicenseNumber = 'NAMFISA license number is required';
      if (!formData.businessType) newErrors.businessType = 'Business type is required';
    }
    
    if (currentStep === 2) {
      if (!formData.physicalAddress) newErrors.physicalAddress = 'Physical address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.region) newErrors.region = 'Region is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.phone) newErrors.phone = 'Phone is required';
    }
    
    if (currentStep === 3) {
      if (!formData.contactFirstName) newErrors.contactFirstName = 'First name is required';
      if (!formData.contactLastName) newErrors.contactLastName = 'Last name is required';
      if (!formData.contactEmail) newErrors.contactEmail = 'Email is required';
      if (!formData.contactPhone) newErrors.contactPhone = 'Phone is required';
    }
    
    if (currentStep === 4) {
      if (!formData.registrationCertificate) newErrors.registrationCertificate = 'Registration certificate is required';
      if (!formData.namfisaLicenseDoc) newErrors.namfisaLicenseDoc = 'NAMFISA license is required';
      if (!formData.taxClearance) newErrors.taxClearance = 'Tax clearance is required';
    }
    
    if (currentStep === 5) {
      if (!formData.adminEmail) newErrors.adminEmail = 'Admin email is required';
      if (!formData.adminPassword) newErrors.adminPassword = 'Password is required';
      if (formData.adminPassword !== formData.adminConfirmPassword) {
        newErrors.adminConfirmPassword = 'Passwords do not match';
      }
      if (formData.adminPassword && formData.adminPassword.length < 8) {
        newErrors.adminPassword = 'Password must be at least 8 characters';
      }
    }
    
    if (currentStep === 6) {
      if (!agreedToTerms) newErrors.agreedToTerms = 'You must agree to the terms';
      if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = () => {
    if (validateStep(step)) {
      console.log('Registration submitted:', formData);
      setStep(7); // Success page
    }
  };

  const steps = [
    { num: 1, title: 'Company Details', icon: Building2 },
    { num: 2, title: 'Contact Info', icon: MapPin },
    { num: 3, title: 'Primary Contact', icon: User },
    { num: 4, title: 'Documents', icon: FileText },
    { num: 5, title: 'Account Setup', icon: Lock },
    { num: 6, title: 'Subscription', icon: CreditCard }
  ];

  const InputField = ({ icon: Icon, label, type = "text", field, placeholder, required = false, disabled = false }) => (
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
          disabled={disabled}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-white/10 border ${errors[field] ? 'border-red-500' : 'border-white/20'} rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
      <div className={`relative border-2 border-dashed ${formData[field] ? 'border-green-400 bg-green-500/10' : errors[field] ? 'border-red-500' : 'border-white/20'} rounded-lg p-6 hover:border-purple-400 transition-colors`}>
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
              <p className="text-purple-200 text-sm">PDF, JPG, or PNG (max 5MB)</p>
            </>
          )}
        </div>
      </div>
      {errors[field] && <p className="text-red-400 text-sm mt-1">{errors[field]}</p>}
    </div>
  );

  if (step === 7) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-12">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-white" size={48} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Registration Successful!</h1>
            <p className="text-purple-200 text-lg mb-8">
              Welcome to CasHuB! Your lender account has been created and is pending verification.
            </p>
            
            <div className="bg-white/5 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-white font-semibold mb-4">What happens next?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-purple-200 text-sm">Our compliance team will verify your documents (1-2 business days)</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-purple-200 text-sm">You'll receive an email confirmation once approved</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-purple-200 text-sm">Your 30-day free trial will start immediately after approval</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-purple-200 text-sm">You can start managing borrowers right away</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8">
              <p className="text-blue-200 text-sm">
                We've sent a verification email to <strong>{formData.adminEmail}</strong>. Please check your inbox and verify your email address.
              </p>
            </div>

            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition-all hover:scale-105 shadow-lg">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Building2 className="text-white" size={24} />
            </div>
            <h1 className="text-4xl font-bold text-white">CasHuB</h1>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Lender Registration</h2>
          <p className="text-purple-200">Join Namibia's leading lending management platform</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex justify-between items-center overflow-x-auto">
            {steps.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center min-w-[100px]">
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
                  <span className={`text-xs mt-2 font-medium text-center ${step === s.num ? 'text-white' : 'text-purple-200'}`}>
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 min-w-[40px] ${step > s.num ? 'bg-green-400' : 'bg-white/20'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-8">
          {/* Step 1: Company Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Company Information</h2>
                <p className="text-purple-200">Tell us about your lending institution</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <InputField 
                    icon={Building2} 
                    label="Legal Company Name" 
                    field="legalName" 
                    placeholder="ABC Microfinance Ltd" 
                    required 
                  />
                </div>
                <InputField 
                  label="Trading Name (if different)" 
                  field="tradingName" 
                  placeholder="ABC Loans" 
                />
                <InputField 
                  icon={Hash} 
                  label="Company Registration Number" 
                  field="registrationNumber" 
                  placeholder="2023/12345" 
                  required 
                />
                <InputField 
                  icon={Hash} 
                  label="Tax Identification Number" 
                  field="taxNumber" 
                  placeholder="123456789" 
                  required 
                />
                <InputField 
                  icon={Shield} 
                  label="NAMFISA License Number" 
                  field="namfisaLicenseNumber" 
                  placeholder="NAMFISA-2023-001" 
                  required 
                />
                <InputField 
                  icon={Calendar} 
                  label="Registration Date" 
                  field="registrationDate" 
                  type="date" 
                  required 
                />
                <div className="md:col-span-2">
                  <SelectField 
                    icon={Building2} 
                    label="Business Type" 
                    field="businessType" 
                    options={businessTypes} 
                    required 
                  />
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="text-blue-300 flex-shrink-0" size={20} />
                  <p className="text-blue-200 text-sm">
                    All information must match your official registration documents. This will be verified by our compliance team.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Contact Information</h2>
                <p className="text-purple-200">Where can we reach your business?</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <InputField 
                  icon={MapPin} 
                  label="Physical Address" 
                  field="physicalAddress" 
                  placeholder="123 Main Street, Building A" 
                  required 
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField 
                    label="City/Town" 
                    field="city" 
                    placeholder="Windhoek" 
                    required 
                  />
                  <SelectField 
                    label="Region" 
                    field="region" 
                    options={regions} 
                    required 
                  />
                  <InputField 
                    label="Postal Code" 
                    field="postalCode" 
                    placeholder="9000" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField 
                    icon={Mail} 
                    label="Business Email" 
                    field="email" 
                    type="email" 
                    placeholder="info@abcloans.na" 
                    required 
                  />
                  <InputField 
                    icon={Phone} 
                    label="Business Phone" 
                    field="phone" 
                    type="tel" 
                    placeholder="+264611234567" 
                    required 
                  />
                </div>
                <InputField 
                  icon={Globe} 
                  label="Website (optional)" 
                  field="website" 
                  placeholder="https://www.abcloans.na" 
                />
              </div>
            </div>
          )}

          {/* Step 3: Primary Contact Person */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Primary Contact Person</h2>
                <p className="text-purple-200">Who should we contact regarding this account?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField 
                  icon={User} 
                  label="First Name" 
                  field="contactFirstName" 
                  placeholder="John" 
                  required 
                />
                <InputField 
                  icon={User} 
                  label="Last Name" 
                  field="contactLastName" 
                  placeholder="Doe" 
                  required 
                />
                <InputField 
                  label="Position/Title" 
                  field="contactPosition" 
                  placeholder="Managing Director" 
                  required 
                />
                <InputField 
                  icon={Mail} 
                  label="Email Address" 
                  field="contactEmail" 
                  type="email" 
                  placeholder="john.doe@abcloans.na" 
                  required 
                />
                <InputField 
                  icon={Phone} 
                  label="Phone Number" 
                  field="contactPhone" 
                  type="tel" 
                  placeholder="+264811234567" 
                  required 
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="text-yellow-300 flex-shrink-0" size={20} />
                  <p className="text-yellow-200 text-sm">
                    This person will receive all important communications regarding your account, including compliance updates and billing notifications.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Required Documents</h2>
                <p className="text-purple-200">Upload your business verification documents</p>
              </div>

              <div className="space-y-4">
                <FileUploadField 
                  label="Company Registration Certificate" 
                  field="registrationCertificate" 
                  accept="application/pdf,image/*" 
                  required 
                />
                <FileUploadField 
                  label="NAMFISA License" 
                  field="namfisaLicenseDoc" 
                  accept="application/pdf,image/*" 
                  required 
                />
                <FileUploadField 
                  label="Tax Clearance Certificate" 
                  field="taxClearance" 
                  accept="application/pdf,image/*" 
                  required 
                />
                <FileUploadField 
                  label="Director ID Copies" 
                  field="directorIds" 
                  accept="application/pdf,image/*" 
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="text-blue-300 flex-shrink-0" size={20} />
                  <div className="text-blue-200 text-sm">
                    <p className="font-semibold mb-2">Document Requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>All documents must be clear and legible</li>
                      <li>Accepted formats: PDF, JPG, PNG</li>
                      <li>Maximum file size: 5MB per document</li>
                      <li>Documents must be valid and not expired</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Account Setup */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Account Setup</h2>
                <p className="text-purple-200">Create your administrator account</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <InputField 
                  icon={Mail} 
                  label="Administrator Email" 
                  field="adminEmail" 
                  type="email" 
                  placeholder="admin@abcloans.na" 
                  required 
                />
                
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.adminPassword}
                      onChange={(e) => updateField('adminPassword', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 bg-white/10 border ${errors.adminPassword ? 'border-red-500' : 'border-white/20'} rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-purple-100"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.adminPassword && <p className="text-red-400 text-sm mt-1">{errors.adminPassword}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.adminConfirmPassword}
                      onChange={(e) => updateField('adminConfirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${