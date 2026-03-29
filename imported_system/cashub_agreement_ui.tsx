 connect import React, { useState, useRef, useEffect } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, Download, Camera, Mail, Phone, User, Building, MapPin, Briefcase, CreditCard } from 'lucide-react';

const DigitalAgreementUI = () => {
  const [step, setStep] = useState(1); // 1: Review, 2: Acknowledge, 3: Sign, 4: Complete
  const [agreement, setAgreement] = useState({
    agreementNumber: 'AGR-2025-000123',
    status: 'pending_signature',
    principalAmount: 10000.00,
    interestRate: 15.0,
    loanPeriodMonths: 5,
    financeCharges: 750.00,
    totalRepayableAmount: 10750.00,
    installmentAmount: 2150.00,
    numberOfInstallments: 5,
    firstInstallmentDate: '2025-02-15',
    lastInstallmentDate: '2025-06-15',
    penaltyInterestRate: 5.0,
    
    // Borrower details
    borrowerFullNames: 'John David Doe',
    borrowerIdNumber: '85010112345',
    borrowerPhone: '+264811234567',
    borrowerEmail: 'john@example.com',
    borrowerResidentialAddress: '123 Main Street, Windhoek',
    borrowerEmployerName: 'ABC Company',
    borrowerMonthlyIncome: 15000.00,
    
    // Banking
    bankName: 'Bank Windhoek',
    bankBranch: 'Windhoek Main',
    accountNumber: '62345678901',
    
    // References
    references: [
      { fullName: 'Maria Santos', phoneNumber: '+264812345678', relationship: 'Sister' },
      { fullName: 'Peter Smith', phoneNumber: '+264813456789', relationship: 'Colleague' }
    ],
    
    // Lender
    lenderLegalName: 'Insta Funding Financial Services CC',
    lenderContactNumber: '+264611234567',
    lenderEmail: 'loans@instafunding.na'
  });

  const [acknowledgements, setAcknowledgements] = useState({
    agreementCompleted: false,
    coolingOffPeriod: false,
    earlySettlement: false,
    creditBureauConsent: false,
    complaintProcedures: false
  });

  const [signatureMethod, setSignatureMethod] = useState('touch');
  const [signature, setSignature] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    if (signatureMethod === 'touch' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctxRef.current = ctx;
    }
  }, [signatureMethod]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX || e.touches[0].clientX - rect.left;
    const y = e.clientY || e.touches[0].clientY - rect.top;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x - rect.left, y - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    // Save signature as base64
    const signatureData = canvasRef.current.toDataURL();
    setSignature(signatureData);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  const sendOTP = () => {
    // API call to send OTP
    setShowOTPInput(true);
    alert(`OTP sent to ${agreement.borrowerPhone}`);
  };

  const allAcknowledged = Object.values(acknowledgements).every(v => v === true);

  const handleAcknowledge = () => {
    if (!allAcknowledged) {
      alert('Please check all acknowledgements to proceed');
      return;
    }
    setStep(3);
  };

  const handleSign = () => {
    if (signatureMethod === 'touch' && !signature) {
      alert('Please provide your signature');
      return;
    }
    if (signatureMethod === 'otp' && otpCode.length !== 6) {
      alert('Please enter valid 6-digit OTP');
      return;
    }
    // API call to sign agreement
    setStep(4);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NA', {
      style: 'currency',
      currency: 'NAD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Review Agreement', icon: FileText },
              { num: 2, label: 'Acknowledge Terms', icon: CheckCircle },
              { num: 3, label: 'Sign Agreement', icon: User },
              { num: 4, label: 'Complete', icon: CheckCircle }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > s.num ? <CheckCircle size={20} /> : <s.icon size={20} />}
                  </div>
                  <span className={`text-xs font-medium ${step >= s.num ? 'text-blue-600' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Review Agreement */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Loan Agreement</h1>
                  <p className="text-gray-600">Agreement #{agreement.agreementNumber}</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Pending Signature
                  </span>
                </div>
              </div>
            </div>

            {/* Loan Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Loan Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Principal Amount</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(agreement.principalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Interest Rate</p>
                  <p className="text-xl font-bold text-gray-900">{agreement.interestRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Finance Charges (Max 30%)</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(agreement.financeCharges)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Repayable</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(agreement.totalRepayableAmount)}</p>
                </div>
              </div>
            </div>

            {/* Repayment Schedule */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Repayment Schedule</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Monthly Installment</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(agreement.installmentAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">First Payment</p>
                  <p className="text-lg font-medium text-gray-900">{agreement.firstInstallmentDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Final Payment</p>
                  <p className="text-lg font-medium text-gray-900">{agreement.lastInstallmentDate}</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Loan Period:</strong> {agreement.loanPeriodMonths} months (Maximum allowed: 5 months)
                </p>
              </div>
            </div>

            {/* Borrower Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Your Details</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Full Names</p>
                    <p className="font-medium">{agreement.borrowerFullNames}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">ID Number</p>
                    <p className="font-medium">{agreement.borrowerIdNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{agreement.borrowerPhone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Employer</p>
                    <p className="font-medium">{agreement.borrowerEmployerName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Banking Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Banking Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Bank</p>
                  <p className="font-medium">{agreement.bankName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Branch</p>
                  <p className="font-medium">{agreement.bankBranch}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Account Number</p>
                  <p className="font-medium">{agreement.accountNumber}</p>
                </div>
              </div>
            </div>

            {/* References */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">References</h2>
              {agreement.references.map((ref, idx) => (
                <div key={idx} className="mb-3 pb-3 border-b border-gray-200 last:border-0">
                  <p className="font-medium">{ref.fullName}</p>
                  <p className="text-sm text-gray-600">{ref.phoneNumber} • {ref.relationship}</p>
                </div>
              ))}
            </div>

            {/* Important Terms */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-3 text-blue-900">Important Terms</h2>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Penalty interest rate: {agreement.penaltyInterestRate}% per month (max)</li>
                <li>• Maximum penalty period: 3 months</li>
                <li>• Early settlement allowed without penalty</li>
                <li>• 3-day cooling-off period after signing</li>
                <li>• Governed by laws of the Republic of Namibia</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Proceed to Acknowledgements
              </button>
              <button className="px-6 py-3 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center gap-2">
                <Download size={20} />
                Download PDF
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Acknowledge Terms */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-2">Acknowledge Terms & Conditions</h2>
              <p className="text-gray-600 mb-6">Please carefully read and acknowledge the following:</p>

              <div className="space-y-4">
                {[
                  { key: 'agreementCompleted', label: 'I confirm that this agreement has been completed in full before signing' },
                  { key: 'coolingOffPeriod', label: 'I understand that I have a 3-business-day cooling-off period after signing' },
                  { key: 'earlySettlement', label: 'I understand that I may settle this loan early without penalty' },
                  { key: 'creditBureauConsent', label: 'I consent to my information being reported to credit bureaus' },
                  { key: 'complaintProcedures', label: 'I have read and understood the complaints procedures (Annexure A)' }
                ].map((item) => (
                  <label key={item.key} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={acknowledgements[item.key]}
                      onChange={(e) => setAcknowledgements({ ...acknowledgements, [item.key]: e.target.checked })}
                      className="mt-1 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>

              {!allAcknowledged && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-yellow-800">
                    All acknowledgements must be checked before you can proceed to sign the agreement.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleAcknowledge}
                disabled={!allAcknowledged}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Signature
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Sign Agreement */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-2">Sign Agreement</h2>
              <p className="text-gray-600 mb-6">Choose your preferred signing method:</p>

              {/* Signature Method Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setSignatureMethod('touch')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    signatureMethod === 'touch' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className="mx-auto mb-2" size={32} />
                  <p className="font-medium">Touch Signature</p>
                  <p className="text-xs text-gray-600">Draw your signature</p>
                </button>
                
                <button
                  onClick={() => setSignatureMethod('otp')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    signatureMethod === 'otp' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Phone className="mx-auto mb-2" size={32} />
                  <p className="font-medium">OTP Verification</p>
                  <p className="text-xs text-gray-600">Sign with SMS code</p>
                </button>
              </div>

              {/* Touch Signature Canvas */}
              {signatureMethod === 'touch' && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Sign in the box below:</p>
                  <div className="border-2 border-gray-300 rounded-lg p-2 bg-white">
                    <canvas
                      ref={canvasRef}
                      width={700}
                      height={200}
                      className="w-full border border-dashed border-gray-300 rounded cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                  <button
                    onClick={clearSignature}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear Signature
                  </button>
                </div>
              )}

              {/* OTP Input */}
              {signatureMethod === 'otp' && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    We'll send a 6-digit code to {agreement.borrowerPhone}
                  </p>
                  {!showOTPInput ? (
                    <button
                      onClick={sendOTP}
                      className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                      Send OTP Code
                    </button>
                  ) : (
                    <div>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 6-digit code"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest"
                      />
                      <button
                        onClick={sendOTP}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        Resend Code
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Legal Notice */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  By signing this agreement, you confirm that you have read, understood, and agree to all terms and conditions. 
                  Your signature will be encrypted and stored securely. This agreement is legally binding and governed by the laws 
                  of the Republic of Namibia.
                </p>
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
                onClick={handleSign}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Sign Agreement
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Agreement Signed Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your loan agreement has been signed and submitted for final approval.
            </p>

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 justify-center mb-3">
                <Clock className="text-blue-600" size={24} />
                <p className="font-semibold text-blue-900">3-Day Cooling-Off Period Active</p>
              </div>
              <p className="text-sm text-blue-800">
                You have until <strong>January 24, 2026 5:00 PM</strong> to cancel this agreement without penalty.
              </p>
            </div>

            <div className="space-y-3">
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <Download size={20} />
                Download Signed Agreement
              </button>
              <button className="w-full py-3 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                View Repayment Schedule
              </button>
              <button className="w-full py-3 border border-red-300 hover:bg-red-50 text-red-600 rounded-lg font-medium transition-colors">
                Exercise Cooling-Off Period
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalAgreementUI;