import { useLocation } from "react-router-dom";
import LocalServicePage from "../components/LocalServicePage";
import { LOCAL_SERVICE_CONFIGS } from "../lib/localServiceConfigs";
import HomePage from "./HomePage";

/**
 * LocalServiceRoute — single route component that resolves the current pathname
 * (e.g. /microcement-metairie) to a config in LOCAL_SERVICE_CONFIGS and renders
 * LocalServicePage. Falls back to the homepage if no config matches.
 *
 * Routes are wired as explicit paths in App.js (not param routes) so React Router
 * doesn't accidentally swallow /upload, /admin etc. We therefore derive the slug
 * from location.pathname rather than useParams().
 */
export default function LocalServiceRoute() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\//, "").replace(/\/$/, "");
  const config = LOCAL_SERVICE_CONFIGS[slug];
  if (!config) return <HomePage />;
  return <LocalServicePage config={config} />;
}
