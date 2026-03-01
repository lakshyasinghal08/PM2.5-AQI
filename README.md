# 🌍 Real-Time AQI Monitoring & Analytics System

A Full-Stack Air Quality Monitoring System that displays real-time AQI along with environmental components.

Built using:

- ⚡ FastAPI (Backend API)
- 🌐 React + Vite (Frontend Dashboard)
- 🍃 MongoDB (Database)
- 📊 Data Logging & Analytics
- 🤖 ML-Ready Architecture

---

## 🚀 Project Overview

This system provides:

- 🌫️ Real-time AQI display
- 🌡️ Temperature monitoring
- 💧 Humidity tracking
- 🌬️ Wind speed analysis
- 📈 AQI history logging
- 🧠 Exposure tracking
- 🏆 Clean Area Ranking
- 📊 AI Insight Panel

Environmental readings are stored in MongoDB for further analysis and visualization.

---

## 🏗️ Architecture

Frontend (React Dashboard)  
        ↓  
FastAPI Backend (API Layer)  
        ↓  
MongoDB (Data Storage)

---

## 🔥 Core Features

### 🌍 Real-Time AQI Display
Displays current AQI dynamically from backend.

### 🌡️ Environmental Components
- Temperature  
- Humidity  
- Wind Speed  
- PM2.5 Level  

### 📊 Historical Logging
Stores AQI readings with timestamp.

### 🧠 Exposure Calculator
Tracks user exposure to pollution.

### 🏆 Clean Area Ranking
Ranks areas based on AQI score.

### 📈 AI Insight Panel
Provides interpretation of AQI levels.

---

## 📁 Project Structure

```
PM2.5-AQI/
│
├── air_sense_backend/
│   ├── main.py
│   ├── routes/
│   ├── services/
│   ├── schemas/
│   ├── config/
│   └── requirements.txt
│
├── air_sense_frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## ⚙️ Backend Setup

### 1️⃣ Install Dependencies

```
cd air_sense_backend
pip install -r requirements.txt
```

### 2️⃣ Start MongoDB

```
mongod
```

### 3️⃣ Run Backend Server

```
uvicorn main:app --reload --port 8000
```

Backend runs at:

```
http://127.0.0.1:8000
```

---

## 🌐 Frontend Setup

```
cd air_sense_frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🗄️ Database

Database Name:

```
air_sense_db
```

Collections:

- aqi_logs
- users
- exposure_logs

---

## 📊 Sample Stored Document

```json
{
  "city": "Delhi",
  "aqi": 180,
  "temperature": 30,
  "humidity": 45,
  "wind_speed": 12,
  "timestamp": "2026-03-01T10:45:00Z"
}
```

---

## 🧠 Future Improvements

- Live AQI API Integration
- Real ML Model Integration
- JWT Authentication
- Historical Trend Charts
- Cloud Deployment
- Power BI Integration

---

## ⭐ If You Like This Project

Give it a star on GitHub!
