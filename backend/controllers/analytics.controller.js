import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { Interview } from "../models/interview.model.js";

// ─── Student Analytics ────────────────────────────────────────────────────────
export const getStudentAnalytics = async (req, res) => {
  try {
    const userId = req.id;

    // All applications for this student
    const applications = await Application.find({ applicant: userId })
      .populate({ path: "job", populate: { path: "company" } })
      .sort({ createdAt: 1 });

    const total = applications.length;
    const accepted = applications.filter(a => ["selected", "hired"].includes(a.status)).length;
    const rejected = applications.filter(a => a.status === "rejected").length;
    const pending  = applications.filter(a => ["applied", "under_review", "shortlisted", "interview_scheduled"].includes(a.status)).length;
    const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

    // Monthly breakdown — last 6 months
    const monthlyMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      monthlyMap[key] = 0;
    }
    applications.forEach(app => {
      const d = new Date(app.createdAt);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      if (monthlyMap[key] !== undefined) monthlyMap[key]++;
    });
    const monthlyData = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }));

    // Status breakdown for pie chart
    const statusBreakdown = [
      { name: "Pending",  value: pending,  color: "#f59e0b" },
      { name: "Accepted", value: accepted, color: "#22c55e" },
      { name: "Rejected", value: rejected, color: "#ef4444" },
    ].filter(s => s.value > 0);

    return res.status(200).json({
      success: true,
      total,
      accepted,
      rejected,
      pending,
      acceptanceRate,
      monthlyData,
      statusBreakdown,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ─── Recruiter Analytics ─────────────────────────────────────────────────────
export const getRecruiterAnalytics = async (req, res) => {
  try {
    const recruiterId = req.id;

    // All jobs posted by this recruiter, with populated applications
    const jobs = await Job.find({ created_by: recruiterId })
      .populate({ path: "applications" })
      .sort({ createdAt: 1 });

    const totalJobs = jobs.length;
    let totalApplicants = 0;
    let accepted = 0;
    let rejected = 0;
    let pending  = 0;

    // Monthly applications received — last 6 months
    const monthlyMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      monthlyMap[key] = 0;
    }

    // Top jobs by applicant count (up to 5)
    const jobStats = [];

    jobs.forEach(job => {
      const apps = job.applications || [];
      totalApplicants += apps.length;
      jobStats.push({ name: job.title.length > 20 ? job.title.slice(0, 20) + "…" : job.title, applicants: apps.length });

      apps.forEach(app => {
        if (["selected", "hired"].includes(app.status)) accepted++;
        else if (app.status === "rejected") rejected++;
        else if (["applied", "under_review", "shortlisted", "interview_scheduled", "pending"].includes(app.status)) pending++;

        // Monthly grouping
        const d = new Date(app.createdAt);
        const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
        if (monthlyMap[key] !== undefined) monthlyMap[key]++;
      });
    });

    const acceptanceRate = totalApplicants > 0 ? Math.round((accepted / totalApplicants) * 100) : 0;

    // Sort top jobs descending
    const topJobs = jobStats.sort((a, b) => b.applicants - a.applicants).slice(0, 5);

    const monthlyData = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }));

    const statusBreakdown = [
      { name: "Pending",  value: pending,  color: "#f59e0b" },
      { name: "Accepted", value: accepted, color: "#22c55e" },
      { name: "Rejected", value: rejected, color: "#ef4444" },
    ].filter(s => s.value > 0);

    const interviews = await Interview.find({ recruiterId });
    const interviewsScheduled = interviews.length;
    const completedInterviews = interviews.filter(i => i.status === 'Completed').length;
    const noShows = interviews.filter(i => i.status === 'No Show').length;
    
    // Funnel Chart Data
    // Applied -> Interviewed -> Hired
    const funnelChart = [
      { name: "Applied", value: totalApplicants },
      { name: "Interviewed", value: interviewsScheduled },
      { name: "Hired", value: accepted }
    ];

    return res.status(200).json({
      success: true,
      totalJobs,
      totalApplicants,
      accepted,
      rejected,
      pending,
      acceptanceRate,
      topJobs,
      monthlyData,
      statusBreakdown,
      interviewStats: {
        scheduled: interviewsScheduled,
        completed: completedInterviews,
        noShows: noShows
      },
      funnelChart
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAiInsights = async (req, res, next) => {
  try {
    const userId = req.id;

    const jobs = await Job.find({ created_by: userId }).populate("applications");
    const jobIds = jobs.map(j => j._id);

    const applications = await Application.find({ job: { $in: jobIds } }).populate("applicant job");

    if (applications.length === 0) {
      return res.status(200).json({
        success: true,
        topCandidate: null,
        avgMatchScore: 0,
        appsThisWeek: 0,
        hiringFunnel: { applied: 0, interview: 0, selected: 0 },
        hardestSkill: "N/A"
      });
    }

    // Top Candidate
    let topCandidate = applications[0];
    for (const app of applications) {
      if ((app.rankScore || 0) > (topCandidate.rankScore || 0)) {
        topCandidate = app;
      }
    }

    // Average Match Score
    const totalMatch = applications.reduce((acc, app) => acc + (app.matchScore || 0), 0);
    const avgMatchScore = Math.round(totalMatch / applications.length);

    // Apps this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const appsThisWeek = applications.filter(app => new Date(app.createdAt) > oneWeekAgo).length;

    // Hiring Funnel
    let interview = 0, selected = 0;
    applications.forEach(app => {
      const status = app.status;
      if (['interview_scheduled', 'selected', 'hired'].includes(status)) interview++;
      if (['selected', 'hired'].includes(status)) selected++;
    });

    const hiringFunnel = {
      applied: applications.length,
      interview,
      selected
    };

    // Hardest Skill (simplified)
    let hardestSkill = "System Design";
    const reqCounts = {};
    jobs.forEach(job => {
      (job.requirements || []).forEach(req => {
        reqCounts[req] = (reqCounts[req] || 0) + 1;
      });
    });
    const candidateSkillCounts = {};
    applications.forEach(app => {
      const skills = app.applicant?.profile?.parsedResumeData?.extractedSkills || app.applicant?.profile?.skills || [];
      skills.forEach(skill => {
        candidateSkillCounts[skill.toLowerCase()] = (candidateSkillCounts[skill.toLowerCase()] || 0) + 1;
      });
    });
    
    let lowestRatio = Infinity;
    for (const req of Object.keys(reqCounts)) {
      const have = candidateSkillCounts[req.toLowerCase()] || 0;
      const need = reqCounts[req];
      const ratio = have / need;
      if (ratio < lowestRatio) {
        lowestRatio = ratio;
        hardestSkill = req;
      }
    }

    return res.status(200).json({
      success: true,
      topCandidate: topCandidate.applicant?.fullname || "N/A",
      topCandidateRole: topCandidate.job?.title || "",
      topCandidateScore: topCandidate.rankScore || 0,
      avgMatchScore,
      appsThisWeek,
      hiringFunnel,
      hardestSkill
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
