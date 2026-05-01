import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProblemDetail } from "./pages/ProblemDetail";
import { Problems } from "./pages/Problems";
import { Profile } from "./pages/Profile";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from "./api/queryClient";
import { OAuthReturn } from "./pages/OAuthReturn";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/oauth-return" element={<OAuthReturn />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/" element={<Problems />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
