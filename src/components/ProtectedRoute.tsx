import React from "react";

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Allow demo/guest access - don't redirect to login
  // Users can still login if they want, but app works without login
  return children;
};
