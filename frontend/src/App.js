import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./lib/AuthContext";
import { LeadGenWidgets } from "./components/LeadGenWidgets";
import { CustomCursor } from "./components/cinematic";
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";
import AnalysisPage from "./pages/AnalysisPage";
import ResultsPage from "./pages/ResultsPage";
import ContractorLoginPage from "./pages/ContractorLoginPage";
import ContractorRegisterPage from "./pages/ContractorRegisterPage";
import ContractorDashboardPage from "./pages/ContractorDashboardPage";
import AdminPage from "./pages/AdminPage";
import SharePage from "./pages/SharePage";
import PortfolioPage from "./pages/PortfolioPage";
import LocalServiceRoute from "./pages/LocalServiceRoute";
import BlogIndexPage from "./pages/BlogIndexPage";
import BlogPostPage from "./pages/BlogPostPage";
import AboutPage from "./pages/AboutPage";
import ViewTubeLandingPage from "./pages/ViewTubeLandingPage";
import ViewTubeSetupPage from "./pages/ViewTubeSetupPage";
import ViewTubeWatchPage from "./pages/ViewTubeWatchPage";
import ViewTubeShowPage from "./pages/ViewTubeShowPage";

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" richColors />
          <CustomCursor />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/analysis/:projectId" element={<AnalysisPage />} />
            <Route path="/results/:projectId" element={<ResultsPage />} />
            <Route path="/contractor/login" element={<ContractorLoginPage />} />
            <Route path="/contractor/register" element={<ContractorRegisterPage />} />
            <Route path="/contractor/dashboard" element={<ContractorDashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/share/:shareId" element={<SharePage />} />

            {/* Local-SEO landing pages (all five share the LocalServiceRoute → LocalServicePage template) */}
            <Route path="/microcement-new-orleans" element={<LocalServiceRoute />} />
            <Route path="/microcement-metairie" element={<LocalServiceRoute />} />
            <Route path="/tadelakt-new-orleans" element={<LocalServiceRoute />} />
            <Route path="/rockscape-walls-new-orleans" element={<LocalServiceRoute />} />
            <Route path="/pool-deck-resurfacing-new-orleans" element={<LocalServiceRoute />} />

            {/* Neighborhood handyman micro-pages — long-tail local SEO */}
            <Route path="/lakeview-handyman" element={<LocalServiceRoute />} />
            <Route path="/uptown-handyman" element={<LocalServiceRoute />} />
            <Route path="/mid-city-handyman" element={<LocalServiceRoute />} />
            <Route path="/bywater-handyman" element={<LocalServiceRoute />} />
            <Route path="/french-quarter-handyman" element={<LocalServiceRoute />} />
            <Route path="/garden-district-handyman" element={<LocalServiceRoute />} />

            {/* Blog */}
            <Route path="/blog" element={<BlogIndexPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />

            {/* About */}
            <Route path="/about" element={<AboutPage />} />

            {/* viewTube — live camera DIY coach */}
            <Route path="/viewtube" element={<ViewTubeLandingPage />} />
            <Route path="/viewtube/show" element={<ViewTubeShowPage />} />
            <Route path="/viewtube-show.html" element={<ViewTubeShowPage />} />
            <Route path="/viewtube/setup" element={<ViewTubeSetupPage />} />
            <Route path="/viewtube/watch/:sessionId" element={<ViewTubeWatchPage />} />
          </Routes>
          <LeadGenWidgets />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
