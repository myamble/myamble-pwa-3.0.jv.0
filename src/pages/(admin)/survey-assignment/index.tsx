// src/app/(pages)/(admin)/survey-assignment/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { api } from "~/trpc/react";
import { Button } from "~/components/shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/shadcn/select";
import { Input } from "~/components/shadcn/input";

export default function SurveyAssignment() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedSurvey, setSelectedSurvey] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [occurrence, setOccurrence] = useState("once");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: surveys, isLoading: surveysLoading } =
    api.survey.getAll.useQuery();
  const { data: participants, isLoading: participantsLoading } =
    api.user.getParticipants.useQuery();
  const assignSurvey = api.survey.assignSurvey.useMutation();

  useEffect(() => {
    if (user && user.role !== "ADMIN" && user.role !== "SOCIAL_WORKER") {
      router.push("/");
    }
  }, [user, router]);

  if (!user || (user.role !== "ADMIN" && user.role !== "SOCIAL_WORKER")) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assignSurvey.mutateAsync({
        surveyId: selectedSurvey,
        userId: selectedParticipant,
        occurrence,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      });
      alert("Survey assigned successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error assigning survey:", error);
      alert("Failed to assign survey. Please try again.");
    }
  };

  if (surveysLoading || participantsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Assign Survey</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="survey">Survey</Label>
          <Select onValueChange={setSelectedSurvey} value={selectedSurvey}>
            <SelectTrigger id="survey">
              <SelectValue placeholder="Select a survey" />
            </SelectTrigger>
            <SelectContent>
              {surveys?.map((survey) => (
                <SelectItem key={survey.id} value={survey.id}>
                  {survey.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="participant">Participant</Label>
          <Select
            onValueChange={setSelectedParticipant}
            value={selectedParticipant}
          >
            <SelectTrigger id="participant">
              <SelectValue placeholder="Select a participant" />
            </SelectTrigger>
            <SelectContent>
              {participants?.map((participant) => (
                <SelectItem key={participant.id} value={participant.id}>
                  {participant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <Button type="submit">Assign Survey</Button>
      </form>
    </div>
  );
}
