import axiosInstance from "@/api/axiosInstance";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export const AUDIT_API_END_POINT = "http://localhost:8000/api/v1/audit";

const useGetAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);

    const fetchLogs = useCallback(async (filters = {}, page = 1, append = false) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page,
                limit: 20,
                ...(filters.role && { role: filters.role }),
                ...(filters.action && { action: filters.action }),
                ...(filters.search && { search: filters.search }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate }),
            });

            const res = await axiosInstance.get(`${AUDIT_API_END_POINT}/get?${queryParams}`);
            
            if (res.data.success) {
                setLogs(prev => append ? [...prev, ...res.data.logs] : res.data.logs);
                setTotalPages(res.data.totalPages);
                setTotalLogs(res.data.totalLogs);
            }
        } catch (error) {
            console.error("Error fetching audit logs:", error);
            toast.error(error.response?.data?.message || "Failed to fetch logs");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAnalytics = useCallback(async () => {
        try {
            const res = await axiosInstance.get(`${AUDIT_API_END_POINT}/analytics`);
            if (res.data.success) {
                setAnalytics(res.data.analytics);
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
        }
    }, []);

    return {
        logs,
        analytics,
        loading,
        totalPages,
        totalLogs,
        fetchLogs,
        fetchAnalytics
    };
};

export default useGetAuditLogs;
