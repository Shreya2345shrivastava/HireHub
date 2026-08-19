import React from 'react'
import { Badge } from '../ui/badge'
import { CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react'

const VerificationBadge = ({ status, className = "" }) => {
    switch (status) {
        case "verified":
            return (
                <Badge className={`text-cyan-400 font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-2 py-1 flex items-center gap-1 ${className}`} variant="outline">
                    <CheckCircle2 className="w-3.5 h-3.5 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" /> Verified
                </Badge>
            )
        case "pending":
            return (
                <Badge className={`text-amber-400 font-semibold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-2 py-1 flex items-center gap-1 ${className}`} variant="outline">
                    <Clock className="w-3.5 h-3.5" /> Pending Review
                </Badge>
            )
        case "rejected":
            return (
                <Badge className={`text-red-400 font-semibold bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-2 py-1 flex items-center gap-1 ${className}`} variant="outline">
                    <XCircle className="w-3.5 h-3.5" /> Rejected
                </Badge>
            )
        case "suspended":
            return (
                <Badge className={`text-orange-400 font-semibold bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 px-2 py-1 flex items-center gap-1 ${className}`} variant="outline">
                    <AlertCircle className="w-3.5 h-3.5" /> Suspended
                </Badge>
            )
        default:
            return null; // Unverified has no badge
    }
}

export default VerificationBadge
