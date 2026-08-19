import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT, INTERVIEW_API_END_POINT } from '@/utils/constant';
import axiosInstance from '@/api/axiosInstance';
import { Mail, Phone, ExternalLink, Calendar, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useNavigate } from 'react-router-dom';

const KanbanBoard = ({ filterScore = 0 }) => {
    const navigate = useNavigate();
    const { applicants } = useSelector(store => store.application);
    const [columns, setColumns] = useState({});
    const [interviewModal, setInterviewModal] = useState({ open: false, applicantId: null, sourceCol: null });
    const [interviewData, setInterviewData] = useState({ roundName: 'HR Round', type: 'Online', date: '', time: '', duration: '30 mins', location: '', link: '', notes: '' });

    const ATS_COLUMNS = {
        applied: "Applied",
        under_review: "Under Review",
        shortlisted: "Shortlisted",
        interview_scheduled: "Interview Scheduled",
        selected: "Selected",
        rejected: "Rejected"
    };

    // Helper to map legacy status to new ones if needed
    const mapStatus = (status) => {
        if (status === 'pending') return 'applied';
        if (status === 'accepted') return 'selected';
        return status;
    };

    useEffect(() => {
        if (applicants && applicants.applications) {
            const newColumns = Object.keys(ATS_COLUMNS).reduce((acc, key) => {
                acc[key] = { name: ATS_COLUMNS[key], items: [] };
                return acc;
            }, {});

            applicants.applications.forEach(app => {
                if ((app.matchScore || 0) < filterScore) return;

                const status = mapStatus(app.status || "applied");
                if (newColumns[status]) {
                    newColumns[status].items.push(app);
                } else {
                    newColumns['applied'].items.push(app);
                }
            });

            setColumns(newColumns);
        }
    }, [applicants, filterScore]);

    // Just removed legacy map initialization block

    const onDragEnd = async (result, columns, setColumns) => {
        if (!result.destination) return;
        const { source, destination } = result;

        if (source.droppableId !== destination.droppableId) {
            const sourceColumn = columns[source.droppableId];
            const destColumn = columns[destination.droppableId];
            const sourceItems = [...sourceColumn.items];
            const destItems = [...destColumn.items];
            const [removed] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, removed);

            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...sourceColumn,
                    items: sourceItems
                },
                [destination.droppableId]: {
                    ...destColumn,
                    items: destItems
                }
            });

            const newStatus = destination.droppableId;
            
            if (newStatus === 'interview_scheduled') {
                // Intercept for modal
                setInterviewModal({ open: true, applicantId: removed._id, sourceCol: source.droppableId });
                return;
            }

            try {
                const res = await axiosInstance.post(`${APPLICATION_API_END_POINT}/status/${removed._id}/update`, { status: newStatus });
                if (res.data.success) {
                    toast.success("Candidate moved successfully");
                }
            } catch (error) {
                toast.error("Failed to update status");
                // Revert
                setColumns(columns);
            }
        } else {
            const column = columns[source.droppableId];
            const copiedItems = [...column.items];
            const [removed] = copiedItems.splice(source.index, 1);
            copiedItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...column,
                    items: copiedItems
                }
            });
        }
    };

    const submitInterviewSchedule = async () => {
        try {
            const payload = {
                applicationId: interviewModal.applicantId,
                roundName: interviewData.roundName,
                interviewType: interviewData.type,
                interviewDate: interviewData.date,
                interviewTime: interviewData.time,
                duration: interviewData.duration,
                notes: interviewData.notes
            };
            if (interviewData.type === 'Online') payload.meetingLink = interviewData.link;
            else payload.location = interviewData.location;

            const res = await axiosInstance.post(`${INTERVIEW_API_END_POINT}/schedule`, payload);
            if (res.data.success) {
                toast.success("Interview scheduled successfully!");
                setInterviewModal({ open: false, applicantId: null, sourceCol: null });
                setInterviewData({ roundName: 'HR Round', type: 'Online', date: '', time: '', duration: '30 mins', location: '', link: '', notes: '' });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to schedule interview");
        }
    };

    const cancelInterviewSchedule = () => {
        // Revert card back to original column
        const sourceCol = columns[interviewModal.sourceCol];
        const destCol = columns['interview_scheduled'];
        
        const cardIndex = destCol.items.findIndex(item => item._id === interviewModal.applicantId);
        if (cardIndex !== -1) {
            const [removed] = destCol.items.splice(cardIndex, 1);
            sourceCol.items.push(removed); // Just push to end for simple revert
            
            setColumns({
                ...columns,
                [interviewModal.sourceCol]: { ...sourceCol },
                'interview_scheduled': { ...destCol }
            });
        }
        setInterviewModal({ open: false, applicantId: null, sourceCol: null });
        setInterviewData({ roundName: 'HR Round', type: 'Online', date: '', time: '', duration: '30 mins', location: '', link: '', notes: '' });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 h-full w-full">
            <DragDropContext onDragEnd={result => onDragEnd(result, columns, setColumns)}>
                {Object.entries(columns).map(([columnId, column], index) => {
                    return (
                        <div className="flex flex-col bg-card/40 backdrop-blur-md rounded-xl border border-border shadow-sm w-full h-[600px] xl:h-full flex-shrink-0 overflow-hidden" key={columnId}>
                            <div className="p-3 border-b border-border flex justify-between items-center bg-secondary/30 rounded-t-xl sticky top-0 z-10 flex-shrink-0">
                                <h2 className="font-semibold text-card-foreground text-[11px] 2xl:text-xs uppercase tracking-wider truncate mr-1">{column.name}</h2>
                                <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                                    {column.items.length}
                                </span>
                            </div>
                            <div className="flex-1 p-2 overflow-y-auto custom-scrollbar">
                                <Droppable droppableId={columnId} key={columnId}>
                                    {(provided, snapshot) => {
                                        return (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={`min-h-[100px] h-full transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 rounded-lg' : ''}`}
                                            >
                                                {column.items.map((item, index) => {
                                                    return (
                                                        <Draggable key={item._id} draggableId={item._id} index={index}>
                                                            {(provided, snapshot) => {
                                                                return (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        className={`p-3 mb-3 bg-secondary rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col h-[195px] overflow-hidden ${snapshot.isDragging ? 'shadow-glow border-primary/50 opacity-90 scale-105' : ''}`}
                                                                    >
                                                                        <div className="flex justify-between items-start mb-1 flex-shrink-0">
                                                                            <h3 className="font-bold text-card-foreground text-sm truncate pr-2">{item?.applicant?.fullname}</h3>
                                                                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${item.matchScore >= 80 ? 'bg-green-500/20 text-green-500 border border-green-500/20' : item.matchScore >= 50 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20' : 'bg-red-500/20 text-red-500 border border-red-500/20'}`}>
                                                                                {item.matchScore || 0}% Match
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div className="text-[10px] text-muted-foreground/80 line-clamp-2 mt-1 mb-2 italic h-[30px]">
                                                                            "{item.aiSummary || 'No AI summary available.'}"
                                                                        </div>

                                                                        <div className="flex flex-wrap gap-1 mb-2 overflow-hidden h-[20px] flex-shrink-0">
                                                                            {(item.applicant?.profile?.parsedResumeData?.extractedSkills || item.applicant?.profile?.skills || []).slice(0, 3).map((skill, i) => (
                                                                                <span key={i} className="bg-background text-muted-foreground text-[9px] px-1.5 py-0.5 rounded border border-border">{skill}</span>
                                                                            ))}
                                                                            {(item.applicant?.profile?.parsedResumeData?.extractedSkills || item.applicant?.profile?.skills || []).length > 3 && (
                                                                                <span className="bg-background text-muted-foreground text-[9px] px-1.5 py-0.5 rounded border border-border">+{((item.applicant?.profile?.parsedResumeData?.extractedSkills || item.applicant?.profile?.skills || []).length - 3)}</span>
                                                                            )}
                                                                        </div>

                                                                        <div className="mt-auto pt-2 border-t border-border flex justify-between items-center flex-shrink-0">
                                                                            {item.applicant?.profile?.resume && (
                                                                                <a 
                                                                                    href={item.applicant.profile.resume} 
                                                                                    target="_blank" 
                                                                                    rel="noopener noreferrer"
                                                                                    onMouseDown={(e) => e.stopPropagation()}
                                                                                    onTouchStart={(e) => e.stopPropagation()}
                                                                                    className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors relative z-10"
                                                                                >
                                                                                    <ExternalLink className="w-3 h-3" />
                                                                                    Resume
                                                                                </a>
                                                                            )}
                                                                            
                                                                            <span className="text-[10px] text-muted-foreground/60">{item.createdAt.split("T")[0]}</span>
                                                                        </div>

                                                                        {/* Interview Details if Scheduled */}
                                                                        {(() => {
                                                                            const latestInterview = item.interviews?.length > 0 ? item.interviews[item.interviews.length - 1] : null;
                                                                            if (latestInterview && columnId === 'interview_scheduled') {
                                                                                return (
                                                                                    <div className="mt-1.5 p-1.5 bg-card/60 rounded border border-border text-[9px] text-muted-foreground flex flex-col gap-1 flex-shrink-0">
                                                                                        <div className="flex justify-between items-center w-full">
                                                                                            <span className="font-bold text-primary">{latestInterview.roundName}</span>
                                                                                            <span className={`px-1 rounded ${latestInterview.status === 'Completed' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}`}>{latestInterview.status}</span>
                                                                                        </div>
                                                                                        <div className="flex justify-between items-center w-full">
                                                                                            <div className="flex items-center gap-1 truncate"><Calendar className="w-2.5 h-2.5 flex-shrink-0" /> {latestInterview.interviewDate}</div>
                                                                                            {latestInterview.meetingLink && <a href={latestInterview.meetingLink} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-0.5"><LinkIcon className="w-2.5 h-2.5" /> Link</a>}
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            }
                                                                            return null;
                                                                        })()}

                                                                        <div className="mt-2 w-full flex-shrink-0">
                                                                            <button 
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    navigate(`/recruiter/candidate/${item._id}`);
                                                                                }}
                                                                                onMouseDown={(e) => e.stopPropagation()}
                                                                                onTouchStart={(e) => e.stopPropagation()}
                                                                                className="w-full py-1 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 rounded hover:bg-primary hover:text-white transition-colors relative z-10"
                                                                            >
                                                                                View Profile
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }}
                                                        </Draggable>
                                                    );
                                                })}
                                                {provided.placeholder}
                                            </div>
                                        );
                                    }}
                                </Droppable>
                            </div>
                        </div>
                    );
                })}
            </DragDropContext>

            <Dialog open={interviewModal.open} onOpenChange={(open) => {
                if (!open) cancelInterviewSchedule();
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Schedule Interview</DialogTitle>
                        <DialogDescription>
                            Enter the details to schedule an interview for this candidate.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto custom-scrollbar px-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Round Name</Label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={interviewData.roundName}
                                    onChange={(e) => setInterviewData({...interviewData, roundName: e.target.value})}
                                >
                                    <option value="HR Round">HR Round</option>
                                    <option value="Technical Round">Technical Round</option>
                                    <option value="Manager Round">Manager Round</option>
                                    <option value="Final Round">Final Round</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Type</Label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={interviewData.type}
                                    onChange={(e) => setInterviewData({...interviewData, type: e.target.value})}
                                >
                                    <option value="Online">Online</option>
                                    <option value="Offline">Offline</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={interviewData.date} onChange={(e) => setInterviewData({...interviewData, date: e.target.value})} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="time">Time</Label>
                                <Input id="time" type="time" value={interviewData.time} onChange={(e) => setInterviewData({...interviewData, time: e.target.value})} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="duration">Duration</Label>
                                <Input id="duration" placeholder="e.g. 45 mins" value={interviewData.duration} onChange={(e) => setInterviewData({...interviewData, duration: e.target.value})} />
                            </div>
                        </div>

                        {interviewData.type === 'Online' ? (
                            <div className="grid gap-2">
                                <Label htmlFor="link">Meeting Link</Label>
                                <Input id="link" placeholder="https://zoom.us/j/..." value={interviewData.link} onChange={(e) => setInterviewData({...interviewData, link: e.target.value})} />
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" placeholder="Office Address or Room" value={interviewData.location} onChange={(e) => setInterviewData({...interviewData, location: e.target.value})} />
                            </div>
                        )}
                        
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes to Candidate (Optional)</Label>
                            <Textarea id="notes" placeholder="Please prepare..." value={interviewData.notes} onChange={(e) => setInterviewData({...interviewData, notes: e.target.value})} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={cancelInterviewSchedule}>Cancel</Button>
                        <Button onClick={submitInterviewSchedule}>Schedule Interview</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default KanbanBoard;
