import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setPrediction(""); // reset on new file
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a CSV file first!");
      return;
    }

    const formData = new FormData();
    formData.append("input_file", file);

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/predict/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      setPrediction(data.prediction);
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚡<u> Micro-Doppler Based Target Classifier</u></h1>

      <div style={styles.card}>
        {/* Drop Zone (now a label) */}
        <label
          htmlFor="fileUpload"
          style={{
            ...styles.dropZone,
            borderColor: file ? "#2e7d32" : "#1976d2",
            backgroundColor: file ? "#e8f5e9" : "white",
           
            fontSize: "1.1rem",
            fontWeight: "bold",
            color: "#1976d2",
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length > 0) {
              setFile(e.dataTransfer.files[0]);
              setPrediction("");
            }
          }}
        >
          <input
            type="file"
            accept=".csv"
            id="fileUpload"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          📂 {file ? file.name : "Choose CSV File or Drag & Drop"}
        </label>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          style={styles.button}
          disabled={loading}
        >
          {loading ? "Processing..." : "Upload & Predict"}
        </button>

        {/* Prediction Result */}
        {prediction && (
          <div
            style={{
              ...styles.resultBox,
              backgroundColor:
                prediction === "Bird" ? "#d4f6d2" : "#ffe0e0",
              borderColor:
                prediction === "Bird" ? "#2e7d32" : "#c62828",
              color: prediction === "Bird" ? "#2e7d32" : "#c62828",
            }}
          >
            <strong>Prediction:</strong>{" "}
            {prediction === "Bird" ? "🕊️ Bird" : "🚁 Drone"}
           
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  warningMessage: {
    marginTop: '0.5rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid #c62828',
    color: '#c62828',
    fontWeight: 'normal',
    fontSize: '1rem',
  },
  
  container: {
    minHeight: "100vh",
    minWidth: "100vw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #000000ff 0%, #1f2850ff 100%)",
    fontFamily: "Arial, sans-serif",
    margin: 0,
    padding: 0,
  },
  title: {
    marginBottom: "1.5rem",
    color: "#f0f0f0ff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#858585ff",
    padding: "7rem",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "380px",
  },
  dropZone: {
    width: "100%",
    padding: "4rem",
    border: "2px dashed #5c5c5cff",
    borderRadius: "12px",
    textAlign: "center",
    cursor: "pointer",
    marginBottom: "1rem",
    transition: "0.3s",
    backgroundcolor: "#7f7f7fff",
  },
  
  button: {
    padding: "0.6rem 1.2rem",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#1976d2",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "0.3s",
  },
  resultBox: {
    marginTop: "1.5rem",
    padding: "1rem",
    border: "2px solid",
    borderRadius: "10px",
    fontSize: "1.2rem",
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
  },
};

export default App;
