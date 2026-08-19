import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import FilterCard from './FilterCard'
import Job from './Job';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import JobRecommendations from './student/JobRecommendations';

// const jobsArray = [1, 2, 3, 4, 5, 6, 7, 8];

const Jobs = () => {
    const { allJobs } = useSelector(store => store.job);

    return (
        <div className="bg-mesh-gradient min-h-screen flex flex-col">
            <Navbar />
            {/* Page Header */}
            <div className='w-full pt-16 pb-12 relative overflow-hidden'>
                <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-32 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none'></div>
                <div className='max-w-7xl mx-auto px-4 text-center relative z-10'>
                    <h1 className='text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4'>
                        Discover <span className='text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400'>Opportunities</span>
                    </h1>
                    <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
                        Browse through our curated list of top-tier jobs. Find your next great career move with advanced filtering and smart matching.
                    </p>
                </div>
            </div>

            {/* AI Job Recommendations */}
            <JobRecommendations />

            <div className='max-w-7xl mx-auto mt-2 px-4 flex-1 w-full'>
                <div className='flex flex-col lg:flex-row gap-8'>
                    <div className='w-full lg:w-1/4 lg:min-w-[280px] lg:max-w-[320px]'>
                        <FilterCard />
                    </div>
                    {
                        allJobs.length <= 0 ? (
                            <div className='flex-1 flex flex-col items-center justify-center h-[50vh] text-center bg-card/30 rounded-2xl border border-border/50 backdrop-blur-sm'>
                                <h2 className='text-2xl font-bold text-foreground mb-2'>No jobs found</h2>
                                <p className='text-muted-foreground'>Try adjusting your filters or check back later for new opportunities.</p>
                            </div>
                        ) : (
                            <div className='flex-1 h-[calc(100vh-250px)] overflow-y-auto pb-10 pr-4 custom-scrollbar'>
                                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                                    {
                                        allJobs.map((job) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3 }}
                                                key={job?._id}>
                                                <Job job={job} />
                                            </motion.div>
                                        ))
                                    }
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Jobs