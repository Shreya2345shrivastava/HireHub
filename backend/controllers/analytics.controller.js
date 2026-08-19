import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";

// ─── Student Analytics ────────────────────────────────────────────────────────
export const getStudentAnalytics = async (req, res) => {
  try {
    const userId = req.id;

    // All applications for this student
    const applications = await Application.find({ applicant: userId })
      .populate({ path: "job", populate: { path: "company" } })
      .sort({ createdAt: 1 });

    const total = applications.length;
    const accepted = applications.filter(a => a.status === "accepted").length;
    const rejected = applications.filter(a => a.status === "rejected").length;
    const pending  = applications.filter(a => a.status === "pending").length;
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
        if (app.status === "accepted") accepted++;
        else if (app.status === "rejected") rejected++;
        else pending++;

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
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
