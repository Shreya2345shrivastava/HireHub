import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import axiosInstance from '@/api/axiosInstance';
import { Mail, Phone, ExternalLink } from 'lucide-react';

const KanbanBoard = () => {
    const { applicants } = useSelector(store => store.application);
    const [columns, setColumns] = useState({
        pending: { name: "Applied", items: [] },
        accepted: { name: "Shortlisted", items: [] },
        rejected: { name: "Rejected", items: [] }
    });

    useEffect(() => {
        if (applicants && applicants.applications) {
            const newColumns = {
                pending: { name: "Applied", items: [] },
                accepted: { name: "Shortlisted", items: [] },
                rejected: { name: "Rejected", items: [] }
            };

            applicants.applications.forEach(app => {
                const status = app.status || "pending";
                if (newColumns[status]) {
                    newColumns[status].items.push(app);
                }
            });

            setColumns(newColumns);
        }
    }, [applicants]);

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

            try {
                const newStatus = destination.droppableId; // "pending", "accepted", "rejected"
                const res = await axiosInstance.post(`${APPLICATION_API_END_POINT}/status/${removed._id}/update`, { status: newStatus });
                if (res.data.success) {
                    toast.success("Candidate moved successfully");
                }
            } catch (error) {
                toast.error("Failed to update status");
                // In a production app, we would revert the state on failure
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

    return (
        <div className="flex gap-6 mt-8 overflow-x-auto pb-4">
            <DragDropContext onDragEnd={result => onDragEnd(result, columns, setColumns)}>
                {Object.entries(columns).map(([columnId, column], index) => {
                    return (
                        <div className="flex flex-col bg-card/50 backdrop-blur-xl rounded-xl border border-border shadow-glass w-[350px] flex-shrink-0" key={columnId}>
                            <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/50 rounded-t-xl">
                                <h2 className="font-semibold text-card-foreground">{column.name}</h2>
                                <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded-full">
                                    {column.items.length}
                                </span>
                            </div>
                            <div className="flex-1 p-4 min-h-[500px]">
                                <Droppable droppableId={columnId} key={columnId}>
                                    {(provided, snapshot) => {
                                        return (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={`h-full transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 rounded-lg' : ''}`}
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
                                                                        className={`p-4 mb-4 bg-secondary rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow ${snapshot.isDragging ? 'shadow-glow border-primary/50 opacity-90 scale-105' : ''}`}
                                                                    >
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <h3 className="font-bold text-card-foreground">{item?.applicant?.fullname}</h3>
                                                                            <span className="text-xs text-muted-foreground/60">{item.createdAt.split("T")[0]}</span>
                                                                        </div>
                                                                        
                                                                        <div className="space-y-1.5 mt-3">
                                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                                <Mail className="w-3.5 h-3.5 text-muted-foreground/80" />
                                                                                <span className="truncate">{item?.applicant?.email}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                                <Phone className="w-3.5 h-3.5 text-muted-foreground/80" />
                                                                                <span>{item?.applicant?.phoneNumber}</span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                                                                            {item.applicant?.profile?.resume && (
                                                                                <a 
                                                                                    href={item.applicant.profile.resume} 
                                                                                    target="_blank" 
                                                                                    rel="noopener noreferrer"
                                                                                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                                                                                >
                                                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                                                    View Resume
                                                                                </a>
                                                                            )}
                                                                            
                                                                            <button 
                                                                                onClick={async () => {
                                                                                    try {
                                                                                        const res = await axiosInstance.get(`${APPLICATION_API_END_POINT}/${item._id}/ai-match`);
                                                                                        if (res.data.success) {
                                                                                            toast.success(`AI Score: ${res.data.score}% - ${res.data.feedback}`);
                                                                                        }
                                                                                    } catch (error) {
                                                                                        toast.error("Failed to generate AI Match");
                                                                                    }
                                                                                }}
                                                                                className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-md font-bold hover:bg-primary/20 transition-colors border border-primary/20"
                                                                            >
                                                                                AI Match ✨
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
        </div>
    );
};

export default KanbanBoard;
