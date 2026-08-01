import React from 'react';
import Navbar from './shared/Navbar';
import Job from './Job';
import { useSelector } from 'react-redux';
import useGetSavedJobs from '@/hooks/useGetSavedJobs';
import { motion } from 'framer-motion';
import { BookmarkCheck } from 'lucide-react';

const SavedJobs = () => {
    useGetSavedJobs();
    const { allSavedJobs } = useSelector(store => store.job);

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto my-10 px-4'>
                <div className='flex items-center gap-3 mb-6'>
                    <BookmarkCheck className='w-8 h-8 text-[#7209b7]' />
                    <h1 className='font-bold text-2xl'>Saved Jobs ({allSavedJobs?.length || 0})</h1>
                </div>

                {
                    !allSavedJobs || allSavedJobs.length === 0 ? (
                        <div className='flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100'>
                            <BookmarkCheck className='w-16 h-16 text-gray-300 mb-4' />
                            <h2 className='text-xl font-semibold text-gray-600 mb-2'>No Saved Jobs Yet</h2>
                            <p className='text-gray-400 max-w-md text-center'>
                                When you bookmark jobs while browsing, they will appear here so you can easily apply to them later.
                            </p>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {
                                allSavedJobs.map((job) => (
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
                    )
                }
            </div>
        </div>
    );
};

export default SavedJobs;
