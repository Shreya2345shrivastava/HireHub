import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
    name:"job",
    initialState:{
        allJobs:[],
        allAdminJobs:[],
        singleJob:null, 
        searchJobByText:"",
        allAppliedJobs:[],
        searchedQuery:"",
        allSavedJobs:[],
        jobFilters: {
            keyword: "",
            location: "",
            jobType: "",
            salaryMin: "",
            salaryMax: ""
        }
    },
    reducers:{
        // actions
        setAllJobs:(state,action) => {
            state.allJobs = action.payload;
        },
        setSingleJob:(state,action) => {
            state.singleJob = action.payload;
        },
        setAllAdminJobs:(state,action) => {
            state.allAdminJobs = action.payload;
        },
        setSearchJobByText:(state,action) => {
            state.searchJobByText = action.payload;
        },
        setAllAppliedJobs:(state,action) => {
            state.allAppliedJobs = action.payload;
        },
        setSearchedQuery:(state,action) => {
            state.searchedQuery = action.payload;
        },
        setAllSavedJobs:(state,action) => {
            state.allSavedJobs = action.payload;
        },
        setJobFilters:(state,action) => {
            state.jobFilters = { ...state.jobFilters, ...action.payload };
        },
        updateAppliedJobStatus:(state, action) => {
            const { applicationId, status } = action.payload;
            const index = state.allAppliedJobs.findIndex(app => app._id === applicationId);
            if (index !== -1) {
                state.allAppliedJobs[index].status = status;
            }
        }
    }
});
export const {
    setAllJobs, 
    setSingleJob, 
    setAllAdminJobs,
    setSearchJobByText, 
    setAllAppliedJobs,
    setSearchedQuery,
    setAllSavedJobs,
    setJobFilters,
    updateAppliedJobStatus
} = jobSlice.actions;
export default jobSlice.reducer;