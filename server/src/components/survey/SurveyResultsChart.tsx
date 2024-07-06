import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SurveyResultsChartProps {
  data: {
    question: string;
    responses: number;
  }[];
}

export default function SurveyResultsChart({ data }: SurveyResultsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="question" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="responses" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
