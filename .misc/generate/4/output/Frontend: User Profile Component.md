Sure, here's a detailed prompt for the User Profile component in the React frontend:

```tsx
// UserProfile.tsx

/**
 * Requirements:
 * - Display the user's email and role
 * - Allow the user to update their email and password
 * - Validate form inputs (email format, password length)
 * - Show success/error messages for profile update
 * - Implement loading state while updating profile
 *
 * Dependencies:
 * - React, React Router
 * - Redux (for state management)
 * - Axios (for API calls)
 * - react-hook-form (for form handling and validation)
 *
 * Props:
 * - user: User (the current user object from Redux store)
 * - updateUserProfile: Function (action creator for updating user profile)
 *
 * Returns:
 * A React component that renders the user profile section with email, role, and a form to update the profile.
 *
 * Example Usage:
 * <UserProfile
 *   user={currentUser}
 *   updateUserProfile={updateUserProfileAction}
 * />
 *
 * Considerations:
 * - Accessibility: Ensure proper labeling, keyboard navigation, and screen reader support
 * - Internationalization (i18n): Support for multiple languages in form labels and messages
 * - Error handling: Display user-friendly error messages for failed API calls
 * - Security: Prevent cross-site scripting (XSS) and other security vulnerabilities
 * - Performance: Optimize component rendering and avoid unnecessary re-renders
 *
 * Best Practices:
 * - Use functional components and React hooks
 * - Separate container and presentational components
 * - Follow the principle of single responsibility
 * - Write modular and reusable code
 * - Use TypeScript for type safety
 * - Follow the project's coding style and conventions
 *
 * Example Implementation:
 *
 * // UserProfile.tsx
 * import React, { useState } from 'react';
 * import { useForm } from 'react-hook-form';
 * import { useDispatch, useSelector } from 'react-redux';
 * import { updateUserProfile } from '../redux/actions/userActions';
 * import { RootState } from '../redux/store';
 *
 * interface UserProfileProps {
 *   user: User;
 *   updateUserProfile: (userData: UserData) => void;
 * }
 *
 * const UserProfile: React.FC<UserProfileProps> = ({ user, updateUserProfile }) => {
 *   const { register, handleSubmit, formState: { errors } } = useForm();
 *   const [isLoading, setIsLoading] = useState(false);
 *   const [updateSuccess, setUpdateSuccess] = useState(false);
 *   const [updateError, setUpdateError] = useState('');
 *   const dispatch = useDispatch();
 *
 *   const onSubmit = async (data: UserData) => {
 *     setIsLoading(true);
 *     setUpdateSuccess(false);
 *     setUpdateError('');
 *
 *     try {
 *       await dispatch(updateUserProfile(data));
 *       setUpdateSuccess(true);
 *     } catch (error) {
 *       setUpdateError('Failed to update profile');
 *     } finally {
 *       setIsLoading(false);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <h2>User Profile</h2>
 *       <p>Email: {user.email}</p>
 *       <p>Role: {user.role}</p>
 *
 *       <form onSubmit={handleSubmit(onSubmit)}>
 *         <label>
 *           Email:
 *           <input
 *             type="email"
 *             {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
 *           />
 *           {errors.email && <span>Please enter a valid email address</span>}
 *         </label>
 *
 *         <label>
 *           New Password:
 *           <input
 *             type="password"
 *             {...register('password', { minLength: 8 })}
 *           />
 *           {errors.password && <span>Password must be at least 8 characters</span>}
 *         </label>
 *
 *         <button type="submit" disabled={isLoading}>
 *           {isLoading ? 'Updating...' : 'Update Profile'}
 *         </button>
 *       </form>
 *
 *       {updateSuccess && <p>Profile updated successfully</p>}
 *       {updateError && <p>{updateError}</p>}
 *     </div>
 *   );
 * };
 *
 * export default UserProfile;
 */
```

This prompt covers the implementation of the `UserProfile` component in the React frontend. It includes the following:

1. **Requirements**: A clear list of requirements for the component, such as displaying user information, allowing profile updates, form validation, and showing success/error messages.

2. **Dependencies**: A list of required dependencies, including React, Redux, Axios, and react-hook-form.

3. **Props**: A description of the component's props, including the user object and the action creator for updating the user profile.

4. **Returns**: A description of what the component returns (a React component that renders the user profile section).

5. **Example Usage**: An example of how to use the component in other parts of the application.

6. **Considerations**: Important considerations for the component, such as accessibility, internationalization, error handling, security, and performance.

7. **Best Practices**: A list of best practices to follow when implementing the component, such as using functional components, separating concerns, writing modular and reusable code, and using TypeScript.

8. **Example Implementation**: A basic implementation of the `UserProfile` component, including form handling, validation, and state management using React hooks and Redux.

This prompt provides a comprehensive guide for implementing the User Profile component, covering all aspects of its functionality, dependencies, best practices, and considerations. It also includes an example implementation to serve as a starting point for the development team.