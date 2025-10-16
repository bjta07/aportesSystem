'use client'
import { ProtectedRoute } from "@/components/UI/ProtectedRoute"
import UserDashboard from "@/components/UI/Dashboard"

export default function AdminPage(){
    return(
        <ProtectedRoute requiredRole={"admin"}>
            <UserDashboard/>
        </ProtectedRoute>
    )
}