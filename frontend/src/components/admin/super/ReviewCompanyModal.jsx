import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Label } from "../../ui/label"

const ReviewCompanyModal = ({ company, onApprove, onReject, onSuspend, loading }) => {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [actionType, setActionType] = useState(null); // 'reject' or 'suspend'

    const handleApprove = () => {
        onApprove(company._id);
        setOpen(false);
    }

    const handleActionWithReason = () => {
        if (!reason) return;
        if (actionType === 'reject') {
            onReject(company._id, reason);
        } else if (actionType === 'suspend') {
            onSuspend(company._id, reason);
        }
        setOpen(false);
        setReason("");
        setActionType(null);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Review Details</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Review Company Verification</DialogTitle>
                    <DialogDescription>
                        Review the submitted details and supporting documents for {company.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Official Email</Label>
                            <p className="font-medium text-sm">{company.officialCompanyEmail}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">LinkedIn URL</Label>
                            <p className="font-medium text-sm">
                                <a href={company.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{company.linkedinUrl}</a>
                            </p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Industry</Label>
                            <p className="font-medium text-sm">{company.industry}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Headquarters</Label>
                            <p className="font-medium text-sm">{company.headquarters}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Company Size</Label>
                            <p className="font-medium text-sm">{company.companySize} employees</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Registration Number</Label>
                            <p className="font-medium text-sm">{company.registrationNumber || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Trust Score</Label>
                            <div className="font-semibold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md text-xs border border-blue-200 mt-1">
                                {company.trustScore !== undefined ? `${company.trustScore}/100` : "N/A"}
                            </div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Website</Label>
                            <p className="font-medium text-sm">
                                {company.website ? <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{company.website}</a> : "N/A"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <Label className="text-muted-foreground mb-2 block">Supporting Documents</Label>
                        {company.supportingDocuments && company.supportingDocuments.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {company.supportingDocuments.map((doc, idx) => (
                                    <a key={idx} href={doc} target="_blank" rel="noopener noreferrer">
                                        <Button variant="secondary" size="sm">Document {idx + 1}</Button>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No supporting documents uploaded.</p>
                        )}
                    </div>

                    {actionType && (
                        <div className={`mt-4 p-4 border rounded-md ${actionType === 'reject' ? 'border-red-200 bg-red-50' : 'border-purple-200 bg-purple-50'}`}>
                            <Label className={actionType === 'reject' ? "text-red-700" : "text-purple-700"}>
                                {actionType === 'reject' ? 'Rejection Reason' : 'Suspension Reason'}
                            </Label>
                            <textarea 
                                placeholder={`Please explain why the company is being ${actionType}ed...`}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="mt-2 w-full p-2 text-sm border rounded-md"
                                rows={4}
                            />
                            <div className="flex gap-2 mt-3 justify-end">
                                <Button variant="ghost" size="sm" onClick={() => setActionType(null)}>Cancel</Button>
                                <Button 
                                    variant={actionType === 'reject' ? "destructive" : "default"} 
                                    className={actionType === 'suspend' ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
                                    size="sm" 
                                    onClick={handleActionWithReason} 
                                    disabled={!reason || loading}
                                >
                                    Confirm {actionType === 'reject' ? 'Reject' : 'Suspend'}
                                </Button>
                            </div>
                        </div>
                    )}

                </div>
                {!actionType && (
                    <div className="flex justify-between items-center mt-4">
                        <div className="flex gap-2">
                            {company.verificationStatus !== 'rejected' && (
                                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => setActionType('reject')}>Reject</Button>
                            )}
                            {company.verificationStatus !== 'suspended' && company.verificationStatus !== 'pending' && (
                                <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700" onClick={() => setActionType('suspend')}>Suspend</Button>
                            )}
                        </div>
                        {company.verificationStatus !== 'verified' && (
                            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove} disabled={loading}>Approve Verification</Button>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default ReviewCompanyModal
