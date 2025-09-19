from fastapi import FastAPI, UploadFile, File, HTTPException
import tensorflow as tf
import pandas as pd
import numpy as np
import io
from fastapi.middleware.cors import CORSMiddleware


model = tf.keras.models.load_model("microdoppler_fft_cnn.h5")

app = FastAPI() 

def load_and_process_test_file(file_path):
        WINDOW_SIZE = 128
        STRIDE = 64
        df = pd.read_csv(file_path, sep=',')
        if 'V' not in df.columns:
            raise ValueError("CSV missing 'V' column")
        v = pd.to_numeric(df['V'], errors='coerce').dropna().values

        segments = []
        for i in range(0, len(v) - WINDOW_SIZE + 1, STRIDE):
            window = v[i:i+WINDOW_SIZE]
            fft_window = np.abs(np.fft.fft(window))[:WINDOW_SIZE//2]
            segments.append(fft_window)

        X = np.array(segments)
        # Normalize per segment
        X = (X - X.mean(axis=1, keepdims=True)) / X.std(axis=1, keepdims=True)
        X = X[..., np.newaxis]  # add channel dimension
        return X


@app.get("/")
def root():
     print("Welcome to Target Classifier API")
     return {"message": "Welcome to Target Classifier API"}

@app.post("/predict/") 
async def predict(input_file: UploadFile = File(...)):
    if not input_file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    try:
        contents = await input_file.read()
        data = load_and_process_test_file(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

    prediction = model.predict(data)
    predictions = (prediction > 0.5).astype(int).flatten()

    num_bird = np.sum(predictions == 0)
    num_drone = np.sum(predictions == 1)
    pred = "Bird" if num_bird > num_drone else "Drone"

    return {"prediction": pred}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
