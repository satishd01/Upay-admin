import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Card,
  CircularProgress,
  Grid,
  Alert,
  TextField,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  TableContainer,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Recharts components
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const BASE_URL = "https://egrecharge.shellcode.website";

// Custom colors
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const AnalyticsComp = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    providerCode: "",
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      params.append("year", filters.year);
      params.append("month", filters.month);
      if (filters.providerCode) {
        params.append("providerCode", filters.providerCode);
      }

      const response = await fetch(`${BASE_URL}/api/analytics/providers?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data.analytics);
      } else {
        throw new Error(data.message || "No analytics data found");
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err.message || "Error loading analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Prepare chart data
  const prepareDailyChartData = () => {
    if (!analyticsData.length || !analyticsData[0].dailyStats) return [];

    return analyticsData[0].dailyStats.map((stat) => ({
      date: new Date(stat.date).toLocaleDateString(),
      orders: stat.totalOrders,
      amount: stat.totalAmount,
      commission: parseFloat(stat.totalCommission),
      platformCommission: parseFloat(stat.totalPlatformCommission),
    }));
  };

  const prepareSummaryData = () => {
    if (!analyticsData.length) return [];

    return [
      {
        name: "Total",
        orders: analyticsData[0].totalOrders,
        amount: analyticsData[0].totalAmount,
        commission: analyticsData[0].totalCommission,
        platformCommission: analyticsData[0].totalPlatformCommission,
      },
    ];
  };

  const prepareCommissionPieData = () => {
    if (!analyticsData.length) return [];

    return [
      { name: "Provider Commission", value: parseFloat(analyticsData[0].totalCommission) },
      { name: "Platform Commission", value: parseFloat(analyticsData[0].totalPlatformCommission) },
    ];
  };

  const columns = [
    { Header: "Date", accessor: "date" },
    {
      Header: "Orders",
      accessor: "totalOrders",
      propTypes: {
        value: PropTypes.number.isRequired,
      },
    },
    {
      Header: "Amount (₹)",
      accessor: "totalAmount",
      Cell: ({ value }) => `₹${value}`,
      propTypes: {
        value: PropTypes.number.isRequired,
      },
    },
    {
      Header: "Commission (₹)",
      accessor: "totalCommission",
      Cell: ({ value }) => `₹${parseFloat(value).toFixed(2)}`,
      propTypes: {
        value: PropTypes.string.isRequired,
      },
    },
    {
      Header: "Platform Commission (₹)",
      accessor: "totalPlatformCommission",
      Cell: ({ value }) => `₹${parseFloat(value).toFixed(2)}`,
      propTypes: {
        value: PropTypes.string.isRequired,
      },
    },
  ];

  const dailyStats = analyticsData.length > 0 ? analyticsData[0].dailyStats : [];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="white"
                borderRadius="lg"
                coloredShadow="info"
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <MDTypography variant="h6" color="black">
                      Provider Analytics
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Year"
                      type="number"
                      value={filters.year}
                      onChange={(e) => handleFilterChange("year", e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Month</InputLabel>
                      <Select
                        value={filters.month}
                        label="Month"
                        onChange={(e) => handleFilterChange("month", e.target.value)}
                        sx={{ width: 200, height: 40 }}
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <MenuItem key={i + 1} value={i + 1}>
                            {new Date(2023, i).toLocaleString("default", { month: "long" })}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Provider Code"
                      value={filters.providerCode}
                      onChange={(e) => handleFilterChange("providerCode", e.target.value)}
                      size="small"
                      placeholder="e.g., AT"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDBox display="flex" justifyContent="flex-end">
                      <SearchIcon
                        color="primary"
                        sx={{ cursor: "pointer", mt: 1 }}
                        onClick={fetchAnalytics}
                      />
                    </MDBox>
                  </Grid>
                </Grid>
              </MDBox>

              <MDBox p={3}>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : analyticsData.length === 0 ? (
                  <Alert severity="info">No data found for the selected filters</Alert>
                ) : (
                  <>
                    {/* Summary Cards */}
                    <Grid container spacing={3} mb={4}>
                      <Grid item xs={12} md={3}>
                        <Card sx={{ p: 2, textAlign: "center" }}>
                          <MDTypography variant="h6" color="primary">
                            Total Orders
                          </MDTypography>
                          <MDTypography variant="h4">{analyticsData[0].totalOrders}</MDTypography>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Card sx={{ p: 2, textAlign: "center" }}>
                          <MDTypography variant="h6" color="primary">
                            Total Amount
                          </MDTypography>
                          <MDTypography variant="h4">₹{analyticsData[0].totalAmount}</MDTypography>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Card sx={{ p: 2, textAlign: "center" }}>
                          <MDTypography variant="h6" color="primary">
                            Provider Commission
                          </MDTypography>
                          <MDTypography variant="h4">
                            ₹{parseFloat(analyticsData[0].totalCommission).toFixed(2)}
                          </MDTypography>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Card sx={{ p: 2, textAlign: "center" }}>
                          <MDTypography variant="h6" color="primary">
                            Platform Commission
                          </MDTypography>
                          <MDTypography variant="h4">
                            ₹{parseFloat(analyticsData[0].totalPlatformCommission).toFixed(2)}
                          </MDTypography>
                        </Card>
                      </Grid>
                    </Grid>

                    {/* Charts Section */}
                    <Grid container spacing={3} mb={4}>
                      {/* Daily Orders Chart */}
                      <Grid item xs={12} md={8}>
                        <Card sx={{ p: 2 }}>
                          <MDTypography variant="h6" mb={2}>
                            Daily Orders Trend
                          </MDTypography>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={prepareDailyChartData()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="orders"
                                stroke="#8884d8"
                                name="Orders"
                              />
                              <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#82ca9d"
                                name="Amount (₹)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </Card>
                      </Grid>

                      {/* Commission Distribution */}
                      <Grid item xs={12} md={4}>
                        <Card sx={{ p: 2 }}>
                          <MDTypography variant="h6" mb={2}>
                            Commission Distribution
                          </MDTypography>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={prepareCommissionPieData()}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) =>
                                  `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                              >
                                {prepareCommissionPieData().map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, "Amount"]} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </Card>
                      </Grid>
                    </Grid>

                    {/* Daily Stats Table */}
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Card sx={{ p: 2 }}>
                          <MDTypography variant="h6" mb={2}>
                            Daily Statistics
                          </MDTypography>
                          <TableContainer component={Paper}>
                            <DataTable
                              table={{
                                columns,
                                rows: dailyStats,
                              }}
                              isSorted={false}
                              entriesPerPage={false}
                              showTotalEntries={false}
                              noEndBorder
                            />
                          </TableContainer>
                        </Card>
                      </Grid>
                    </Grid>
                  </>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default AnalyticsComp;
