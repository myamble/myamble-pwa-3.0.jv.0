import { useState } from "react";
import { SurveyCreatorComponent, SurveyCreator } from "survey-creator-react";
import "survey-core/defaultV2.min.css";
import "survey-creator-core/survey-creator-core.min.css";
import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";

export default function SurveyBuilder() {
  const [creator] = useState(() => new SurveyCreator());
  const createSurveyMutation = api.survey.create.useMutation();

  const saveSurvey = async () => {
    const surveyJson = creator.JSON;
    try {
      await createSurveyMutation.mutateAsync({
        title: surveyJson.title,
        description: surveyJson.description,
        data: surveyJson,
      });
      console.log("Survey saved successfully");
    } catch (error) {
      console.error("Error saving survey:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Survey Builder</h1>
      <SurveyCreatorComponent creator={creator} />
      <Button onClick={saveSurvey} className="mt-4">
        Save Survey
      </Button>
    </div>
  );
}
