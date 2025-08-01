import { useState } from "react";
import {
  Card,
  Grid,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

const BASE_URL = "http://54.146.70.141:8090";

const ReportDownload = () => {
  const [reportType, setReportType] = useState("wallet");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleDownload = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/admin/report?type=${reportType}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Create the full URL by combining base URL and file path
        const fileUrl = `${BASE_URL}${data.fileUrl}`;

        // Create a temporary anchor element to trigger download
        const link = document.createElement("a");
        link.href = fileUrl;
        link.setAttribute("download", `${reportType}-report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setSnackbar({
          open: true,
          message: "Report downloaded successfully",
          severity: "success",
        });
      } else {
        throw new Error(data.message || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      setSnackbar({
        open: true,
        message: error.message || "Error downloading report",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h5" gutterBottom>
                  Download Reports
                </MDTypography>
                <MDBox mt={2} mb={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Report Type</InputLabel>
                    <Select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      label="Report Type"
                      sx={{ width: 300, height: 40 }}
                    >
                      <MenuItem value="wallet">Wallet Transactions</MenuItem>
                      <MenuItem value="orders">Order History</MenuItem>
                      <MenuItem value="users">User Data</MenuItem>
                    </Select>
                  </FormControl>
                </MDBox>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDownload}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? "Generating Report..." : "Download Report"}
                </Button>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default ReportDownload;
