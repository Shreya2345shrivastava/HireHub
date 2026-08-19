import { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";
import { COMPANY_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";

const useGetCompanyPublicProfile = (companyId) => {
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompanyProfile = async () => {
            if (!companyId) return;
            try {
                setLoading(true);
                const res = await axiosInstance.get(`${COMPANY_API_END_POINT}/public/${companyId}`);
                if (res.data.success) {
                    setCompany(res.data.company);
                    setJobs(res.data.jobs);
                    setStats(res.data.stats);
                }
            } catch (error) {
                console.error(error);
                toast.error(error.response?.data?.message || "Failed to load company profile");
            } finally {
                setLoading(false);
            }
        };

        fetchCompanyProfile();
    }, [companyId]);

    return { company, jobs, stats, loading };
};

export default useGetCompanyPublicProfile;
