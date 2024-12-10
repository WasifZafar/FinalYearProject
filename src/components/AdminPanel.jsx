import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Firebase configuration for Firestore
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from "@mui/material"; // Material UI components

const AdminPanel = () => {
  const [states, setStates] = useState([]); // List of states
  const [seats, setSeats] = useState({}); // Seats per state
  const [selectedState, setSelectedState] = useState(""); // Selected state
  const [selectedSeat, setSelectedSeat] = useState(""); // Selected seat
  const [dataType, setDataType] = useState("electors"); // Selected data type (electors/parties)
  const [oldKey, setOldKey] = useState(""); // Old key input for updating data
  const [newKey, setNewKey] = useState(""); // New key input for updating data
  const [newHasVote, setNewHasVote] = useState(false); // Has vote flag (for electors)
  const [users, setUsers] = useState([]); // List of users to display
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error message for key mismatch

  // Fetch states and seats from Firestore based on selected dataType (electors/parties)
  useEffect(() => {
    const fetchStatesAndSeats = async () => {
      try {
        const collectionName = dataType;
        const statesQuery = query(collection(db, collectionName)); // Query Firestore collection
        const snapshot = await getDocs(statesQuery); // Fetch documents

        const stateSet = new Set(); // Set to hold unique states
        const seatMap = {}; // Map of seats per state

        snapshot.forEach((doc) => {
          const data = doc.data();
          stateSet.add(data.state); // Add state to the set
          if (data.state) {
            if (!seatMap[data.state]) {
              seatMap[data.state] = new Set(); // Create a new set if not exists
            }
            seatMap[data.state].add(data.seat); // Add seat to the map
          }
        });

        // Convert sets to arrays for easier processing
        const stateArray = Array.from(stateSet);
        const seatObj = {};
        Object.keys(seatMap).forEach((state) => {
          seatObj[state] = Array.from(seatMap[state]); // Convert seat sets to arrays
        });

        setStates(stateArray); // Set states list
        setSeats(seatObj); // Set seats list
      } catch (error) {
        console.error("Error fetching states and seats:", error); // Handle errors
        alert("Error fetching states and seats. Please try again.");
      }
    };

    fetchStatesAndSeats(); // Trigger state and seat fetch when dataType changes
  }, [dataType]);

  // Fetch users based on selected state, seat, and data type
  const fetchUsers = async () => {
    if (!selectedState) return; // Return early if no state is selected
    setLoading(true); // Set loading to true

    try {
      const collectionName = dataType;
      let queryRef;

      if (selectedSeat === "All" || !selectedSeat) {
        queryRef = query(collection(db, collectionName), where("state", "==", selectedState));
      } else {
        queryRef = query(
          collection(db, collectionName),
          where("state", "==", selectedState),
          where("seat", "==", selectedSeat)
        );
      }

      const querySnapshot = await getDocs(queryRef); // Fetch documents from Firestore
      const userList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setUsers(userList); // Set fetched users
    } catch (error) {
      console.error("Error fetching users:", error); // Handle errors
      alert("Error fetching users. Please try again.");
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  // Update data in Firestore (including hasVote for electors)
  const updateData = async () => {
    if (!oldKey || !newKey) {
      setError("Both old key and new key are required.");
      return;
    }

    if (oldKey === newKey) {
      setError("Old key and new key cannot be the same.");
      return;
    }

    setLoading(true); // Set loading to true
    setError(""); // Reset error message

    try {
      const collectionName = dataType;
      let queryRef;

      if (selectedSeat === "All" || !selectedSeat) {
        queryRef = query(collection(db, collectionName), where("state", "==", selectedState));
      } else {
        queryRef = query(
          collection(db, collectionName),
          where("state", "==", selectedState),
          where("seat", "==", selectedSeat)
        );
      }

      const snapshot = await getDocs(queryRef); // Fetch documents for updating

      let isOldKeyValid = false;
      for (const docSnapshot of snapshot.docs) {
        const docData = docSnapshot.data();
        if (docData.key === oldKey) {
          isOldKeyValid = true; // If the old key matches, proceed with updating
          const ref = doc(db, collectionName, docSnapshot.id); // Reference to document
          await updateDoc(ref, { key: newKey }); // Update the document with new key

          // For electors, set hasVote to false
          if (dataType === "electors") {
            await updateDoc(ref, { hasVote: false }); // Set hasVote to false
          }
        }
      }

      if (!isOldKeyValid) {
        setError("Old key does not match. Please check and try again.");
      } else {
        alert("Data updated successfully!");
        setOldKey(""); // Clear the old key
        setNewKey(""); // Clear the new key
        fetchUsers(); // Refresh the user list
      }
    } catch (error) {
      console.error("Error updating data:", error); // Handle errors
      alert("Error updating data. Please try again.");
    } finally {
      setLoading(false); // Set loading to false after update
    }
  };

  // Reset the form selections and clear the users list
  const handleClose = () => {
    setSelectedState("");
    setSelectedSeat("");
    setUsers([]);
    setOldKey("");
    setNewKey("");
    setNewHasVote(false);
    setError(""); // Clear any error messages
  };

  return (
    <Box
      sx={{
        padding: 4,
        maxWidth: "900px",
        margin: "40px auto",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        marginTop: "100px",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          marginBottom: 2,
          textAlign: "center",
          fontWeight: "bold",
          color: "#333",
        }}
      >
        Admin Panel
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          marginBottom: 3,
          justifyContent: "space-between",
        }}
      >
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Data Type</InputLabel>
          <Select value={dataType} onChange={(e) => setDataType(e.target.value)}>
            <MenuItem value="electors">Electors</MenuItem>
            <MenuItem value="parties">Parties</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>State</InputLabel>
          <Select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedSeat(""); // Reset seat when state changes
            }}
          >
            {states.map((state) => (
              <MenuItem key={state} value={state}>
                {state}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }} disabled={!selectedState}>
          <InputLabel>Seat</InputLabel>
          <Select value={selectedSeat} onChange={(e) => setSelectedSeat(e.target.value)}>
            <MenuItem value="All">All Seats</MenuItem>
            {selectedState &&
              seats[selectedState]?.map((seat) => (
                <MenuItem key={seat} value={seat}>
                  {seat}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>

      {dataType === "electors" && (
        <TextField
          label="Has Vote"
          value="No"
          variant="outlined"
          fullWidth
          disabled
          sx={{
            marginTop: 2,
            backgroundColor: "#fff",
            borderRadius: "4px",
          }}
        />
      )}

      <TextField
        label="Old Key"
        type="password"
        variant="outlined"
        fullWidth
        value={oldKey}
        onChange={(e) => setOldKey(e.target.value)}
        sx={{
          marginTop: 2,
          backgroundColor: "#fff",
          borderRadius: "4px",
        }}
      />

      <TextField
        label="New Key"
        type="password"
        variant="outlined"
        fullWidth
        value={newKey}
        onChange={(e) => setNewKey(e.target.value)}
        inputProps={{
          minLength: 6,
          maxLength: 10,
        }}
        error={newKey.length > 0 && (newKey.length < 6 || newKey.length > 10)} // Error validation
        helperText={newKey.length > 0 && (newKey.length < 6 || newKey.length > 10) ? "Key must be between 6 and 10 characters" : ""}
        sx={{
          marginTop: 2,
          backgroundColor: "#fff",
          borderRadius: "4px",
        }}
      />

      {error && <Typography color="error">{error}</Typography>} {/* Display error message */}

      <Box
        sx={{
          marginTop: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          variant="contained"
          onClick={fetchUsers}
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#1565c0" },
          }}
        >
          Fetch Users
        </Button>
        {loading && <CircularProgress sx={{ marginLeft: 2 }} />}
      </Box>

      <Box sx={{ display: "flex", gap: 3, margin: 4, justifyContent: "center" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={updateData}
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#1565c0" },
          }}
        >
          Update Data
        </Button>
        <Button
          variant="outlined"
          onClick={handleClose}
          sx={{
            borderColor: "#1976d2",
            color: "#1976d2",
            "&:hover": { borderColor: "#1565c0", color: "#1565c0" },
          }}
        >
          Close
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          marginTop: 3,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell sx={{ color: "#fff" }}>ID</TableCell>
              <TableCell sx={{ color: "#fff" }}>Name</TableCell>
              <TableCell sx={{ color: "#fff" }}>Has Vote</TableCell>
              <TableCell sx={{ color: "#fff" }}>Key</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.hasVote ? "Yes" : "No"}</TableCell>
                <TableCell>{'*'.repeat(user.key.length)}</TableCell> {/* Display key as asterisks */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminPanel;
