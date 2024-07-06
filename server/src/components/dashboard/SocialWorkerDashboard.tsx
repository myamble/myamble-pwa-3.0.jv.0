import React from "react";
import { useAuth } from "~/hooks/useAuth";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";

export default function SocialWorkerDashboard() {
  const { user } = useAuth();
  const { data: assignedParticipants, isLoading } =
    api.userManagement.getAssignedParticipants.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Welcome, {user?.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Assigned Participants</CardTitle>
        </CardHeader>
        <CardContent>
          {assignedParticipants && assignedParticipants.length > 0 ? (
            <ul className="space-y-4">
              {assignedParticipants.map((participant) => (
                <li
                  key={participant.id}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div>
                    <h3 className="font-semibold">{participant.name}</h3>
                    <p className="text-sm text-gray-500">{participant.email}</p>
                    <p className="text-sm">
                      Surveys Completed: {participant.completedSurveys} /{" "}
                      {participant.totalAssignedSurveys}
                    </p>
                    {participant.hasOverdueSurveys && (
                      <Badge variant="destructive">Has Overdue Surveys</Badge>
                    )}
                  </div>
                  <Link href={`/participant/${participant.id}`}>
                    <Button>View Details</Button>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>You have no assigned participants at the moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
