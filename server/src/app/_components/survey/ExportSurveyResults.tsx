// src/components/ExportSurveyResults.tsx
import React, { useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";

interface ExportSurveyResultsProps {
  surveyId: string;
  questions: string[];
}

export const ExportSurveyResults: React.FC<ExportSurveyResultsProps> = ({
  surveyId,
  questions,
}) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedStrata, setSelectedStrata] = useState<string[]>([]);

  const exportMutation = api.survey.exportSurveyResults.useMutation();

  const handleColumnChange = (question: string) => {
    setSelectedColumns((prev) =>
      prev.includes(question)
        ? prev.filter((q) => q !== question)
        : [...prev, question],
    );
  };

  const handleStrataChange = (stratum: string) => {
    setSelectedStrata((prev) =>
      prev.includes(stratum)
        ? prev.filter((s) => s !== stratum)
        : [...prev, stratum],
    );
  };

  const handleExport = async () => {
    try {
      const result = await exportMutation.mutateAsync({
        surveyId,
        columns: selectedColumns,
        strata: selectedStrata,
      });

      // Create a Blob from the base64 string
      const byteCharacters = atob(result.fileContent);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a link element and trigger the download
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting survey results:", error);
      alert("Failed to export survey results. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Export Survey Results</h3>
      <div>
        <h4 className="mb-2 font-medium">Select Columns</h4>
        {questions.map((question) => (
          <div key={question} className="flex items-center space-x-2">
            <Checkbox
              id={`column-${question}`}
              checked={selectedColumns.includes(question)}
              onCheckedChange={() => handleColumnChange(question)}
            />
            <Label htmlFor={`column-${question}`}>{question}</Label>
          </div>
        ))}
      </div>
      <div>
        <h4 className="mb-2 font-medium">Select Strata</h4>
        {["age", "gender", "location"].map((stratum) => (
          <div key={stratum} className="flex items-center space-x-2">
            <Checkbox
              id={`stratum-${stratum}`}
              checked={selectedStrata.includes(stratum)}
              onCheckedChange={() => handleStrataChange(stratum)}
            />
            <Label htmlFor={`stratum-${stratum}`}>{stratum}</Label>
          </div>
        ))}
      </div>
      <Button onClick={handleExport} disabled={selectedColumns.length === 0}>
        Export to Excel
      </Button>
    </div>
  );
};
