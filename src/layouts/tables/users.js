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
  Switch,
  Tooltip,
  TableContainer,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

const BASE_URL = "https://egrecharge.shellcode.website";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactionType, setTransactionType] = useState("credit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalUsers: 0,
    totalPages: 1,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const url = new URL(`${BASE_URL}/api/admin/users`);
      url.searchParams.append("page", pagination.page);
      url.searchParams.append("limit", pagination.limit);
      if (searchTerm) {
        url.searchParams.append("search", searchTerm);
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        setPagination((prev) => ({
          ...prev,
          totalUsers: data.totalUsers,
          totalPages: data.totalPages,
          currentPage: data.currentPage,
        }));
      } else {
        throw new Error(data.message || "No users found");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message || "Error loading users data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit, searchTerm]);

  const handleOpenDialog = (user, type) => {
    setSelectedUser(user);
    setTransactionType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedUser(null);
    setAmount("");
    setDescription("");
    setOpenDialog(false);
  };

  const handleWalletTransaction = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = transactionType === "credit" ? "credit" : "debit";

      const response = await fetch(`${BASE_URL}/api/wallet/${selectedUser.id}/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSnackbar({
          open: true,
          message: `Amount ${transactionType === "credit" ? "credited to" : "debited from"} wallet successfully`,
          severity: "success",
        });
        handleCloseDialog();
        fetchUsers(); // Refresh user list to update wallet balance
      } else {
        throw new Error(data.message || `Failed to ${transactionType} wallet`);
      }
    } catch (err) {
      console.error(`Error ${transactionType}ing wallet:`, err);
      setSnackbar({
        open: true,
        message: err.message || `Error ${transactionType}ing wallet`,
        severity: "error",
      });
    }
  };

  const handleBlockUser = async (userId, shouldBlock) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = shouldBlock ? "block" : "unblock";
      const response = await fetch(`${BASE_URL}/api/admin/users/${userId}/${endpoint}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers(); // Refresh the user list
        setSnackbar({
          open: true,
          message: `User ${shouldBlock ? "blocked" : "unblocked"} successfully`,
          severity: "success",
        });
      } else {
        throw new Error(data.message || `Failed to ${shouldBlock ? "block" : "unblock"} user`);
      }
    } catch (err) {
      console.error(`Error ${shouldBlock ? "blocking" : "unblocking"} user:`, err);
      setSnackbar({
        open: true,
        message: err.message || `Error ${shouldBlock ? "blocking" : "unblocking"} user`,
        severity: "error",
      });
    }
  };

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const columns = [
    { Header: "ID", accessor: "id" },
    { Header: "Name", accessor: "name" },
    { Header: "Email", accessor: "email" },
    { Header: "Phone", accessor: "phone" },
    {
      Header: "Wallet Balance",
      accessor: "walletBalance",
      Cell: ({ value }) => `₹${parseFloat(value || 0).toFixed(2)}`,
      propTypes: {
        value: PropTypes.number,
      },
    },
    {
      Header: "Status",
      accessor: "isBlocked",
      Cell: ({ value }) => (
        <MDTypography variant="caption" color={value ? "error" : "success"}>
          {value ? "Blocked" : "Active"}
        </MDTypography>
      ),
      propTypes: {
        value: PropTypes.bool.isRequired,
      },
    },
    {
      Header: "Block/Unblock",
      accessor: "blockToggle",
      Cell: ({ row }) => (
        <Tooltip title={row.original.isBlocked ? "Unblock user" : "Block user"}>
          <Switch
            checked={row.original.isBlocked}
            onChange={() => handleBlockUser(row.original.id, !row.original.isBlocked)}
            color={row.original.isBlocked ? "error" : "success"}
          />
        </Tooltip>
      ),
      propTypes: {
        row: PropTypes.shape({
          original: PropTypes.shape({
            id: PropTypes.number.isRequired,
            isBlocked: PropTypes.bool.isRequired,
          }).isRequired,
        }).isRequired,
      },
    },
    {
      Header: "Wallet Actions",
      accessor: "walletActions",
      Cell: ({ row }) => (
        <Box>
          <Tooltip title="Credit Wallet">
            <IconButton
              color="success"
              onClick={() => handleOpenDialog(row.original, "credit")}
              disabled={row.original.isBlocked}
              size="small"
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Debit Wallet">
            <IconButton
              color="error"
              onClick={() => handleOpenDialog(row.original, "debit")}
              disabled={row.original.isBlocked}
              size="small"
            >
              <RemoveIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      propTypes: {
        row: PropTypes.shape({
          original: PropTypes.shape({
            id: PropTypes.number.isRequired,
            isBlocked: PropTypes.bool,
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
                      Users Management
                    </MDTypography>
                  </Grid>
                  <Grid item>
                    <form onSubmit={handleSearch}>
                      <Box display="flex" alignItems="center">
                        <TextField
                          size="small"
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <IconButton type="submit" color="primary">
                          <SearchIcon />
                        </IconButton>
                      </Box>
                    </form>
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
                          rows: users,
                        }}
                        isSorted={false}
                        entriesPerPage={false}
                        showTotalEntries={false}
                        noEndBorder
                      />
                    </TableContainer>
                    <Box display="flex" justifyContent="center" mt={2}>
                      <Pagination
                        count={pagination.totalPages}
                        page={pagination.page}
                        onChange={handlePageChange}
                        color="primary"
                      />
                    </Box>
                  </>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Credit/Debit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {transactionType === "credit" ? "Credit" : "Debit"} Wallet - {selectedUser?.name}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            margin="normal"
            required
            inputProps={{ step: "0.01", min: "0.01" }}
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            margin="normal"
            required
            placeholder="e.g., Wallet top-up, Service payment, etc."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleWalletTransaction}
            color={transactionType === "credit" ? "success" : "error"}
            disabled={!amount || !description || parseFloat(amount) <= 0}
          >
            {transactionType === "credit" ? "Credit" : "Debit"} Wallet
          </Button>
        </DialogActions>
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

export default Users;
