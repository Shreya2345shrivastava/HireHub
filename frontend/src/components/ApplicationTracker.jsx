import React, { useState, useMemo } from 'react'
import Navbar from './shared/Navbar'
import { useSelector } from 'react-redux'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Search, Briefcase, Clock, CheckCircle2, XCircle, ChevronRight, Building2, Calendar } from 'lucide-react'

// ─── Step config ────────────────────────────────────────────────────────────
const getSteps = (app) => {
  const status = app?.status || 'applied';
  const timeline = app?.timeline || [];
  const getTimelineDate = (st) => {
    const entry = timeline.find(t => t.status === st);
    return entry?.date ? new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
  };

  const isRejected = status === 'rejected';
  
  const stageIndex = {
    'applied': 0, 'pending': 0,
    'under_review': 1,
    'shortlisted': 2,
    'interview_scheduled': 3,
    'selected': 4, 'accepted': 4, 'hired': 4,
    'rejected': 4
  }[status] ?? 0;

  return [
    {
      label: 'Application Submitted',
      desc: getTimelineDate('applied') || getTimelineDate('pending') || (app?.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'),
      done: stageIndex >= 0,
      active: stageIndex === 0,
    },
    {
      label: 'Under Recruiter Review',
      desc: getTimelineDate('under_review') || 'Your application is being evaluated',
      done: stageIndex >= 1,
      active: stageIndex === 1,
    },
    {
      label: 'Shortlisted',
      desc: getTimelineDate('shortlisted') || (stageIndex >= 2 ? 'You have been shortlisted' : 'Awaiting review'),
      done: stageIndex >= 2 && !isRejected,
      active: stageIndex === 2,
    },
    {
      label: 'Interview Scheduled',
      desc: app?.interviewDate ? `${app.interviewDate} at ${app.interviewTime}` : (getTimelineDate('interview_scheduled') || 'Awaiting interview scheduling'),
      done: stageIndex >= 3 && !isRejected,
      active: stageIndex === 3,
    },
    {
      label: 'Decision Reached',
      desc: isRejected 
        ? 'Application was not selected' 
        : stageIndex >= 4 
          ? '🎉 Congratulations! Offer received' 
          : 'Awaiting final decision',
      done: stageIndex >= 4,
      active: stageIndex === 4,
      status,
    },
  ];
};

// ─── Status badge colors ─────────────────────────────────────────────────────
const statusStyle = {
  applied:  { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400',  label: 'Applied'  },
  pending:  { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400',  label: 'Applied'  },
  under_review: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-400',  label: 'Under Review' },
  shortlisted: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500',  label: 'Shortlisted' },
  interview_scheduled: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500',  label: 'Interview' },
  selected: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500',  label: 'Selected' },
  accepted: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500',  label: 'Selected' },
  hired: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500',  label: 'Hired' },
  rejected: { bg: 'bg-red-100',   text: 'text-red-700',   dot: 'bg-red-500',    label: 'Rejected' },
}

// ─── Single Step visual ──────────────────────────────────────────────────────
const Step = ({ step, index, isLast, status }) => {
  const isDecision = index === 2
  const circleClass = step.done
    ? isDecision && status === 'rejected'
      ? 'bg-red-500 border-red-500'
      : 'bg-[#6A38C2] border-[#6A38C2]'
    : step.active
    ? 'border-[#6A38C2] bg-white'
    : 'border-gray-300 bg-white'

  const lineClass = step.done ? 'bg-[#6A38C2]' : 'bg-gray-200'

  return (
    <div className="flex gap-3 relative">
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-[13px] top-7 w-0.5 h-[calc(100%-4px)]" style={{ backgroundColor: step.done ? '#6A38C2' : '#e5e7eb' }} />
      )}

      {/* Circle */}
      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 transition-all duration-300 ${circleClass}`}>
        {step.done ? (
          isDecision && status === 'rejected' ? (
            <XCircle className="w-4 h-4 text-white" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-white" />
          )
        ) : step.active ? (
          <div className="w-2.5 h-2.5 rounded-full bg-[#6A38C2] animate-pulse" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-gray-300" />
        )}
      </div>

      {/* Text */}
      <div className="pb-6">
        <p className={`text-sm font-semibold ${step.done || step.active ? 'text-gray-900' : 'text-gray-400'}`}>
          {step.label}
        </p>
        <p className={`text-xs mt-0.5 ${step.done || step.active ? 'text-gray-500' : 'text-gray-300'}`}>
          {step.desc}
        </p>
      </div>
    </div>
  )
}

// ─── Application Card ────────────────────────────────────────────────────────
const ApplicationCard = ({ app }) => {
  const [expanded, setExpanded] = useState(false)
  const status = app?.status || 'applied'
  const style = statusStyle[status] || statusStyle.applied
  const steps = getSteps(app)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      {/* Card Header */}
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Company logo placeholder */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-[#6A38C2]" />
          </div>

          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight">
              {app?.job?.title || 'N/A'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {app?.job?.company?.name || 'Unknown Company'}
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>Applied {app?.createdAt ? app.createdAt.split('T')[0] : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {style.label}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-[#6A38C2] hover:underline"
          >
            {expanded ? 'Hide' : 'Track Progress'}
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expandable Stepper */}
      {expanded && (
        <div className="border-t border-gray-100 px-6 pt-5 pb-3 bg-gray-50/50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Application Timeline</p>
          <div>
            {steps.map((step, idx) => (
              <Step key={idx} step={step} index={idx} isLast={idx === steps.length - 1} status={status} />
            ))}
          </div>
          {app?.meetingLink && status === 'interview_scheduled' && (
            <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100 text-sm">
                <p className="font-semibold text-purple-900 mb-1">Interview Details</p>
                <div className="flex flex-col gap-1 text-purple-800">
                    <span><strong>Date:</strong> {app.interviewDate} at {app.interviewTime}</span>
                    <span><strong>Link:</strong> <a href={app.meetingLink} target="_blank" rel="noreferrer" className="underline">{app.meetingLink}</a></span>
                    {app.notes && <span><strong>Notes:</strong> {app.notes}</span>}
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Summary Card ────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className={`rounded-2xl p-5 ${bg} flex items-center gap-4`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-white/70`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
)

// ─── Filter Button ───────────────────────────────────────────────────────────
const FilterBtn = ({ label, active, onClick, count }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 flex items-center gap-2 ${
      active
        ? 'bg-[#6A38C2] text-white border-[#6A38C2] shadow-sm'
        : 'bg-white text-gray-600 border-gray-200 hover:border-[#6A38C2] hover:text-[#6A38C2]'
    }`}
  >
    {label}
    {count !== undefined && (
      <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
        {count}
      </span>
    )}
  </button>
)

// ─── Main Page ───────────────────────────────────────────────────────────────
const ApplicationTracker = () => {
  useGetAppliedJobs()
  const { allAppliedJobs } = useSelector(store => store.job)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const jobs = Array.isArray(allAppliedJobs) ? allAppliedJobs : []

  // Analytics
  const stats = useMemo(() => ({
    total:    jobs.length,
    inProgress:  jobs.filter(j => ['applied', 'pending', 'under_review', 'shortlisted', 'interview_scheduled'].includes(j?.status)).length,
    accepted: jobs.filter(j => ['selected', 'accepted', 'hired'].includes(j?.status)).length,
    rejected: jobs.filter(j => j?.status === 'rejected').length,
  }), [jobs])

  // Filter + search
  const filtered = useMemo(() => {
    return jobs.filter(j => {
      let matchFilter = false;
      if (filter === 'all') matchFilter = true;
      else if (filter === 'inProgress') matchFilter = ['applied', 'pending', 'under_review', 'shortlisted', 'interview_scheduled'].includes(j?.status);
      else if (filter === 'accepted') matchFilter = ['selected', 'accepted', 'hired'].includes(j?.status);
      else if (filter === 'rejected') matchFilter = j?.status === 'rejected';

      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        j?.job?.title?.toLowerCase().includes(q) ||
        j?.job?.company?.name?.toLowerCase().includes(q)
      return matchFilter && matchSearch
    })
  }, [jobs, filter, search])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Application <span className="text-[#6A38C2]">Tracker</span>
          </h1>
          <p className="text-gray-500 mt-1">Monitor the real-time status of every job you've applied to.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Briefcase}    label="Total Applied"  value={stats.total}    color="text-[#6A38C2]" bg="bg-purple-50" />
          <StatCard icon={Clock}        label="In Progress"    value={stats.inProgress}  color="text-amber-600" bg="bg-amber-50" />
          <StatCard icon={CheckCircle2} label="Selected"       value={stats.accepted} color="text-green-600" bg="bg-green-50" />
          <StatCard icon={XCircle}      label="Rejected"       value={stats.rejected} color="text-red-500"   bg="bg-red-50" />
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <FilterBtn label="All"      active={filter === 'all'}      onClick={() => setFilter('all')}      count={stats.total}    />
            <FilterBtn label="In Progress"  active={filter === 'inProgress'}  onClick={() => setFilter('inProgress')}  count={stats.inProgress}  />
            <FilterBtn label="Selected" active={filter === 'accepted'} onClick={() => setFilter('accepted')} count={stats.accepted} />
            <FilterBtn label="Rejected" active={filter === 'rejected'} onClick={() => setFilter('rejected')} count={stats.rejected} />
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search role or company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 rounded-full border-gray-200 focus:border-[#6A38C2] focus:ring-1 focus:ring-[#6A38C2]"
            />
          </div>
        </div>

        {/* Applications List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-9 h-9 text-[#6A38C2] opacity-50" />
            </div>
            <h3 className="text-gray-700 font-semibold text-lg">No applications found</h3>
            <p className="text-gray-400 text-sm mt-1">
              {search ? 'Try a different search query.' : 'Apply to jobs and they will appear here.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(app => (
              <ApplicationCard key={app._id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicationTracker
