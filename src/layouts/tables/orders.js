import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Card,
  CircularProgress,
  Grid,
  Alert,
  TextField,
  Pagination,
  IconButton,
  Paper,
  Chip,
  TableContainer,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

const BASE_URL = "http://54.146.70.141:8090";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const url = new URL(`${BASE_URL}/api/admin/orders`);
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
        setOrders(data.orders);
        setPagination((prev) => ({
          ...prev,
          total: data.total,
          totalPages: data.totalPages,
          currentPage: data.currentPage,
        }));
      } else {
        throw new Error(data.message || "No orders found");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Error loading orders data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, pagination.limit, searchTerm]);

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "success";
      case "failed":
        return "error";
      case "pending":
        return "warning";
      default:
        return "info";
    }
  };

  const getPaymentTypeColor = (paymentType) => {
    switch (paymentType) {
      case "upi":
        return "primary";
      case "wallet":
        return "secondary";
      default:
        return "info";
    }
  };

  const columns = [
    { Header: "Order ID", accessor: "id" },
    {
      Header: "User",
      accessor: "User",
      Cell: ({ value }) => (
        <Box>
          <MDTypography variant="subtitle2">{value?.name}</MDTypography>
          <MDTypography variant="caption" color="textSecondary">
            {value?.phone}
          </MDTypography>
        </Box>
      ),
      propTypes: {
        value: PropTypes.shape({
          name: PropTypes.string,
          phone: PropTypes.string,
        }).isRequired,
      },
    },
    { Header: "Mobile Number", accessor: "number" },
    { Header: "Service", accessor: "service_type" },
    { Header: "Operator", accessor: "opId" },
    { Header: "Type", accessor: "type" },
    {
      Header: "Amount",
      accessor: "totalAmount",
      Cell: ({ value }) => `₹${value}`,
      propTypes: {
        value: PropTypes.number.isRequired,
      },
    },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ value }) => <Chip label={value} color={getStatusColor(value)} size="small" />,
      propTypes: {
        value: PropTypes.string.isRequired,
      },
    },
    {
      Header: "Payment",
      accessor: "paymentType",
      Cell: ({ value }) => <Chip label={value} color={getPaymentTypeColor(value)} size="small" />,
      propTypes: {
        value: PropTypes.string.isRequired,
      },
    },
    {
      Header: "Date",
      accessor: "createdAt",
      Cell: ({ value }) => new Date(value).toLocaleString(),
      propTypes: {
        value: PropTypes.string.isRequired,
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
                      Orders Management
                    </MDTypography>
                  </Grid>
                  <Grid item>
                    <form onSubmit={handleSearch}>
                      <Box display="flex" alignItems="center">
                        <TextField
                          size="small"
                          placeholder="Search orders..."
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
                          rows: orders,
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
    </DashboardLayout>
  );
};

export default Orders;
