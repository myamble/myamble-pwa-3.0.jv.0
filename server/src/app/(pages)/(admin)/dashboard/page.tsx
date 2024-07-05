// src/app/(pages)/(admin)/dashboard/page.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Welcome, {user.name}</h1>
      {dashboardData && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Surveys</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{dashboardData.totalSurveys}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {dashboardData.activeParticipants}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Completed Surveys</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {dashboardData.completedSurveys}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
