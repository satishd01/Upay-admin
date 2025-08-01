import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Chip,
} from "@mui/material";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Alert from "@mui/material/Alert";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://tambola.chetakbooks.shop";

const PatternCell = ({ value }) => (
  <Chip label={value} color="primary" size="small" sx={{ textTransform: "capitalize" }} />
);

PatternCell.propTypes = {
  value: PropTypes.string.isRequired,
};

function WinningManagement() {
  const [state, setState] = useState({
    games: [],
    loading: false,
    selectedGame: "",
    winners: [],
    winnersCount: 0,
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
    prizeDistribution: {
      prizes: [],
    },
  });

  const [prizeForm, setPrizeForm] = useState({
    winnerId: "",
    amount: "",
    pattern: "",
  });

  const showSnackbar = useCallback((message, severity = "success") => {
    setState((prev) => ({
      ...prev,
      snackbar: {
        open: true,
        message,
        severity,
      },
    }));
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setState((prev) => ({
      ...prev,
      snackbar: {
        ...prev.snackbar,
        open: false,
      },
    }));
  }, []);

  const fetchGames = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/game/games`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch games");
      }

      const data = await response.json();
      if (data.success && data.data) {
        setState((prev) => ({
          ...prev,
          games: data.data,
          loading: false,
        }));
      } else {
        throw new Error(data.message || "No games found");
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      showSnackbar(error.message || "Error fetching games", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [showSnackbar]);

  const fetchWinners = useCallback(
    async (gameId) => {
      try {
        setState((prev) => ({ ...prev, loading: true }));
        const token = localStorage.getItem("token");

        const response = await fetch(`${BASE_URL}/api/game/winners/${gameId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch winners");
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.winners)) {
          setState((prev) => ({
            ...prev,
            winners: data.winners,
            winnersCount: data.winners.length,
            loading: false,
          }));
        } else {
          throw new Error("No winners found");
        }
      } catch (error) {
        console.error("Error fetching winners:", error);
        showSnackbar(error.message || "Error fetching winners", "error");
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [showSnackbar]
  );

  const handleGameChange = (event) => {
    const gameId = event.target.value;
    setState((prev) => ({
      ...prev,
      selectedGame: gameId,
    }));
    if (gameId) {
      fetchWinners(gameId);
    }
  };

  const handlePrizeFormChange = (e) => {
    const { name, value } = e.target;
    setPrizeForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addPrize = () => {
    if (!prizeForm.winnerId || !prizeForm.amount || !prizeForm.pattern) {
      showSnackbar("Please fill all prize fields", "error");
      return;
    }

    setState((prev) => ({
      ...prev,
      prizeDistribution: {
        prizes: [
          ...prev.prizeDistribution.prizes,
          {
            winnerId: parseInt(prizeForm.winnerId),
            amount: parseInt(prizeForm.amount),
            pattern: prizeForm.pattern,
          },
        ],
      },
    }));

    setPrizeForm({
      winnerId: "",
      amount: "",
      pattern: "",
    });
  };

  const removePrize = (index) => {
    const updatedPrizes = [...state.prizeDistribution.prizes];
    updatedPrizes.splice(index, 1);
    setState((prev) => ({
      ...prev,
      prizeDistribution: {
        prizes: updatedPrizes,
      },
    }));
  };

  const distributePrizes = async () => {
    try {
      if (state.prizeDistribution.prizes.length === 0) {
        showSnackbar("Please add at least one prize to distribute", "error");
        return;
      }

      if (!state.selectedGame) {
        showSnackbar("Please select a game first", "error");
        return;
      }

      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/game/winners/${state.selectedGame}/distribute`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(state.prizeDistribution),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to distribute prizes");
      }

      const data = await response.json();
      if (data.success) {
        showSnackbar("Prizes distributed successfully");
        setState((prev) => ({
          ...prev,
          prizeDistribution: {
            prizes: [],
          },
          loading: false,
        }));
        fetchWinners(state.selectedGame);
      } else {
        throw new Error(data.message || "Failed to distribute prizes");
      }
    } catch (error) {
      console.error("Error distributing prizes:", error);
      showSnackbar(error.message || "Error distributing prizes", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const winnersColumns = [
    { Header: "Winner ID", accessor: "id" },
    { Header: "Ticket ID", accessor: "ticket_id" },
    {
      Header: "Pattern",
      accessor: "patterns",
      Cell: ({ value }) => value.map((pattern) => <PatternCell key={pattern} value={pattern} />),
      propTypes: {
        value: PropTypes.arrayOf(PropTypes.string).isRequired,
      },
    },
    {
      Header: "Winning Numbers",
      accessor: "winning_ticket_number",
      Cell: ({ value }) => value,
      propTypes: {
        value: PropTypes.number.isRequired,
      },
    },
    {
      Header: "Player Name",
      accessor: "player_name",
      Cell: ({ value }) => value,
      propTypes: {
        value: PropTypes.string.isRequired,
      },
    },
  ];

  const prizesColumns = [
    { Header: "Winner ID", accessor: "winnerId" },
    { Header: "Amount", accessor: "amount" },
    {
      Header: "Pattern",
      accessor: "pattern",
      Cell: ({ value }) => <PatternCell value={value} />,
      propTypes: {
        value: PropTypes.string.isRequired,
      },
    },
    {
      Header: "Action",
      accessor: "action",
      Cell: ({ row }) => (
        <Button color="error" onClick={() => removePrize(row.index)} size="small">
          Remove
        </Button>
      ),
      propTypes: {
        row: PropTypes.shape({
          index: PropTypes.number.isRequired,
        }).isRequired,
      },
    },
  ];

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

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
                <MDTypography variant="h6" color="black">
                  Winning Management
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="game-select-label">Select Game</InputLabel>
                      <Select
                        labelId="game-select-label"
                        id="game-select"
                        value={state.selectedGame}
                        label="Select Game"
                        onChange={handleGameChange}
                        disabled={state.loading}
                        sx={{ width: 350, height: 40 }}
                      >
                        {state.games.map((game) => (
                          <MenuItem key={game.game_id} value={game.game_id}>
                            {game.game_name} ({game.game_id})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {state.loading && (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                )}

                {state.selectedGame && (
                  <>
                    <MDBox mt={4}>
                      <MDTypography variant="h6" gutterBottom>
                        Winners ({state.winnersCount})
                      </MDTypography>
                      {state.winners.length > 0 ? (
                        <DataTable
                          table={{ columns: winnersColumns, rows: state.winners }}
                          isSorted={false}
                          entriesPerPage={false}
                          showTotalEntries={false}
                          noEndBorder
                        />
                      ) : (
                        <MDBox p={3} textAlign="center">
                          <MDTypography variant="body1">
                            No winners found for this game
                          </MDTypography>
                        </MDBox>
                      )}
                    </MDBox>

                    <MDBox mt={4}>
                      <MDTypography variant="h6" gutterBottom>
                        Distribute Prizes
                      </MDTypography>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            label="Winner ID"
                            name="winnerId"
                            value={prizeForm.winnerId}
                            onChange={handlePrizeFormChange}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            label="Amount"
                            name="amount"
                            type="number"
                            value={prizeForm.amount}
                            onChange={handlePrizeFormChange}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            label="Pattern"
                            name="pattern"
                            value={prizeForm.pattern}
                            onChange={handlePrizeFormChange}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={addPrize}
                            fullWidth
                            size="small"
                          >
                            Add Prize
                          </Button>
                        </Grid>
                      </Grid>

                      {state.prizeDistribution.prizes.length > 0 && (
                        <>
                          <MDBox mt={2}>
                            <MDTypography variant="subtitle1">
                              Prizes to be distributed:
                            </MDTypography>
                            <DataTable
                              table={{
                                columns: prizesColumns,
                                rows: state.prizeDistribution.prizes,
                              }}
                              isSorted={false}
                              entriesPerPage={false}
                              showTotalEntries={false}
                              noEndBorder
                            />
                          </MDBox>
                          <Box mt={2}>
                            <Button
                              variant="contained"
                              color="error"
                              onClick={distributePrizes}
                              disabled={state.loading}
                            >
                              Distribute Prizes
                            </Button>
                          </Box>
                        </>
                      )}
                    </MDBox>
                  </>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <Snackbar
        open={state.snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={state.snackbar.severity}
          sx={{ width: "100%" }}
        >
          {state.snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default WinningManagement;
