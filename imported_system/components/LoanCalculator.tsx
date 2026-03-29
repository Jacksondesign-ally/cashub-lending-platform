import React, { useState } from 'react'
import { Calculator, DollarSign, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react'

interface LoanCalculation {
  principal: number
  interestRate: number
  period: number
  namfisaLevy: number
  stampDuty: number
  totalInterest: number
  totalRepayable: number
  monthlyPayment: number
}

export default function LoanCalculator() {
  const [amount, setAmount] = useState(5000)
  const [period, setPeriod] = useState(3)
  const [interestRate, setInterestRate] = useState(15)
  const [calculation, setCalculation] = useState<LoanCalculation | null>(null)

  const calculateLoan = () => {
    const principal = parseFloat(amount.toString())
    const rate = parseFloat(interestRate.toString()) / 100
    const months = parseInt(period.toString())
    
    // Calculate interest (simple interest for short-term loans)
    const totalInterest = principal * rate * (months / 12)
    
    // NAMFISA levy (1.03% of principal)
    const namfisaLevy = principal * 0.0103
    
    // Stamp duty (fixed N$ 5.00)
    const stampDuty = 5
    
    // Total repayable
    const totalRepayable = principal + totalInterest + namfisaLevy + stampDuty
    
    // Monthly payment
    const monthlyPayment = totalRepayable / months

    setCalculation({
      principal,
      interestRate: parseFloat(interestRate.toString()),
      period: months,
      namfisaLevy,
      stampDuty,
      totalInterest,
      totalRepayable,
      monthlyPayment
    })
  }

  React.useEffect(() => {
    calculateLoan()
  }, [amount, period, interestRate])

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">Quick Loan Calculator</h3>
        <p className="text-neutral-600">Calculate your loan in seconds</p>
      </div>

      <div className="space-y-6">
        {/* Loan Amount */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Loan Amount (N$)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500 text-lg font-medium"
              min="500"
              max="50000"
              step="100"
            />
          </div>
          <input
            type="range"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            className="w-full mt-2"
            min="500"
            max="50000"
            step="100"
          />
        </div>

        {/* Loan Period */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Loan Period (Months)
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
          >
            <option value={1}>1 Month</option>
            <option value={2}>2 Months</option>
            <option value={3}>3 Months</option>
            <option value={4}>4 Months</option>
            <option value={5}>5 Months</option>
            <option value={6}>6 Months</option>
          </select>
        </div>

        {/* Interest Rate */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Interest Rate (% per annum)
          </label>
          <select
            value={interestRate}
            onChange={(e) => setInterestRate(parseFloat(e.target.value))}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500"
          >
            <option value={10}>10% - Excellent Credit</option>
            <option value={15}>15% - Good Credit</option>
            <option value={20}>20% - Fair Credit</option>
            <option value={25}>25% - Poor Credit</option>
            <option value={30}>30% - Maximum Allowed</option>
          </select>
        </div>
      </div>

      {/* Calculation Results */}
      {calculation && (
        <div className="mt-8 p-6 bg-gradient-to-r from-cashub-50 to-accent-50 rounded-xl border border-cashub-200">
          <h4 className="text-lg font-semibold text-neutral-900 mb-4">Loan Breakdown</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Principal Amount:</span>
              <span className="font-medium text-neutral-900">N$ {calculation.principal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Interest ({calculation.interestRate}%):</span>
              <span className="font-medium text-neutral-900">N$ {calculation.totalInterest.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">NAMFISA Levy (1.03%):</span>
              <span className="font-medium text-neutral-900">N$ {calculation.namfisaLevy.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Stamp Duty:</span>
              <span className="font-medium text-neutral-900">N$ {calculation.stampDuty.toFixed(2)}</span>
            </div>
            
            <div className="border-t border-cashub-200 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-neutral-900">Total Repayable:</span>
                <span className="text-lg font-bold text-cashub-600">N$ {calculation.totalRepayable.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-neutral-600">Monthly Payment:</span>
                <span className="font-bold text-cashub-600">N$ {calculation.monthlyPayment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <div className="mt-8">
        <button className="w-full bg-gradient-to-r from-cashub-600 to-accent-500 text-white py-4 px-6 rounded-lg font-semibold hover:from-cashub-700 hover:to-accent-600 transition-all duration-200 flex items-center justify-center group">
          <span>Apply for This Loan</span>
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center text-sm text-neutral-600">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            <span>No obligation • Instant decision • NAMFISA compliant</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-neutral-50 rounded-lg">
          <Calculator className="w-8 h-8 text-cashub-600 mx-auto mb-2" />
          <h5 className="font-medium text-neutral-900">Instant Calculation</h5>
          <p className="text-sm text-neutral-600 mt-1">Real-time loan estimates</p>
        </div>
        <div className="text-center p-4 bg-neutral-50 rounded-lg">
          <TrendingUp className="w-8 h-8 text-cashub-600 mx-auto mb-2" />
          <h5 className="font-medium text-neutral-900">Competitive Rates</h5>
          <p className="text-sm text-neutral-600 mt-1">Best rates in Namibia</p>
        </div>
        <div className="text-center p-4 bg-neutral-50 rounded-lg">
          <CheckCircle className="w-8 h-8 text-cashub-600 mx-auto mb-2" />
          <h5 className="font-medium text-neutral-900">NAMFISA Compliant</h5>
          <p className="text-sm text-neutral-600 mt-1">Fully regulated lending</p>
        </div>
      </div>
    </div>
  )
}
