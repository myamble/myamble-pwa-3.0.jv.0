// src/app/(pages)/(admin)/survey-assignment/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Spinner } from "~/components/ui/spinner";

export default function EditSurveyAssignment() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [occurrence, setOccurrence] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState(null);

  const {
    data: assignment,
    isLoading,
    isError,
  } = api.survey.getSurveyAssignment.useQuery({ id });
  const updateAssignment = api.survey.updateSurveyAssignment.useMutation();

  useEffect(() => {
    if (user && user.role !== "ADMIN" && user.role !== "SOCIAL_WORKER") {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (assignment) {
      setOccurrence(assignment.occurrence);
      setStartDate(assignment.startDate.split("T")[0]);
      setEndDate(assignment.endDate ? assignment.endDate.split("T")[0] : "");
    }
  }, [assignment]);

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

  if (isError || !assignment) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load survey assignment. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAssignment.mutateAsync({
        id,
        occurrence,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
      });
      alert("Survey assignment updated successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating survey assignment:", error);
      setError("Failed to update survey assignment. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit Survey Assignment</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="survey">Survey</Label>
          <Input id="survey" value={assignment.survey.name} disabled />
        </div>
        <div>
          <Label htmlFor="participant">Participant</Label>
          <Input id="participant" value={assignment.user.name} disabled />
        </div>
        <div>
          <Label htmlFor="occurrence">Occurrence</Label>
          <Select onValueChange={setOccurrence} value={occurrence}>
            <SelectTrigger id="occurrence">
              <SelectValue placeholder="Select occurrence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="once">Once</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date (optional)</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <Button type="submit">Update Assignment</Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
