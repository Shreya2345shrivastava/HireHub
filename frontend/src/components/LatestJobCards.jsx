import React from 'react'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { MapPin, Building2 } from 'lucide-react'

const LatestJobCards = ({job}) => {
    const navigate = useNavigate();
    return (
        <div onClick={()=> navigate(`/description/${job._id}`)} className='p-6 rounded-2xl shadow-glass bg-card border border-border cursor-pointer transition-all duration-300 hover:shadow-glow hover:-translate-y-2 hover:border-cyan-500/50 group flex flex-col justify-between min-h-[220px]'>
            
            <div>
                {/* Header: Logo and Company Info */}
                <div className='flex items-center gap-4 mb-4'>
                    <div className='w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center border border-border group-hover:border-cyan-500/30 transition-colors'>
                        <Building2 className='w-6 h-6 text-cyan-400' />
                    </div>
                    <div>
                        <h1 className='font-semibold text-lg text-card-foreground group-hover:text-cyan-400 transition-colors capitalize'>{job?.company?.name || "Company"}</h1>
                        <p className='text-sm text-muted-foreground flex items-center gap-1'>
                            <MapPin className='w-3.5 h-3.5' /> India
                        </p>
                    </div>
                </div>

                {/* Job Title and Description */}
                <div className='mb-6'>
                    <h1 className='font-bold text-xl mb-2 text-foreground capitalize tracking-tight'>{job?.title}</h1>
                    <p className='text-sm text-muted-foreground line-clamp-2 leading-relaxed'>
                        {job?.description && job.description !== 'null' ? job.description : 'No description provided.'}
                    </p>
                </div>
            </div>
            
            {/* Badges */}
            <div className='flex items-center gap-2 mt-auto pt-4 border-t border-border/50 flex-wrap'>
                <Badge className={'text-blue-400 font-semibold bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1'} variant="outline">{job?.position} Positions</Badge>
                <Badge className={'text-red-400 font-semibold bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1'} variant="outline">{job?.jobType}</Badge>
                <Badge className={'text-cyan-400 font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-3 py-1'} variant="outline">{job?.salary}LPA</Badge>
            </div>

        </div>
    )
}

export default LatestJobCards