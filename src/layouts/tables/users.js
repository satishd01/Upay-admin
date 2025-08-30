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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
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
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalUsers: 0,
    totalPages: 1,
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

  const handleOpen = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedUser(null);
    setAmount("");
    setDescription("");
    setOpen(false);
  };

  const handleAddFunds = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/wallet/add-funds`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: parseFloat(amount),
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add funds");
      }

      const data = await response.json();
      if (data.success) {
        alert("Funds added successfully");
        handleClose();
        fetchUsers();
      } else {
        throw new Error(data.message || "Failed to add funds");
      }
    } catch (err) {
      console.error("Error adding funds:", err);
      alert(err.message || "Error adding funds");
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
        alert(`User ${shouldBlock ? "blocked" : "unblocked"} successfully`);
      } else {
        throw new Error(data.message || `Failed to ${shouldBlock ? "block" : "unblock"} user`);
      }
    } catch (err) {
      console.error(`Error ${shouldBlock ? "blocking" : "unblocking"} user:`, err);
      alert(err.message || `Error ${shouldBlock ? "blocking" : "unblocking"} user`);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const columns = [
    { Header: "ID", accessor: "id" },
    { Header: "Name", accessor: "name" },
    { Header: "Email", accessor: "email" },
    { Header: "Phone", accessor: "phone" },
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
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <Button
          variant="contained"
          color="error"
          onClick={() => handleOpen(row.original)}
          disabled={row.original.isBlocked}
        >
          Add Funds
        </Button>
      ),
      propTypes: {
        row: PropTypes.shape({
          original: PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string,
            email: PropTypes.string,
            phone: PropTypes.string,
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
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Funds to {selectedUser?.name}</DialogTitle>
        <DialogContent>
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddFunds} color="primary" disabled={!amount || !description}>
            Add Funds
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default Users;
