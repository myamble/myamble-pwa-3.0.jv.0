import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/app/_hooks/useAuth";
import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/app/_components/ui/table";
import Link from "next/link";
import { SurveyCompletionChart } from "~/components/analytics/SurveyCompletionChart";
import { ParticipantEngagementChart } from "~/components/analytics/ParticipantEngagementChart";
import { ResponseTrendChart } from "~/components/analytics/ResponseTrendChart";

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
  const { data: analyticsData, isLoading: analyticsLoading } =
    api.analytics.getOverviewData.useQuery();

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
        <Button
          variant={activeTab === "analytics" ? "default" : "outline"}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </Button>
      </div>

      {activeTab === "assigned" && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            {assignedLoading ? (
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
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "completed" && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            {completedLoading ? (
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
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Survey Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <p>Loading analytics data...</p>
              ) : (
                <SurveyCompletionChart
                  data={analyticsData?.surveyCompletionData}
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Participant Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <p>Loading analytics data...</p>
              ) : (
                <ParticipantEngagementChart
                  data={analyticsData?.participantEngagementData}
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Response Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <p>Loading analytics data...</p>
              ) : (
                <ResponseTrendChart data={analyticsData?.responseTrendData} />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Surveys</CardTitle>
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
