'use client'
import { ProtectedRoute } from "@/components/UI/ProtectedRoute"
import UserDashboard from "@/components/UI/Dashboard"

export default function UserPage(){
    return(
        <ProtectedRoute requiredRole={"user"}>
            <UserDashboard/>
        </ProtectedRoute>
    )
}