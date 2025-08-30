// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import SignIn from "layouts/authentication/sign-in";
// @mui icons
import Icon from "@mui/material/Icon";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import GroupIcon from "@mui/icons-material/Group";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PaymentIcon from "@mui/icons-material/Payment";

import Users from "layouts/tables/users";
import Orders from "layouts/tables/orders";
import ReportDownload from "layouts/tables/report";
import Commissions from "layouts/tables/commition";
import AnalyticsComp from "layouts/tables/analytics";

// Define routes
const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <DashboardIcon fontSize="small" />,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Analytics",
    key: "Analytics",
    icon: <DashboardIcon fontSize="small" />,
    route: "/Analytics",
    component: <AnalyticsComp />,
  },
  {
    type: "collapse",
    name: "User",
    key: "User",
    icon: <PeopleIcon fontSize="small" />,
    route: "/user",
    component: <Users />,
  },
  {
    type: "collapse",
    name: "Commissions",
    key: "Commissions",
    icon: <PeopleIcon fontSize="small" />,
    route: "/Commissions",
    component: <Commissions />,
  },
  {
    type: "collapse",
    name: "Order",
    key: "Order",
    icon: <PeopleIcon fontSize="small" />,
    route: "/order",
    component: <Orders />,
  },
  {
    type: "collapse",
    name: "Report",
    key: "Report",
    icon: <PeopleIcon fontSize="small" />,
    route: "/report",
    component: <ReportDownload />,
  },
  {
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
];

export default routes;
