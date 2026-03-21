import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText,
  User,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Download,
  Edit,
  Shield,
  Clock,
  Eye,
  ChevronRight,
  Camera,
  Smartphone,
  Mail,
  ArrowRight,
  ArrowLeft,
  Lock,
  Info
} from 'lucide-react';

const LoanAgreementBorrower = () => {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToCoolingOff, setAgreedToCoolingOff] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState('');
  const [signature, setSignature] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  
  const agreementRef = useRef(null);
  const canvasRef = useRef(null);

  // Borrower data
  const borrowerData = {
    firstName: 'John',
    lastName: 'Doe',
    idNumber: '85010112345',
    email: 'john.doe@email.com',
    phone: '+264811234567',
    address: '123 Main Street, Windhoek',
    employer: 'ABC Corporation',
    jobTitle: 'Manager',
    monthlyIncome: 25000,
    bankName: 'Bank Windhoek',
    accountNumber: '****5678',
    accountType: 'Savings'
  };

  // Loan details
  const loanDetails = {
    requestedAmount: 50000,
    loanPeriod: 12,
    interestRate: 15,
    financeCharges: 7500,
    totalRepayable: 57500,
    monthlyInstalment: 4792,
    firstPaymentDate: '2024-03-01',
    finalPaymentDate: '2025-02-01',
    loanPurpose: 'Business Investment',
    applicationDate: '2024-01-22'
  };

  // Handle agreement scroll
  const handleAgreementScroll = (e) => {
    const element = e.target;
    const isBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (isBottom && !scrolledToBottom) {
      setScrolledToBottom(true);
    }
  };

  // Canvas signature drawing
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignature(canvasRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  const sendOTP = () => {
    alert('OTP sent to your phone and email!');
  };

  const completeAgreement = () => {
    if (signatureMethod === 'draw' && !signature) {
      alert('Please provide your signature');
      return;
    }
    if (signatureMethod === 'otp' && otpCode.length !== 6) {
      alert('Please enter the 6-digit OTP');
      return;
    }
    setCurrentScreen(6);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium text-sm">Step {currentScreen} of 6</span>
            <span className="text-purple-200 text-sm">{Math.round((currentScreen / 6) * 100)}% Complete</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
              style={{ width: `${(currentScreen / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Screen 1: Loan Application Overview */}
        {currentScreen === 1 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-white" size={40} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome, {borrowerData.firstName}!</h1>
              <p className="text-purple-200">Let's complete your loan agreement</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Loan Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-purple-200 text-sm mb-1">Requested Amount</p>
                  <p className="text-2xl font-bold text-white">NAD {loanDetails.requestedAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-purple-200 text-sm mb-1">Loan Period</p>
                  <p className="text-2xl font-bold text-white">{loanDetails.loanPeriod} Months</p>
                </div>
                <div>
                  <p className="text-purple-200 text-sm mb-1">Monthly Instalment</p>
                  <p className="text-2xl font-bold text-white">NAD {loanDetails.monthlyInstalment.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <Info className="text-blue-300 flex-shrink-0" size={20} />
                <div className="text-blue-200 text-sm">
                  <p className="font-semibold mb-1">What's Next?</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Verify your personal information</li>
                    <li>Review loan terms and disclosures</li>
                    <li>Read and sign the digital agreement</li>
                    <li>Receive funds within 24-48 hours</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentScreen(2)}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              Continue to Agreement
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* Screen 2: Personal Information (Read-Only) */}
        {currentScreen === 2 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Confirm Your Information</h2>
            <p className="text-purple-200 mb-6">Please verify that all details below are correct</p>

            {/* Personal Details */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User size={20} />
                  Personal Details
                </h3>
                <button className="text-purple-300 hover:text-purple-100 text-sm flex items-center gap-1">
                  <Edit size={16} />
                  Request Edit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-purple-200">Full Name</p>
                  <p className="text-white font-medium">{borrowerData.firstName} {borrowerData.lastName}</p>
                </div>
                <div>
                  <p className="text-purple-200">ID Number</p>
                  <p className="text-white font-medium">{borrowerData.idNumber}</p>
                </div>
                <div>
                  <p className="text-purple-200">Email</p>
                  <p className="text-white font-medium">{borrowerData.email}</p>
                </div>
                <div>
                  <p className="text-purple-200">Phone</p>
                  <p className="text-white font-medium">{borrowerData.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-purple-200">Address</p>
                  <p className="text-white font-medium">{borrowerData.address}</p>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-4">
              <h3 className="text-lg font-semibold text-white mb-4">Employment & Income</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-purple-200">Employer</p>
                  <p className="text-white font-medium">{borrowerData.employer}</p>
                </div>
                <div>
                  <p className="text-purple-200">Job Title</p>
                  <p className="text-white font-medium">{borrowerData.jobTitle}</p>
                </div>
                <div>
                  <p className="text-purple-200">Monthly Income</p>
                  <p className="text-white font-medium">NAD {borrowerData.monthlyIncome.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Banking Details */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Banking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-purple-200">Bank Name</p>
                  <p className="text-white font-medium">{borrowerData.bankName}</p>
                </div>
                <div>
                  <p className="text-purple-200">Account Type</p>
                  <p className="text-white font-medium">{borrowerData.accountType}</p>
                </div>
                <div>
                  <p className="text-purple-200">Account Number</p>
                  <p className="text-white font-medium">{borrowerData.accountNumber}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentScreen(1)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <button
                onClick={() => setCurrentScreen(3)}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
              >
                Confirm & Continue
                <CheckCircle size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Screen 3: Loan Details & Disclosure */}
        {currentScreen === 3 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Loan Terms & Disclosure</h2>
            <p className="text-purple-200 mb-6">Please review all financial details carefully</p>

            {/* Loan Breakdown */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Financial Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-purple-200">Principal Amount</span>
                  <span className="text-white font-bold text-lg">NAD {loanDetails.requestedAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-purple-200">Interest Rate (per annum)</span>
                  <span className="text-white font-bold text-lg">{loanDetails.interestRate}%</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-purple-200">Finance Charges</span>
                  <span className="text-yellow-400 font-bold text-lg">NAD {loanDetails.financeCharges.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-purple-200 font-semibold">Total Repayable Amount</span>
                  <span className="text-white font-bold text-xl">NAD {loanDetails.totalRepayable.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-200 font-semibold">Monthly Instalment</span>
                  <span className="text-green-400 font-bold text-xl">NAD {loanDetails.monthlyInstalment.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Repayment Schedule */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Repayment Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-purple-200">First Payment Date</p>
                  <p className="text-white font-medium">{loanDetails.firstPaymentDate}</p>
                </div>
                <div>
                  <p className="text-purple-200">Final Payment Date</p>
                  <p className="text-white font-medium">{loanDetails.finalPaymentDate}</p>
                </div>
                <div>
                  <p className="text-purple-200">Payment Frequency</p>
                  <p className="text-white font-medium">Monthly</p>
                </div>
                <div>
                  <p className="text-purple-200">Number of Payments</p>
                  <p className="text-white font-medium">{loanDetails.loanPeriod}</p>
                </div>
              </div>
              <button className="mt-4 text-purple-300 hover:text-purple-100 text-sm flex items-center gap-1">
                <Eye size={16} />
                View Full Repayment Schedule
              </button>
            </div>

            {/* Compliance Notices */}
            <div className="space-y-3 mb-6">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex gap-3">
                  <Shield className="text-yellow-300 flex-shrink-0" size={20} />
                  <div className="text-yellow-200 text-sm">
                    <p className="font-semibold mb-1">Interest Rate Disclosure</p>
                    <p>This loan has a fixed interest rate of {loanDetails.interestRate}% per annum, compliant with NAMFISA regulations.</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex gap-3">
                  <Clock className="text-blue-300 flex-shrink-0" size={20} />
                  <div className="text-blue-200 text-sm">
                    <p className="font-semibold mb-1">Cooling-Off Period</p>
                    <p>You have 5 business days from signing to cancel this agreement without penalty.</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="text-red-300 flex-shrink-0" size={20} />
                  <div className="text-red-200 text-sm">
                    <p className="font-semibold mb-1">Late Payment Penalties</p>
                    <p>Late payments may incur a penalty of 5% per missed instalment and affect your credit rating.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-purple-200 text-sm">
                  I understand the loan terms, including the total amount repayable, interest rate, and monthly instalments. I acknowledge all compliance notices above.
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentScreen(2)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <button
                onClick={() => setCurrentScreen(4)}
                disabled={!agreedToTerms}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Agreement
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Screen 4: Full Digital Agreement */}
        {currentScreen === 4 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Loan Agreement</h2>
            
            <div 
              ref={agreementRef}
              onScroll={handleAgreementScroll}
              className="bg-white/5 rounded-lg p-6 border border-white/10 mb-6 h-96 overflow-y-auto"
            >
              <div className="text-purple-100 text-sm space-y-4">
                <h3 className="text-white font-bold text-lg">LOAN AGREEMENT</h3>
                
                <p>This Loan Agreement ("Agreement") is entered into on {loanDetails.applicationDate} between:</p>
                
                <p><strong>LENDER:</strong> CasHuB Financial Services (Pty) Ltd<br/>
                Registration Number: 2023/12345<br/>
                NAMFISA License: NAMFISA-2023-001</p>
                
                <p><strong>BORROWER:</strong> {borrowerData.firstName} {borrowerData.lastName}<br/>
                ID Number: {borrowerData.idNumber}<br/>
                Address: {borrowerData.address}</p>
                
                <h4 className="text-white font-semibold mt-4">1. LOAN AMOUNT AND PURPOSE</h4>
                <p>1.1 The Lender agrees to loan the Borrower the principal amount of NAD {loanDetails.requestedAmount.toLocaleString()} (the "Loan Amount").</p>
                <p>1.2 The Borrower confirms that the loan will be used for: {loanDetails.loanPurpose}.</p>
                
                <h4 className="text-white font-semibold mt-4">2. INTEREST AND CHARGES</h4>
                <p>2.1 The Loan Amount shall bear interest at a fixed rate of {loanDetails.interestRate}% per annum.</p>
                <p>2.2 Total finance charges amount to NAD {loanDetails.financeCharges.toLocaleString()}.</p>
                <p>2.3 The total amount repayable is NAD {loanDetails.totalRepayable.toLocaleString()}.</p>
                
                <h4 className="text-white font-semibold mt-4">3. REPAYMENT TERMS</h4>
                <p>3.1 The Borrower agrees to repay the loan in {loanDetails.loanPeriod} monthly instalments of NAD {loanDetails.monthlyInstalment.toLocaleString()}.</p>
                <p>3.2 First payment due: {loanDetails.firstPaymentDate}</p>
                <p>3.3 Final payment due: {loanDetails.finalPaymentDate}</p>
                <p>3.4 Payments shall be made via direct debit from the Borrower's bank account: {borrowerData.bankName} - {borrowerData.accountNumber}</p>
                
                <h4 className="text-white font-semibold mt-4">4. DEFAULT AND PENALTIES</h4>
                <p>4.1 Late payments will incur a penalty of 5% of the instalment amount.</p>
                <p>4.2 Default occurs if payment is more than 30 days overdue.</p>
                <p>4.3 In case of default, the Lender may report to credit bureaus and initiate collection proceedings.</p>
                
                <h4 className="text-white font-semibold mt-4">5. COOLING-OFF PERIOD</h4>
                <p>5.1 The Borrower has 5 business days from signing to cancel this agreement without penalty.</p>
                <p>5.2 Cancellation must be submitted in writing to the Lender.</p>
                
                <h4 className="text-white font-semibold mt-4">6. EARLY REPAYMENT</h4>
                <p>6.1 The Borrower may repay the loan early without penalty.</p>
                <p>6.2 Interest will be recalculated pro-rata for early settlement.</p>
                
                <h4 className="text-white font-semibold mt-4">7. COMPLAINTS PROCEDURE</h4>
                <p>7.1 Complaints should be directed to: complaints@cashub.na</p>
                <p>7.2 If unresolved, complaints may be escalated to NAMFISA.</p>
                <p>7.3 Full complaints procedure is available in Annexure A.</p>
                
                <h4 className="text-white font-semibold mt-4">8. DATA PROTECTION</h4>
                <p>8.1 Personal information will be processed in accordance with Namibia's data protection laws.</p>
                <p>8.2 Information may be shared with credit bureaus and regulatory authorities.</p>
                
                <h4 className="text-white font-semibold mt-4">9. GOVERNING LAW</h4>
                <p>9.1 This Agreement is governed by the laws of Namibia.</p>
                <p>9.2 Disputes shall be resolved in the courts of Namibia.</p>
                
                <p className="mt-6"><strong>ANNEXURES:</strong></p>
                <p>
                  <a href="#" className="text-purple-300 hover:text-purple-100 underline">Annexure A: Complaints Procedure</a><br/>
                  <a href="#" className="text-purple-300 hover:text-purple-100 underline">Annexure B: Full Repayment Schedule</a>
                </p>
              </div>
            </div>

            {!scrolledToBottom && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <div className="flex gap-3">
                  <AlertCircle className="text-yellow-300 flex-shrink-0" size={20} />
                  <p className="text-yellow-200 text-sm">
                    Please scroll to the bottom of the agreement to continue
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={!scrolledToBottom}
                  className="mt-1"
                />
                <span className={`text-sm ${scrolledToBottom ? 'text-purple-200' : 'text-purple-300/50'}`}>
                  I have read and understood the full loan agreement and all its terms and conditions
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToCoolingOff}
                  onChange={(e) => setAgreedToCoolingOff(e.target.checked)}
                  disabled={!scrolledToBottom}
                  className="mt-1"
                />
                <span className={`text-sm ${scrolledToBottom ? 'text-purple-200' : 'text-purple-300/50'}`}>
                  I acknowledge my right to a 5-day cooling-off period to cancel this agreement
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentScreen(3)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <button
                onClick={() => setCurrentScreen(5)}
                disabled={!scrolledToBottom || !agreedToTerms || !agreedToCoolingOff}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Sign
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Screen 5: Digital Signature */}
        {currentScreen === 5 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Sign Agreement</h2>
            <p className="text-purple-200 mb-6">Choose your preferred signature method</p>

            {/*