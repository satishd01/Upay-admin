// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

// Recharts components
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Data
import { useEffect, useState } from "react";

// Custom colors
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalOrders: 0,
    ordersThisMonth: 0,
    totalRevenue: 0,
    revenueThisMonth: 0,
    totalWalletTransactions: 0,
    walletCredits: 0,
    walletDebits: 0,
    totalUpiPayments: 0,
  });

  const [loading, setLoading] = useState(true);

  // Prepare chart data
  const paymentMethodData = () => {
    return [
      { name: "Wallet", value: dashboardData.totalWalletTransactions },
      { name: "UPI", value: dashboardData.totalUpiPayments },
    ];
  };

  const walletActivityData = () => {
    return [
      { name: "Credits", value: dashboardData.walletCredits },
      { name: "Debits", value: dashboardData.walletDebits },
    ];
  };

  // Fetch API Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await fetch("https://egrecharge.shellcode.website/api/admin/dashboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3} textAlign="center">
          Loading dashboard data...
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Summary Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <MDBox
              mb={1.5}
              sx={{
                "&:hover": {
                  transform: "translateY(-5px)",
                  transition: "transform 0.3s ease-in-out",
                },
              }}
            >
              <ComplexStatisticsCard
                color="info"
                icon="people"
                title="Total Users"
                count={dashboardData.totalUsers}
                percentage={{
                  color: "success",
                  amount: dashboardData.newUsersThisMonth,
                  label: `New this month`,
                }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={4}>
            <MDBox
              mb={1.5}
              sx={{
                "&:hover": {
                  transform: "translateY(-5px)",
                  transition: "transform 0.3s ease-in-out",
                },
              }}
            >
              <ComplexStatisticsCard
                color="success"
                icon="confirmation_number"
                title="Total Orders"
                count={dashboardData.totalOrders}
                percentage={{
                  color: dashboardData.ordersThisMonth > 0 ? "success" : "error",
                  amount: dashboardData.ordersThisMonth,
                  label: `This month`,
                }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={4}>
            <MDBox
              mb={1.5}
              sx={{
                "&:hover": {
                  transform: "translateY(-5px)",
                  transition: "transform 0.3s ease-in-out",
                },
              }}
            >
              <ComplexStatisticsCard
                color="warning"
                icon="account_balance_wallet"
                title="Total Revenue"
                count={`₹${dashboardData.totalRevenue}`}
                percentage={{
                  color: dashboardData.revenueThisMonth > 0 ? "success" : "error",
                  amount: dashboardData.revenueThisMonth
                    ? `₹${dashboardData.revenueThisMonth}`
                    : "₹0",
                  label: `This month`,
                }}
              />
            </MDBox>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} mb={4}>
          {/* Payment Methods Pie Chart */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", p: 2, "&:hover": { boxShadow: 3 } }}>
              <MDBox mb={2}>
                <MDTypography variant="h6">Payment Methods</MDTypography>
              </MDBox>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentMethodData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} transactions`, "Count"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Wallet Activity */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", p: 2, "&:hover": { boxShadow: 3 } }}>
              <MDBox mb={2}>
                <MDTypography variant="h6">Wallet Activity</MDTypography>
              </MDBox>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: "Wallet",
                      credits: dashboardData.walletCredits,
                      debits: dashboardData.walletDebits,
                    },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      return [`₹${value}`, name === "credits" ? "Credits" : "Debits"];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="credits" fill="#82ca9d" name="Credits" />
                  <Bar dataKey="debits" fill="#ff8042" name="Debits" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Transactions Table - Removed as not in new API */}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
