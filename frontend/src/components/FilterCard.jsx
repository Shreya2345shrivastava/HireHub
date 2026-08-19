import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setJobFilters } from '@/redux/jobSlice';

const FilterCard = () => {
    const dispatch = useDispatch();
    const { jobFilters } = useSelector(store => store.job);

    const [localFilters, setLocalFilters] = useState({
        location: jobFilters?.location || '',
        jobType: jobFilters?.jobType || '',
        salaryMin: jobFilters?.salaryMin || '',
        salaryMax: jobFilters?.salaryMax || ''
    });

    // Debounce effect to avoid spamming the backend
    useEffect(() => {
        const handler = setTimeout(() => {
            dispatch(setJobFilters(localFilters));
        }, 500); // 500ms debounce

        return () => clearTimeout(handler);
    }, [localFilters, dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleClearFilters = () => {
        setLocalFilters({
            location: '',
            jobType: '',
            salaryMin: '',
            salaryMax: ''
        });
    };

    return (
        <div className='w-full bg-card/60 p-6 rounded-2xl border border-border/50 shadow-glass backdrop-blur-2xl'>
            <div className='flex justify-between items-center mb-6'>
                <h1 className='font-bold text-xl text-foreground tracking-tight'>Filter Jobs</h1>
                <button 
                    onClick={handleClearFilters}
                    className='text-sm text-cyan-400 hover:text-cyan-300 font-semibold transition-colors bg-cyan-400/10 px-3 py-1 rounded-full'
                >
                    Clear All
                </button>
            </div>
            
            <div className='space-y-8'>
                {/* Location Filter */}
                <div>
                    <h2 className='font-semibold text-foreground mb-3 flex items-center gap-2'>
                        Location
                    </h2>
                    <select 
                        name="location" 
                        value={localFilters.location} 
                        onChange={handleInputChange}
                        className='w-full p-3 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-muted-foreground hover:border-cyan-500/30 transition-all appearance-none cursor-pointer shadow-sm'
                    >
                        <option value="">Any Location</option>
                        <option value="Delhi">Delhi NCR</option>
                        <option value="Bangalore">Bangalore</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Pune">Pune</option>
                        <option value="Mumbai">Mumbai</option>
                    </select>
                </div>

                {/* Job Type Filter */}
                <div>
                    <h2 className='font-semibold text-foreground mb-3'>Job Type</h2>
                    <div className='flex flex-wrap gap-2'>
                        {['Full-time', 'Part-time', 'Internship', 'Contract'].map((type) => (
                            <label key={type} className={`cursor-pointer transition-all duration-200 px-4 py-2 rounded-full border text-sm font-medium ${
                                localFilters.jobType === type 
                                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                                : 'bg-background border-border/50 text-muted-foreground hover:border-cyan-500/30 hover:text-foreground'
                            }`}>
                                <input 
                                    type="radio" 
                                    name="jobType" 
                                    value={type} 
                                    checked={localFilters.jobType === type}
                                    onChange={handleInputChange}
                                    className='hidden'
                                />
                                {type}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Salary Filter */}
                <div>
                    <h2 className='font-semibold text-foreground mb-3'>Salary Range</h2>
                    <div className='flex gap-3 items-center'>
                        <div className='relative flex-1'>
                            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium'>₹</span>
                            <input 
                                type="number" 
                                name="salaryMin" 
                                placeholder="Min" 
                                value={localFilters.salaryMin}
                                onChange={handleInputChange}
                                className='w-full pl-7 pr-3 py-2.5 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-foreground text-sm placeholder:text-muted-foreground/50 transition-all hover:border-cyan-500/30'
                            />
                        </div>
                        <span className='text-muted-foreground font-medium'>to</span>
                        <div className='relative flex-1'>
                            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium'>₹</span>
                            <input 
                                type="number" 
                                name="salaryMax" 
                                placeholder="Max" 
                                value={localFilters.salaryMax}
                                onChange={handleInputChange}
                                className='w-full pl-7 pr-3 py-2.5 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-foreground text-sm placeholder:text-muted-foreground/50 transition-all hover:border-cyan-500/30'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterCard;