import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import PersonnelDashboard from "./pages/PersonnelDashboard";
import MembersPage from "./pages/MembersPage";
import MemberRolesPage from "./pages/MemberRolesPage";
import SettingsPage from "./pages/SettingsPage";
import MeetingsPage from "./pages/MeetingsPage";
import RegulationsPage from "./pages/RegulationsPage";
import PublicMembers from "./pages/PublicMembers";
import PublicMeetings from "./pages/PublicMeetings";
import { useAuth } from "@/_core/hooks/useAuth";

function AdminRouter() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path={"/admin"} component={AdminDashboard} />
        <Route path="/admin/members" component={MembersPage} />
        <Route path="/admin/member-roles" component={MemberRolesPage} />
      <Route path="/admin/personnel-dashboard" component={PersonnelDashboard} />
        <Route path="/admin/settings" component={SettingsPage} />
        <Route path="/admin/meetings" component={MeetingsPage} />
        <Route path={"/admin/regulations"} component={RegulationsPage} />
        {/* Additional admin routes will be added here */}
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function Router() {
  const { user } = useAuth();

  // If user is authenticated, show admin routes
  if (user) {
    return <AdminRouter />;
  }

  // Otherwise show public routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/public/members"} component={PublicMembers} />
      <Route path={"/public/meetings"} component={PublicMeetings} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

