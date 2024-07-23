import React from "react";
import { useAuth } from "~/app/_hooks/useAuth";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const { data: assignedSurveys, isLoading } =
    api.survey.getAssignedSurveys.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "not_started":
        return <Badge variant="secondary">Not Started</Badge>;
      case "in_progress":
        return <Badge variant="primary">In Progress</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Welcome, {user?.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Assigned Surveys</CardTitle>
        </CardHeader>
        <CardContent>
          {assignedSurveys && assignedSurveys.length > 0 ? (
            <ul className="space-y-4">
              {assignedSurveys.map((survey) => (
                <li
                  key={survey.id}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div>
                    <h3 className="font-semibold">{survey.name}</h3>
                    <p className="text-sm text-gray-500">
                      {survey.description}
                    </p>
                    <p className="text-sm">
                      Due: {new Date(survey.dueDate).toLocaleDateString()}
                    </p>
                    {getStatusBadge(survey.status)}
                  </div>
                  <Link href={`/survey/${survey.id}`}>
                    <Button>
                      {survey.status === "completed"
                        ? "View Responses"
                        : "Take Survey"}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>You have no assigned surveys at the moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
