"use client"

import React from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

interface ChartProps {
  data: any[]
  title: string
}

export function DisbursementChart({ data, title }: ChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
      <h3 className="text-sm font-bold text-neutral-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value: number) => [`N$ ${value.toLocaleString()}`, 'Amount']} />
          <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CollectionTrendChart({ data, title }: ChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
      <h3 className="text-sm font-bold text-neutral-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value: number) => [`N$ ${value.toLocaleString()}`, '']} />
          <Legend />
          <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} name="Collected" dot={{ r: 3 }} />
          <Line type="monotone" dataKey="expected" stroke="#3b82f6" strokeWidth={2} name="Expected" dot={{ r: 3 }} strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RiskDistributionChart({ data, title }: ChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
      <h3 className="text-sm font-bold text-neutral-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function LoanStatusChart({ data, title }: ChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
      <h3 className="text-sm font-bold text-neutral-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis dataKey="status" type="category" tick={{ fontSize: 11 }} width={80} />
          <Tooltip />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
