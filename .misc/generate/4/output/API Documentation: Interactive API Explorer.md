```typescript
// InteractiveAPIExplorer.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const InteractiveAPIExplorer: React.FC = () => {
  const [apiSpec, setApiSpec] = useState<any>(null);

  useEffect(() => {
    const fetchApiSpec = async () => {
      try {
        const response = await axios.get('/api-docs');
        setApiSpec(response.data);
      } catch (error) {
        console.error('Failed to fetch API specification:', error);
      }
    };

    fetchApiSpec();
  }, []);

  return (
    <div>
      <h2>Interactive API Explorer</h2>
      {apiSpec ? (
        <SwaggerUI spec={apiSpec} />
      ) : (
        <p>Loading API specification...</p>
      )}
    </div>
  );
};

export default InteractiveAPIExplorer;
```

**Prompt Details:**

1. **Requirements**: Create an interactive API explorer for developers to test API endpoints.

2. **Dependencies**: This task depends on the successful completion of the "API Documentation: Automated Docs Generation" task, which should provide an OpenAPI specification for the application's API.

3. **Implementation**:
   - Use the `swagger-ui-react` library to render an interactive API explorer based on the OpenAPI specification.
   - Create a React component `InteractiveAPIExplorer` that fetches the API specification from the `/api-docs` endpoint and renders the Swagger UI.
   - Use the `useEffect` hook to fetch the API specification when the component mounts.
   - Render a loading message while the API specification is being fetched.
   - Once the API specification is fetched, render the Swagger UI with the `SwaggerUI` component and pass the specification as a prop.

4. **Error Handling and Logging**:
   - Implement error handling for the API specification fetch request.
   - Log any errors that occur during the fetch request using `console.error`.

5. **Documentation**:
   - Document the purpose and usage of the `InteractiveAPIExplorer` component in the component file itself.
   - Provide clear instructions on how to access and use the interactive API explorer in the project's developer documentation.

6. **Considerations**:
   - Ensure that the API specification is up-to-date and accurately reflects the current state of the API.
   - Consider adding authentication and authorization mechanisms if necessary for accessing the API explorer.
   - Provide clear instructions on how to set up and run the interactive API explorer during development and testing.

By implementing this interactive API explorer, developers will have a user-friendly interface to explore and test the application's API endpoints, making it easier to understand and interact with the API during development and testing.