# MyAmble Developer's Guide: Navigating the Codebase

## Table of Contents

1. Introduction to MyAmble
2. Project Structure and Setup
3. Authentication and User Management
4. Survey Creation and Management
5. Data Analysis and AI Integration
6. API Layer with tRPC
7. Database Management with Drizzle ORM
8. Frontend Components and UI
9. State Management and Hooks
10. Deployment and CI/CD

## Chapter 1: Introduction to MyAmble

Welcome to MyAmble, a cutting-edge platform designed to revolutionize social work research and practice. As a new developer joining our team, this guide will help you navigate the codebase and understand the core concepts behind our application.

MyAmble is built using the T3 stack, which combines Next.js, TypeScript, Tailwind CSS, and tRPC. Our platform empowers social workers and researchers with powerful tools for creating, distributing, and analyzing surveys. We leverage advanced technologies such as AI-powered insights to improve the efficiency and effectiveness of social work research.

Key features of MyAmble include:

- Survey creation and management
- User role management (Admin, Social Worker, Participant)
- Real-time notifications
- Data analysis and visualization
- AI-powered insights
- Secure authentication and authorization

As you dive into the codebase, keep in mind that our application follows best practices for React and Next.js development, including the use of TypeScript for type safety and Tailwind CSS for styling.

## Chapter 2: Project Structure and Setup

To get started with the MyAmble codebase, you'll need to set up your development environment. Here's a step-by-step guide:

1. Clone the repository:

   ```bash
   git clone [repository-url]
   cd myamble
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy the `.env.example` file to `.env.local`
   - Fill in the required values, including database connection strings and API keys

4. Set up the database:

   ```bash
   npm run db:push
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

The project structure follows a typical Next.js application with some additional folders for our specific needs:

- `src/`: Contains the main application code
  - `app/`: Next.js 13+ app directory for pages and routing
  - `components/`: Reusable React components
  - `server/`: Server-side code, including API routes and database logic
  - `lib/`: Utility functions and shared code
  - `styles/`: Global styles and Tailwind CSS configuration
- `public/`: Static assets
- `prisma/`: Database schema and migrations (if using Prisma)

Key configuration files:

- `next.config.mjs`: Next.js configuration
- `tailwind.config.ts`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `package.json`: Project dependencies and scripts

Familiarize yourself with this structure, as it will help you navigate the codebase more efficiently.

## Chapter 3: Authentication and User Management

MyAmble uses NextAuth.js for authentication, providing a secure and flexible solution for user management. The authentication logic is primarily handled in `src/server/auth.ts`.

Key features of our authentication system:

1. JWT-based authentication
2. Support for multiple user roles (Admin, Social Worker, Participant)
3. Email verification
4. Password reset functionality

The `useAuth` hook (`src/hooks/useAuth.ts`) provides a convenient way to access the current user's information and authentication status throughout the application.

To implement role-based access control, we use custom middleware in our tRPC routes. For example:

```typescript
export const enforceUserHasRole = (allowedRoles: UserRole[]) => {
  return t.middleware(({ ctx, next }) => {
    if (
      !ctx.session ||
      !ctx.session.user ||
      !allowedRoles.includes(ctx.session.user.role)
    ) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });
};
```

This middleware is used to protect routes that require specific user roles.

For user management, we have several components and API routes:

- `src/components/auth/`: Contains components for login, signup, and password reset
- `src/app/(pages)/(admin)/user-management/`: Admin interface for managing users
- `src/server/api/routers/userManagement.ts`: API routes for user-related operations

When implementing new features, always consider the authentication state and user roles to ensure proper access control.

## Chapter 4: Survey Creation and Management

Surveys are a core feature of MyAmble. The survey system allows social workers to create, assign, and analyze surveys. Here's an overview of the key components:

1. Survey Creator:
   - Located in `src/components/survey/SurveyBuilder.tsx`
   - Uses the SurveyJS library for a drag-and-drop survey creation interface
   - Saves survey definitions to the database

2. Survey Assignment:
   - Handled in `src/app/(pages)/(admin)/survey-assignment/page.tsx`
   - Allows admins and social workers to assign surveys to participants
   - Supports one-time, daily, weekly, and monthly survey assignments

3. Survey Taking:
   - Implemented in `src/components/survey/TakeSurvey.tsx`
   - Renders surveys for participants to complete
   - Submits responses to the backend

4. Survey Results:
   - Displayed in `src/app/(pages)/(admin)/survey-results/[id]/page.tsx`
   - Shows aggregated results and individual responses
   - Includes data visualization using Recharts

The survey data model is defined in `src/server/db/schema.ts`:

```typescript
export const survey = pgTable("survey", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
  creatorId: text("creatorId").references((): PgColumn => users.id, {
    onDelete: "cascade",
  }),
  data: jsonb("data"),
});
```

API routes for survey-related operations are located in `src/server/api/routers/survey.ts`. These routes handle survey creation, assignment, submission, and retrieval of results.

When working on survey-related features, consider the different user roles and their permissions. Ensure that survey data is properly sanitized and validated before storing or displaying it.

## Chapter 5: Data Analysis and AI Integration

MyAmble leverages AI and data analysis to provide valuable insights from survey data. The main components for this feature are:

1. AI Analysis Page:
   - Located in `src/app/(pages)/ai-analysis/page.tsx`
   - Allows users to interact with an AI assistant for data analysis

2. AI Router:
   - Defined in `src/server/api/routers/aiAnalysis.ts`
   - Handles requests to the AI service (Anthropic's Claude model)

3. Code Interpreter:
   - Uses the `@e2b/code-interpreter` package
   - Allows the AI to execute Python code for data analysis

The AI analysis flow works as follows:

1. User uploads a CSV file or asks a question about existing data
2. The query is sent to the AI model along with any uploaded data
3. The AI generates a response, which may include Python code for analysis
4. If code is present, it's executed using the Code Interpreter
5. Results, including any generated visualizations, are returned to the user

Key considerations when working with the AI and data analysis features:

- Ensure proper error handling for AI requests and code execution
- Implement rate limiting to prevent abuse (currently using Upstash Redis)
- Be mindful of data privacy and security when passing information to the AI model

To extend the AI capabilities, you can modify the system prompt in `src/server/api/routers/aiAnalysis.ts`:

```typescript
const SYSTEM_PROMPT = `
You are an AI assistant specialized in data analysis. You can run Python code to analyze data, create visualizations, and provide insights. Use markdown for formatting your responses.
If a CSV file has been uploaded, you can access it using pandas:
import pandas as pd
df = pd.read_csv('/tmp/uploaded_file.csv')
`;
```

When implementing new data analysis features, consider how they can be integrated with the AI assistant to provide a seamless experience for users.

## Chapter 6: API Layer with tRPC

MyAmble uses tRPC to create a type-safe API layer between the frontend and backend. This approach ensures that API calls are consistent and reduces the likelihood of runtime errors.

Key tRPC files:

- `src/server/api/root.ts`: Defines the main router and combines sub-routers
- `src/server/api/trpc.ts`: Sets up the tRPC context and defines procedure types
- `src/server/api/routers/`: Contains individual routers for different features

To create a new API route:

1. Define a new router in `src/server/api/routers/`
2. Add input validation using Zod
3. Implement the route logic
4. Add the new router to `src/server/api/root.ts`

Example of a tRPC router:

```typescript
export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
});
```

To use tRPC routes in the frontend:

1. Import the `api` object from `src/trpc/react.tsx`
2. Use the `useQuery` or `useMutation` hooks to call the API

Example of using a tRPC route in a React component:

```typescript
const { data, isLoading } = api.example.hello.useQuery({ text: "world" });
```

When working with tRPC:

- Leverage TypeScript inference for type-safe API calls
- Use input validation to ensure data integrity
- Implement proper error handling on both the server and client sides

## Chapter 7: Database Management with Drizzle ORM

MyAmble uses Drizzle ORM for database management, providing a type-safe and efficient way to interact with the PostgreSQL database.

Key files for database management:

- `src/server/db/index.ts`: Database connection setup
- `src/server/db/schema.ts`: Database schema definition
- `drizzle.config.ts`: Drizzle configuration file

To define a new table or modify an existing one:

1. Update the schema in `src/server/db/schema.ts`
2. Run `npm run db:push` to apply the changes to the database

Example of defining a table with Drizzle:

```typescript
export const users = pgTable("user", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  role: roleEnum("role").default(UserRoleEnum.PARTICIPANT),
  hashedPassword: text("hashedPassword"),
});
```

To query the database:

1. Import the `db` object from `src/server/db/index.ts`
2. Use Drizzle's query builder to construct your query

Example of a database query:

```typescript
const user = await db.query.users.findFirst({
  where: eq(users.email, input.email),
});
```

When working with the database:

- Use transactions for operations that involve multiple tables
- Implement proper error handling for database operations
- Be mindful of performance, especially for complex queries
- Use indexes to optimize frequently accessed columns

## Chapter 8: Frontend Components and UI

MyAmble uses a combination of custom components and UI libraries to create a consistent and responsive user interface. The main UI library is shadcn/ui, which provides a set of accessible and customizable components.

Key directories for frontend components:

- `src/components/ui/`: Contains base UI components
- `src/components/`: Contains feature-specific components

To create a new component:

1. Create a new file in the appropriate directory
2. Import necessary UI components and hooks
3. Implement the component logic
4. Export the component for use in other parts of the application

Example of a custom component:

```typescript
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <div className="flex space-x-2">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <Button onClick={handleSearch}>Search</Button>
    </div>
  );
}
```

For styling, MyAmble uses Tailwind CSS. The main configuration file is `tailwind.config.ts`. When adding new styles:

- Use Tailwind classes for consistency
- Create custom classes in `src/styles/globals.css` for reusable styles
- Use the `cn` utility function from `src/lib/utils.ts` to conditionally apply classes

When working on the frontend:

- Ensure components are responsive and accessible
- Use TypeScript for prop type definitions
- Implement proper error handling and loading states
- Consider code splitting and lazy loading for performance optimization

## Chapter 9: State Management and Hooks

MyAmble primarily uses React's built-in state management solutions, including the Context API and custom hooks. For more complex state management, we use React Query (via tRPC) for server state.

Key custom hooks:

- `useAuth`: Provides authentication state and methods
- `useSSE`: Manages server-sent events for real-time notifications

To create a new custom hook:

1. Create a new file in `src/hooks/`
2. Implement the hook logic using React hooks
3. Export the hook for use in components

Example of a custom hook:

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

For global state management, consider using the Context API:

1. Create a new context in a separate file
2. Implement a provider component that manages the state
3. Use the `useContext` hook to access the state in child components

Example of using the Context API:

```typescript
// ThemeContext.tsx
const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
```

When working with state management:

- Use local state for component-specific data
- Leverage custom hooks for reusable stateful logic
- Use the Context API for global state that doesn't require frequent updates
- Rely on React Query (via tRPC) for server state management

## Chapter 10: Deployment and CI/CD

MyAmble uses a continuous integration and deployment (CI/CD) pipeline to ensure code quality and streamline the deployment process. The application is deployed on Vercel, which provides seamless integration with GitHub and automatic deployments.

Key aspects of the deployment process:

1. Version Control: We use Git for version control, with the main repository hosted on GitHub.
2. Continuous Integration: GitHub Actions are used to run tests and linting on every pull request.
3. Continuous Deployment: Vercel automatically deploys the application when changes are pushed to the main branch.

To deploy the application:

1. Ensure all changes are committed and pushed to the main branch
2. Vercel will automatically trigger a new deployment
3. Monitor the deployment progress in the Vercel dashboard

For local development and testing:

1. Use the `.env.local` file for environment variables
2. Run `npm run dev` to start the development server
3. Use `npm run build` followed by `npm run start` to test a production build locally

To set up a new environment (e.g., staging):

1. Create a new project in Vercel
2. Configure environment variables in the Vercel dashboard
3. Set up a new branch (e.g., `staging`) and configure automatic deployments

Our CI/CD pipeline includes the following steps:

1. Linting: `npm run lint`
2. Type checking: `tsc --noEmit`
3. Building: `npm run build`
4. Testing: `npm run test` (Note: Implement tests as needed)

To add or modify CI/CD steps:

1. Update the `.github/workflows/ci.yml` file for GitHub Actions
2. Modify the Vercel project settings for deployment-specific configurations

Best practices for deployment:

- Use feature flags for gradual rollouts of new features
- Implement proper error logging and monitoring (e.g., Sentry)
- Regularly review and update dependencies
- Perform database migrations carefully, considering backward compatibility

When working on deployment and CI/CD:

- Ensure all environment variables are properly set in Vercel
- Test thoroughly in a staging environment before deploying to production
- Monitor application performance and errors after deployment
- Document any changes to the deployment process in the project README

## Conclusion

Congratulations! You've now been introduced to the key aspects of the MyAmble codebase. This documentation should serve as a comprehensive guide to help you navigate the project structure, understand core concepts, and contribute effectively to the development process.

As you work on MyAmble, keep the following principles in mind:

1. Code Quality: Write clean, readable, and well-documented code. Follow the established patterns in the existing codebase.

2. Type Safety: Leverage TypeScript to its fullest extent, ensuring type safety across the application.

3. Performance: Consider the performance implications of your changes, especially when dealing with large datasets or complex operations.

4. Security: Always validate user input, implement proper authentication and authorization checks, and follow security best practices.

5. Accessibility: Ensure that new features and components are accessible to all users.

6. Testing: Write unit tests for critical functionality and consider implementing integration and end-to-end tests as the application grows.

7. Documentation: Keep this guide and other documentation up-to-date as you make significant changes or add new features.

Remember that software development is a collaborative effort. Don't hesitate to ask questions, seek code reviews, and contribute to improving the development process.

As you become more familiar with the codebase, consider exploring advanced topics such as:

- Implementing real-time features using WebSockets
- Enhancing the AI capabilities with more sophisticated analysis techniques
- Optimizing database queries and implementing caching strategies
- Expanding the survey capabilities with more question types and logic
- Implementing a comprehensive analytics dashboard for admins and researchers

Welcome to the MyAmble team! Your contributions will help shape the future of social work research and practice. Happy coding!
