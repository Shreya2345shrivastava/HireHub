import React, { useEffect } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { useSelector, useDispatch } from 'react-redux'
import { useSocket } from '@/context/SocketContext'
import { updateAppliedJobStatus } from '@/redux/jobSlice'
import { toast } from 'sonner'

const AppliedJobTable = () => {
    const {allAppliedJobs} = useSelector(store=>store.job);
    const dispatch = useDispatch();
    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        socket.on("status_updated", (data) => {
            dispatch(updateAppliedJobStatus(data));
            toast.info(`Update! Your application for "${data.jobTitle}" is now ${data.status.toUpperCase()}`);
        });

        return () => {
            socket.off("status_updated");
        };
    }, [socket, dispatch]);

    return (
        <div>
            <Table>
                <TableCaption>A list of your applied jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Job Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        !allAppliedJobs || allAppliedJobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                                    You haven't applied to any jobs yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            allAppliedJobs.map((appliedJob) => (
                                <TableRow key={appliedJob?._id}>
                                    <TableCell>{appliedJob?.createdAt ? appliedJob.createdAt.split("T")[0] : 'N/A'}</TableCell>
                                    <TableCell>{appliedJob?.job?.title || 'N/A'}</TableCell>
                                    <TableCell>{appliedJob?.job?.company?.name || 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge className={`${appliedJob?.status === "rejected" ? 'bg-red-400' : appliedJob?.status === 'pending' ? 'bg-gray-400' : 'bg-green-500'}`}>
                                            {appliedJob?.status ? appliedJob.status.toUpperCase() : 'PENDING'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default AppliedJobTable