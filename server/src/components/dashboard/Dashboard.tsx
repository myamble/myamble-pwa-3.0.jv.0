import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import Link from "next/link";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("assigned");
  const { data: surveys, isLoading: surveysLoading } =
    api.survey.getAllSurveys.useQuery();

  const { data: assignedSurveys, isLoading: assignedLoading } =
    api.survey.getAssignedSurveysForAdmin.useQuery();
  const { data: completedSurveys, isLoading: completedLoading } =
    api.survey.getCompletedSurveysForAdmin.useQuery();

  useEffect(() => {
    if (user && user.role !== "ADMIN" && user.role !== "SOCIAL_WORKER") {
      router.push("/");
    }
  }, [user, router]);

  if (!user || (user.role !== "ADMIN" && user.role !== "SOCIAL_WORKER")) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      {user.role === "ADMIN" && (
        <div className="mb-6">
          <Link href="/user-management">
            <Button>User Management</Button>
          </Link>
        </div>
      )}
      <div className="mb-6 flex space-x-4">
        <Button
          variant={activeTab === "assigned" ? "default" : "outline"}
          onClick={() => setActiveTab("assigned")}
        >
          Assigned Surveys
        </Button>
        <Button
          variant={activeTab === "completed" ? "default" : "outline"}
          onClick={() => setActiveTab("completed")}
        >
          Completed Surveys
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === "assigned"
              ? "Assigned Surveys"
              : "Completed Surveys"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeTab === "assigned" ? (
            assignedLoading ? (
              <p>Loading assigned surveys...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Survey Name</TableHead>
                    <TableHead>Participant</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedSurveys?.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.survey.name}</TableCell>
                      <TableCell>{assignment.user.name}</TableCell>
                      <TableCell>
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{assignment.status}</TableCell>
                      <TableCell>
                        <Button asChild size="sm">
                          <Link
                            href={`/survey-assignment/${assignment.id}/edit`}
                          >
                            Edit
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          ) : completedLoading ? (
            <p>Loading completed surveys...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Survey Name</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedSurveys?.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.survey.name}</TableCell>
                    <TableCell>{submission.user.name}</TableCell>
                    <TableCell>
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm">
                        <Link href={`/survey-results/${submission.id}`}>
                          View Results
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Survey Results</CardTitle>
        </CardHeader>
        <CardContent>
          {surveysLoading ? (
            <p>Loading surveys...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Survey Name</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveys?.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell>{survey.name}</TableCell>
                    <TableCell>
                      <Link href={`/survey-results/${survey.id}`}>
                        <Button size="sm">View Results</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
