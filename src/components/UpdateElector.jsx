import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

const UpdateElector = () => {
  const [userId, setUserId] = useState("");
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    address: "",
    pinCode: "",
    imageUrl: "",
    key: "",
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const hindiName = `${data.surnamePrefix} ${data.firstName} ${data.lastName}`;

      const userDoc = doc(db, "electors", userId);
      await updateDoc(userDoc, {
        name: hindiName,
        dob: data.dob,
        gender: data.gender,
        address: data.address,
        pinCode: data.pinCode,
        imageUrl: data.imageUrl,
        key: data.key,
      });
      alert("Elector data updated successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <form
      onSubmit={handleUpdate}
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#fff",
        marginTop: "100px",
      }}
    >
      <h2 style={{ textAlign: "center",
        color: "#0056b3",
      }}>Update Elector Data</h2>
      <input
        type="text"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        required
        style={inputStyle}
      />
      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={data.firstName}
        onChange={handleChange}
        required
        style={inputStyle}
      />
      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        value={data.lastName}
        onChange={handleChange}
        required
        style={inputStyle}
      />
  
      <button
        type="submit"
        style={{
          ...inputStyle,
          backgroundColor:  "#007BFF",
          color: "white",
          border: "none",
        }}
      >
        Update
      </button>
    </form>
  );
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

export default UpdateElector;
