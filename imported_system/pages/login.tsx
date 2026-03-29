import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Mock authentication - replace with actual Supabase auth
      if (email && password) {
        // Simulate successful login
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        setError('Please enter your email and password')
      }
    } catch (error) {
      setError('Invalid login credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login - CasHuB</title>
        <meta name="description" content="Login to CasHuB Digital Microlending Platform" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-cashub-600 via-cashub-700 to-cashub-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        <div className="relative max-w-md w-full space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold bg-gradient-to-r from-cashub-600 to-accent-500 bg-clip-text text-transparent">
                C
              </span>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Welcome to CasHuB
            </h2>
            <p className="mt-2 text-center text-sm text-cashub-100">
              Sign in to your microlending platform
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-neutral-300 rounded-lg placeholder-neutral-400 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500 transition-colors"
                    placeholder="admin@cashub.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-neutral-300 rounded-lg placeholder-neutral-400 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-cashub-500 focus:border-cashub-500 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-cashub-600 focus:ring-cashub-500 border-neutral-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-cashub-600 hover:text-cashub-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cashub-600 to-cashub-700 hover:from-cashub-700 hover:to-cashub-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cashub-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-cashub-50 rounded-lg">
              <p className="text-sm text-cashub-700 font-medium mb-2">Demo Credentials:</p>
              <p className="text-xs text-cashub-600">Email: admin@cashub.com</p>
              <p className="text-xs text-cashub-600">Password: admin123</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-cashub-100">
              Don't have an account?{' '}
              <a href="#" className="font-medium text-white hover:text-cashub-100">
                Contact your administrator
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
