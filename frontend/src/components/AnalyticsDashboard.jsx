import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Navbar from './shared/Navbar'
import axiosInstance from '@/api/axiosInstance'
import { ANALYTICS_API_END_POINT } from '@/utils/constant'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts'
import {
  Briefcase, Users, CheckCircle2, XCircle, Clock,
  TrendingUp, BarChart2, Award, Calendar, AlertTriangle
} from 'lucide-react'

// ─── Colour tokens ────────────────────────────────────────────────────────────
const PURPLE   = '#6A38C2'
const GREEN    = '#22c55e'
const RED      = '#ef4444'
const AMBER    = '#f59e0b'
const INDIGO   = '#6366f1'

// ─── Reusable Stat Card ───────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, bg }) => (
  <div className={`rounded-2xl p-5 ${bg} flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-300`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/70 flex-shrink-0`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value ?? '—'}</p>
      <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
)

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <h3 className="font-bold text-gray-800 mb-5 text-base">{title}</h3>
    {children}
  </div>
)

// ─── Custom tooltip for charts ────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-lg text-sm">
        <p className="font-semibold text-gray-700">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || PURPLE }}>{p.name}: <b>{p.value}</b></p>
        ))}
      </div>
    )
  }
  return null
}

// ─── Student Dashboard ────────────────────────────────────────────────────────
const StudentDashboard = ({ data }) => {
  const { total, accepted, rejected, pending, acceptanceRate, monthlyData, statusBreakdown } = data

  return (
    <>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Briefcase}    label="Total Applied"    value={total}           sub="all time"              color="text-[#6A38C2]" bg="bg-purple-50"  />
        <StatCard icon={Clock}        label="Pending Review"   value={pending}         sub="awaiting decision"     color="text-amber-500"  bg="bg-amber-50"   />
        <StatCard icon={CheckCircle2} label="Accepted"         value={accepted}        sub="offers received"       color="text-green-600"  bg="bg-green-50"   />
        <StatCard icon={TrendingUp}   label="Acceptance Rate"  value={`${acceptanceRate}%`} sub="of applications"  color="text-indigo-500" bg="bg-indigo-50"  />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie chart */}
        <Section title="📊 Application Status Breakdown">
          {statusBreakdown.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No application data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {statusBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Section>

        {/* Bar chart — monthly applications */}
        <Section title="📅 Applications Per Month (Last 6 Months)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Applications" fill={PURPLE} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* Extra stat */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={XCircle} label="Rejected"      value={rejected} sub="not selected"    color="text-red-500"    bg="bg-red-50"    />
        <StatCard icon={Award}   label="Success Rate"  value={`${acceptanceRate}%`} sub="accepted / applied" color="text-purple-500" bg="bg-purple-50" />
        <StatCard icon={BarChart2} label="Active Month" value={monthlyData[monthlyData.length - 1]?.count ?? 0} sub="applications this month" color="text-indigo-500" bg="bg-indigo-50" />
      </div>
    </>
  )
}

// ─── Recruiter Dashboard ──────────────────────────────────────────────────────
const RecruiterDashboard = ({ data }) => {
  const { totalJobs, totalApplicants, accepted, rejected, pending, acceptanceRate, topJobs, monthlyData, statusBreakdown } = data

  return (
    <>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Briefcase}    label="Jobs Posted"       value={totalJobs}        sub="total"               color="text-[#6A38C2]"  bg="bg-purple-50"  />
        <StatCard icon={Users}        label="Total Applicants"  value={totalApplicants}  sub="across all jobs"     color="text-indigo-500"  bg="bg-indigo-50"  />
        <StatCard icon={Calendar}     label="Interviews"        value={data.interviewStats?.scheduled || 0} sub="scheduled"         color="text-blue-500"    bg="bg-blue-50"    />
        <StatCard icon={CheckCircle2} label="Accepted"          value={accepted}         sub="hired"               color="text-green-600"   bg="bg-green-50"   />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie chart — status breakdown */}
        <Section title="📊 Applicant Status Breakdown">
          {statusBreakdown.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No applicant data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {statusBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Section>

        {/* Line chart — monthly applications received */}
        <Section title="📅 Applications Received Per Month (Last 6 Months)">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" name="Applicants" stroke={PURPLE} strokeWidth={3} dot={{ r: 5, fill: PURPLE }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </Section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Top Jobs Bar chart */}
        <Section title="🏆 Top Jobs by Applicants">
          {topJobs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No jobs posted yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topJobs} layout="vertical" barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="applicants" name="Applicants" fill={INDIGO} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>

        {/* Funnel Chart */}
        <Section title="🎯 Hiring Funnel Conversion">
          {data.funnelChart ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.funnelChart} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Count" fill={AMBER} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">No funnel data available.</p>
          )}
        </Section>
      </div>

      {/* Extra stat row */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp}   label="Acceptance Rate"   value={`${acceptanceRate}%`} sub="of applicants"  color="text-amber-500"   bg="bg-amber-50"   />
        <StatCard icon={XCircle}      label="Rejected"          value={rejected}  sub="not selected"       color="text-red-500"    bg="bg-red-50"    />
        <StatCard icon={Clock}        label="Pending"           value={pending}   sub="awaiting action"    color="text-amber-500"  bg="bg-amber-50"  />
        <StatCard icon={AlertTriangle}label="No Shows"          value={data.interviewStats?.noShows || 0} sub="missed interviews" color="text-red-500" bg="bg-red-50" />
      </div>
    </>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-2xl bg-gray-100 animate-pulse h-24" />
)

// ─── Main Page ────────────────────────────────────────────────────────────────
const AnalyticsDashboard = () => {
  const { user } = useSelector(store => store.auth)
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }

    const endpoint = user.role === 'recruiter'
      ? `${ANALYTICS_API_END_POINT}/recruiter`
      : `${ANALYTICS_API_END_POINT}/student`

    axiosInstance.get(endpoint)
      .then(res => { if (res.data.success) setData(res.data) })
      .catch(() => setError('Failed to load analytics. Please try again.'))
      .finally(() => setLoading(false))
  }, [user])

  const isRecruiter = user?.role === 'recruiter'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-10">

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-[#6A38C2]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isRecruiter ? 'Hiring' : 'Job Hunt'}{' '}
                <span className="text-[#6A38C2]">Analytics</span>
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {isRecruiter
                  ? 'Track your job postings and applicant pipeline.'
                  : 'Monitor your job search progress and outcomes.'}
              </p>
            </div>
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && data && (
          isRecruiter
            ? <RecruiterDashboard data={data} />
            : <StudentDashboard   data={data} />
        )}
      </div>
    </div>
  )
}

export default AnalyticsDashboard
