import React, { useEffect } from 'react'
import Navbar from '../shared/Navbar'
import KanbanBoard from './KanbanBoard'
import AIInsightsDashboard from './AIInsightsDashboard'
import axiosInstance from '@/api/axiosInstance';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';

const Applicants = () => {
    const [filterScore, setFilterScore] = React.useState(0);
    const params = useParams();
    const dispatch = useDispatch();
    const {applicants} = useSelector(store=>store.application);

    useEffect(() => {
        const fetchAllApplicants = async () => {
            try {
                const res = await axiosInstance.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`);
                dispatch(setAllApplicants(res.data.job));
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllApplicants();
    }, []);
    return (
        <div className="min-h-screen xl:h-screen bg-background flex flex-col overflow-y-auto xl:overflow-hidden">
            <Navbar />
            <div className='w-full max-w-[1600px] mx-auto px-4 xl:px-6 pt-24 flex-1 flex flex-col min-h-0 pb-4'>
                <AIInsightsDashboard />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h1 className='font-bold text-2xl text-foreground'>Applicants ({applicants?.applications?.length || 0})</h1>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground font-medium">Filter by Match:</label>
                        <select 
                            className="bg-card text-card-foreground border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-primary transition-colors"
                            value={filterScore}
                            onChange={(e) => setFilterScore(Number(e.target.value))}
                        >
                            <option value={0}>All Applicants</option>
                            <option value={50}>&gt; 50% Match</option>
                            <option value={75}>&gt; 75% Match</option>
                            <option value={90}>&gt; 90% Match</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 min-h-0">
                    <KanbanBoard filterScore={filterScore} />
                </div>
            </div>
        </div>
    )
}

export default Applicants