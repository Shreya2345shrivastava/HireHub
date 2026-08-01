import { setAllSavedJobs } from "@/redux/jobSlice";
import { USER_API_END_POINT } from "@/utils/constant";
import axiosInstance from "@/api/axiosInstance";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetSavedJobs = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchSavedJobs = async () => {
            try {
                const res = await axiosInstance.get(`${USER_API_END_POINT}/saved-jobs`);
                if (res.data.success) {
                    dispatch(setAllSavedJobs(res.data.savedJobs));
                }
            } catch (error) {
                console.log("Error fetching saved jobs:", error);
            }
        };
        fetchSavedJobs();
    }, [dispatch]);
};

export default useGetSavedJobs;
