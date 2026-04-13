import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
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

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
