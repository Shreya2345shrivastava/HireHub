import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/api/axiosInstance';
import { JOB_API_END_POINT, USER_API_END_POINT } from '@/utils/constant';

const Footer = () => {
  const { user } = useSelector(store => store.auth);

  const [totalJobPosted, setTotalJobPosted] = useState(null);
  const [totalActiveUsers, setTotalActiveUsers] = useState(null);
  const [totalStudentLogins, setTotalStudentLogins] = useState(null);
  const [totalRecruiterLogins, setTotalRecruiterLogins] = useState(null);

  useEffect(() => {
    if (!user) return; // Only fetch when logged in

    const fetchAnalytics = async () => {
      try {
        const [jobRes, userRes] = await Promise.all([
          axiosInstance.get(`${JOB_API_END_POINT}/getTotalJobPostedLast30Days`),
          axiosInstance.get(`${USER_API_END_POINT}/analytics`),
        ]);

        if (jobRes.data) setTotalJobPosted(jobRes.data.totalJobPosted);
        if (userRes.data.success) {
          setTotalActiveUsers(userRes.data.totalActiveUsers);
          setTotalStudentLogins(userRes.data.totalStudentLogins);
          setTotalRecruiterLogins(userRes.data.totalRecruiterLogins);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    fetchAnalytics();
  }, [user]); // re-fetch whenever user changes (login/logout)

  return (
    <footer className="border-t border-border py-8 mt-auto">
      <div className="container mx-auto px-4">

        {user && (
          <div className="mb-12 mt-4 text-sm">
            {/* Analytics Card Container */}
            <div className="bg-card/50 backdrop-blur-xl p-8 rounded-2xl shadow-glass border border-border">
              <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
                Monthly User Analytics
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Active Users Card */}
                <div className="flex flex-col items-center bg-secondary/30 border border-border p-6 rounded-xl shadow-sm hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
                  <div className="text-4xl font-bold text-primary mb-2">
                    <i className="fas fa-users"></i> {totalActiveUsers !== null ? totalActiveUsers : "..."}
                  </div>
                  <p className="text-lg font-medium text-card-foreground">Active Users</p>
                  <p className="text-xs mt-1 text-muted-foreground text-center">Users active in the last month</p>
                </div>

                {/* Monthly Student Logins Card */}
                <div className="flex flex-col items-center bg-secondary/30 border border-border p-6 rounded-xl shadow-sm hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    <i className="fas fa-graduation-cap"></i> {totalStudentLogins !== null ? totalStudentLogins : "..."}
                  </div>
                  <p className="text-lg font-medium text-card-foreground">Student Logins</p>
                  <p className="text-xs mt-1 text-muted-foreground text-center">Students who logged in this month</p>
                </div>

                {/* Monthly Recruiter Logins Card */}
                <div className="flex flex-col items-center bg-secondary/30 border border-border p-6 rounded-xl shadow-sm hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
                  <div className="text-4xl font-bold text-yellow-500 mb-2">
                    <i className="fas fa-briefcase"></i> {totalRecruiterLogins !== null ? totalRecruiterLogins : "..."}
                  </div>
                  <p className="text-lg font-medium text-card-foreground">Recruiter Logins</p>
                  <p className="text-xs mt-1 text-muted-foreground text-center">Recruiters who logged in this month</p>
                </div>

                {/* Monthly Job Posted Card */}
                <div className="flex flex-col items-center bg-secondary/30 border border-border p-6 rounded-xl shadow-sm hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
                  <div className="text-4xl font-bold text-purple-400 mb-2">
                    <i className="fas fa-briefcase"></i> {totalJobPosted !== null ? totalJobPosted : "..."}
                  </div>
                  <p className="text-lg font-medium text-card-foreground">Jobs Posted</p>
                  <p className="text-xs mt-1 text-muted-foreground text-center">Jobs posted in the last 1 month</p>
                </div>

              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center border-t border-border/50 pt-8 mt-4">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold text-foreground">Job Hunt</h2>
            <p className="text-sm text-muted-foreground">© 2025 Your Company. All rights reserved.</p>
          </div>

          <div className="flex space-x-4">
            {/* Social Media Links */}
            <a href="https://facebook.com" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
              Facebook
            </a>
            <a href="https://twitter.com" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
              Twitter
            </a>
            <a href="https://linkedin.com" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
              LinkedIn
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
