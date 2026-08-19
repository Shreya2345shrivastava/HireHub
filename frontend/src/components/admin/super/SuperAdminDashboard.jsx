import React from 'react'
import Navbar from '../../shared/Navbar'
import PendingVerifications from './PendingVerifications'

const SuperAdminDashboard = () => {
    return (
        <div>
            <Navbar />
            <div className="max-w-7xl mx-auto my-10 px-4">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage platform verifications and content</p>
                </div>
                
                <div className="bg-card border border-border shadow-sm rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-6">Pending Company Verifications</h2>
                    <PendingVerifications />
                </div>
            </div>
        </div>
    )
}

export default SuperAdminDashboard
