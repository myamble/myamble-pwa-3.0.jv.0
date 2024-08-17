// src/app/(pages)/(admin)/survey-results/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/shadcn/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/shadcn/alert";
import { Spinner } from "~/components/shadcn/spinner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ExportSurveyResults } from "~/components/survey/ExportSurveyResults";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export default function SurveyResults() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState(null);

  const {
    data: surveyResults,
    isLoading,
    isError,
  } = api.survey.getSurveyResultsAggregated.useQuery({ surveyId: id });

  useEffect(() => {
    if (user && user.role !== "ADMIN" && user.role !== "SOCIAL_WORKER") {
      router.push("/");
    }
  }, [user, router]);

  if (!user || (user.role !== "ADMIN" && user.role !== "SOCIAL_WORKER")) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !surveyResults) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load survey results. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const renderChart = (questionKey, data) => {
    const chartData = Object.entries(data).map(([name, value]) => ({
      name,
      value,
    }));

    if (chartData.length <= 5) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">
        Survey Results: {surveyResults.survey.name}
      </h1>
      <p className="mb-4">Total Responses: {surveyResults.totalResponses}</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Export Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ExportSurveyResults
            surveyId={id}
            questions={Object.keys(surveyResults.aggregatedResults)}
          />
        </CardContent>
      </Card>

      {Object.entries(surveyResults.aggregatedResults).map(
        ([questionKey, data]) => (
          <Card key={questionKey} className="mb-6">
            <CardHeader>
              <CardTitle>{questionKey}</CardTitle>
            </CardHeader>
            <CardContent>{renderChart(questionKey, data)}</CardContent>
          </Card>
        ),
      )}
    </div>
  );
}
