import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  Alert,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Pagination,
  IconButton,
  Paper,
  Chip,
  Switch,
  Tooltip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  TableContainer,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

const BASE_URL = "https://egrecharge.shellcode.website";

const Commissions = () => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCommission, setEditingCommission] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Form state
  const [formData, setFormData] = useState({
    providerCode: "",
    providerName: "",
    commissionRate: "",
    isActive: true,
    providerType: "prePaid",
  });

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/commissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setCommissions(data.commissions);
      } else {
        throw new Error(data.message || "No commissions found");
      }
    } catch (err) {
      console.error("Error fetching commissions:", err);
      setError(err.message || "Error loading commissions data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const handleOpenDialog = (commission = null) => {
    if (commission) {
      setEditingCommission(commission);
      setFormData({
        providerCode: commission.providerCode,
        providerName: commission.providerName,
        commissionRate: commission.commissionRate,
        isActive: commission.isActive,
        providerType: commission.providerType || "prePaid",
      });
    } else {
      setEditingCommission(null);
      setFormData({
        providerCode: "",
        providerName: "",
        commissionRate: "",
        isActive: true,
        providerType: "prePaid",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCommission(null);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const url = `${BASE_URL}/api/commissions`;
      const method = editingCommission ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setSnackbar({
          open: true,
          message: editingCommission
            ? "Commission updated successfully"
            : "Commission created successfully",
          severity: "success",
        });
        handleCloseDialog();
        fetchCommissions();
      } else {
        throw new Error(data.message || "Failed to save commission");
      }
    } catch (err) {
      console.error("Error saving commission:", err);
      setSnackbar({
        open: true,
        message: err.message || "Error saving commission",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (providerCode) => {
    if (!window.confirm("Are you sure you want to delete this commission?")) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/commissions/${providerCode}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSnackbar({
          open: true,
          message: "Commission deleted successfully",
          severity: "success",
        });
        fetchCommissions();
      } else {
        throw new Error(data.message || "Failed to delete commission");
      }
    } catch (err) {
      console.error("Error deleting commission:", err);
      setSnackbar({
        open: true,
        message: err.message || "Error deleting commission",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const columns = [
    { Header: "ID", accessor: "id" },
    { Header: "Provider Code", accessor: "providerCode" },
    { Header: "Provider Name", accessor: "providerName" },
    { Header: "Type", accessor: "providerType" },
    {
      Header: "Commission Rate",
      accessor: "commissionRate",
      Cell: ({ value }) => `${value}%`,
      propTypes: {
        value: PropTypes.string.isRequired,
      },
    },
    {
      Header: "Status",
      accessor: "isActive",
      Cell: ({ value }) => (
        <Chip
          label={value ? "Active" : "Inactive"}
          color={value ? "success" : "error"}
          size="small"
        />
      ),
      propTypes: {
        value: PropTypes.bool.isRequired,
      },
    },
    {
      Header: "Created",
      accessor: "createdAt",
      Cell: ({ value }) => new Date(value).toLocaleDateString(),
      propTypes: {
        value: PropTypes.string.isRequired,
      },
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton color="primary" onClick={() => handleOpenDialog(row.original)} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              color="error"
              onClick={() => handleDelete(row.original.providerCode)}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      propTypes: {
        row: PropTypes.shape({
          original: PropTypes.shape({
            providerCode: PropTypes.string.isRequired,
            providerName: PropTypes.string,
            commissionRate: PropTypes.string,
            isActive: PropTypes.bool,
            providerType: PropTypes.string,
          }).isRequired,
        }).isRequired,
      },
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
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
                <Grid container justifyContent="space-between" alignItems="center">
                  <Grid item>
                    <MDTypography variant="h6" color="black">
                      Commissions Management
                    </MDTypography>
                  </Grid>
                  <Grid item>
                    <Box display="flex" alignItems="center" gap={2}>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          fetchCommissions();
                        }}
                      >
                        <Box display="flex" alignItems="center">
                          <TextField
                            size="small"
                            placeholder="Search commissions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <IconButton type="submit" color="primary">
                            <SearchIcon />
                          </IconButton>
                        </Box>
                      </form>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                      >
                        Add Commission
                      </Button>
                    </Box>
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
                ) : (
                  <>
                    <TableContainer component={Paper}>
                      <DataTable
                        table={{
                          columns,
                          rows: commissions,
                        }}
                        isSorted={false}
                        entriesPerPage={false}
                        showTotalEntries={false}
                        noEndBorder
                      />
                    </TableContainer>
                  </>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCommission ? "Edit Commission" : "Add New Commission"}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Provider Code"
                  value={formData.providerCode}
                  onChange={(e) => handleFormChange("providerCode", e.target.value)}
                  fullWidth
                  required
                  disabled={!!editingCommission}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Provider Name"
                  value={formData.providerName}
                  onChange={(e) => handleFormChange("providerName", e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Provider Type</InputLabel>
                  <Select
                    value={formData.providerType}
                    onChange={(e) => handleFormChange("providerType", e.target.value)}
                    label="Provider Type"
                  >
                    <MenuItem value="prePaid">Pre Paid</MenuItem>
                    <MenuItem value="postPaid">Post Paid</MenuItem>
                    <MenuItem value="dth">DTH</MenuItem>
                    <MenuItem value="broadband">Broadband</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Commission Rate (%)"
                  type="number"
                  value={formData.commissionRate}
                  onChange={(e) => handleFormChange("commissionRate", e.target.value)}
                  fullWidth
                  required
                  inputProps={{ step: "0.01", min: "0" }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleFormChange("isActive", e.target.checked)}
                    color="primary"
                  />
                  <MDTypography>Active</MDTypography>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Save"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default Commissions;
