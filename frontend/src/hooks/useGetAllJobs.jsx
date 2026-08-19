import { setAllJobs } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axiosInstance from '@/api/axiosInstance'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const { jobFilters, searchedQuery } = useSelector(store => store.job);
    
    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                // Determine the keyword to use (global search or filter search)
                const keyword = searchedQuery || jobFilters.keyword || "";
                
                // Build the query string
                const queryParams = new URLSearchParams();
                if (keyword) queryParams.append('keyword', keyword);
                if (jobFilters.location) queryParams.append('location', jobFilters.location);
                if (jobFilters.jobType) queryParams.append('jobType', jobFilters.jobType);
                if (jobFilters.salaryMin) queryParams.append('salaryMin', jobFilters.salaryMin);
                if (jobFilters.salaryMax) queryParams.append('salaryMax', jobFilters.salaryMax);

                const res = await axiosInstance.get(`${JOB_API_END_POINT}/get?${queryParams.toString()}`);
                if (res.data.success) {
                    dispatch(setAllJobs(res.data.jobs));
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchAllJobs();
    }, [jobFilters, searchedQuery, dispatch]);
};

export default useGetAllJobs