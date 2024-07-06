import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.min.css";
import { useAuth } from "~/hooks/useAuth";
import { api } from "~/trpc/react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Spinner } from "~/components/ui/spinner";

export default function TakeSurvey() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [surveyJson, setSurveyJson] = useState(null);
  const [error, setError] = useState(null);

  const {
    data: surveyData,
    isLoading,
    isError,
  } = api.survey.getById.useQuery({ id });
  const submitSurvey = api.survey.submitSurvey.useMutation();

  useEffect(() => {
    if (surveyData) {
      setSurveyJson(surveyData.data);
    }
  }, [surveyData]);

  useEffect(() => {
    if (isError) {
      setError("Failed to load survey. Please try again later.");
    }
  }, [isError]);

  if (!user) {
    router.push("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!surveyJson) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Survey not found</AlertDescription>
      </Alert>
    );
  }

  const onComplete = async (survey) => {
    try {
      await submitSurvey.mutateAsync({
        surveyId: id,
        data: survey.data,
        status: "completed",
      });
      alert("Survey submitted successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error submitting survey:", error);
      setError("Failed to submit survey. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">{surveyData.name}</h1>
      <Survey json={surveyJson} onComplete={onComplete} />
    </div>
  );
}
