```tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { AnalysisChart, AIQueryInput } from '../components';
import { analyzeData, generateVisualization } from '../api/analytics';
import { AnalysisResult, Visualization } from '../types';

interface AnalysisDashboardProps {
  surveyId: string;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ surveyId }) => {
  const [query, setQuery] = useState('');
  const [visualizationType, setVisualizationType] = useState<'bar' | 'pie' | 'line' | 'scatter'>('bar');
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: analysisResults, isLoading: isLoadingAnalysis, error: analysisError } = useQuery<AnalysisResult>(
    ['analysis', surveyId],
    () => analyzeData(surveyId)
  );

  const visualizationMutation = useMutation<Visualization, Error, { surveyId: string; query: string; visualizationType: string }>(
    ({ surveyId, query, visualizationType }) => generateVisualization(surveyId, query, visualizationType)
  );

  const handleQuerySubmit = () => {
    visualizationMutation.mutate({ surveyId, query, visualizationType });
  };

  if (isLoadingAnalysis) return <div>Loading analysis...</div>;
  if (analysisError) return <div>Error loading analysis: {analysisError.message}</div>;

  return (
    <div className="analysis-dashboard">
      <h2>Survey Analysis</h2>
      <div className="query-input">
        <AIQueryInput
          value={query}
          onChange={setQuery}
          onSubmit={handleQuerySubmit}
        />
        <select
          value={visualizationType}
          onChange={(e) => setVisualizationType(e.target.value as 'bar' | 'pie' | 'line' | 'scatter')}
        >
          <option value="bar">Bar Chart</option>
          <option value="pie">Pie Chart</option>
          <option value="line">Line Chart</option>
          <option value="scatter">Scatter Plot</option>
        </select>
      </div>
      {analysisResults && (
        <div className="analysis-results">
          <AnalysisChart data={analysisResults.chartData} />
          <p>{analysisResults.summary}</p>
        </div>
      )}
      {visualizationMutation.isSuccess && (
        <div className="visualization">
          {visualizationMutation.data.type === 'image' && (
            <img src={visualizationMutation.data.data} alt="AI-generated visualization" />
          )}
          {visualizationMutation.data.type === 'svg' && (
            <div dangerouslySetInnerHTML={{ __html: visualizationMutation.data.data }} />
          )}
          {visualizationMutation.data.type === 'config' && (
            <VisualizationComponent config={visualizationMutation.data.data} />
          )}
        </div>
      )}
      {visualizationMutation.isError && (
        <div className="error">Error generating visualization: {visualizationMutation.error.message}</div>
      )}
    </div>
  );
};

export default AnalysisDashboard;
```

**Prompt Explanation:**

1. **Import Dependencies**: Import the required dependencies, including React, react-query for data fetching and caching, react-redux for accessing the global state, and custom components and API functions.

2. **Component Definition**: Define the `AnalysisDashboard` functional component that takes a `surveyId` prop.

3. **State Management**: Use the `useState` hook to manage the component's local state, including the `query` string and the `visualizationType` (bar, pie, line, or scatter).

4. **Access User Data**: Use the `useSelector` hook from react-redux to access the authenticated user's data from the global state.

5. **Fetch Analysis Results**: Use the `useQuery` hook from react-query to fetch the analysis results for the given `surveyId`. The `analyzeData` function is responsible for fetching the data from the backend.

6. **Mutation for Visualization Generation**: Use the `useMutation` hook from react-query to handle the visualization generation process. The `generateVisualization` function is responsible for sending the request to the backend with the `surveyId`, `query`, and `visualizationType`.

7. **Event Handlers**: Define the `handleQuerySubmit` function to trigger the visualization generation mutation when the user submits the query.

8. **Rendering**: Render the component based on the loading state, error state, and the availability of analysis results and visualization data.

9. **Analysis Results**: If analysis results are available, render the `AnalysisChart` component with the chart data and display the summary text.

10. **Visualization Selection**: Render a dropdown menu to allow the user to select the desired visualization type (bar, pie, line, or scatter).

11. **Visualization Rendering**: If the visualization mutation is successful, render the visualization based on the returned data type:
    - If the data type is 'image', render an `img` element with the image data.
    - If the data type is 'svg', render the SVG data by setting the `dangerouslySetInnerHTML` prop.
    - If the data type is 'config', render a custom `VisualizationComponent` with the configuration data.

12. **Error Handling**: If there is an error fetching the analysis results or generating the visualization, display an error message.

**Considerations:**

- **Input Validation**: Ensure that the `surveyId` prop is properly validated and sanitized to prevent security vulnerabilities.

- **Permissions**: Implement proper role-based access control (RBAC) to ensure that only authorized users can access and view the analysis dashboard.

- **Accessibility (a11y)**: Ensure that the component is accessible by following best practices for keyboard navigation, screen reader support, and proper labeling.

- **Internationalization (i18n)**: If the application supports multiple languages, implement internationalization for the component's text content and labels.

- **Error Handling**: Implement comprehensive error handling and logging for potential failures during data fetching, analysis, or visualization generation.

- **Performance Optimization**: Implement performance optimizations, such as code splitting, memoization, and virtualization, if the component becomes computationally expensive or renders large amounts of data.

- **Testing**: Write unit tests and integration tests for the component to ensure its functionality and reliability.

- **Documentation**: Document the component's props, state, and behavior for other developers to understand and maintain the codebase.

By following this prompt, you can implement the `AnalysisDashboard` component, which provides a user interface for displaying survey analysis results, allowing users to query the data using natural language, and generating visualizations based on the selected type. This component integrates with the backend analytics services and leverages react-query for efficient data fetching and caching.