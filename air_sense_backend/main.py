"""
Air Sense Backend - FastAPI application entry point.
Production-ready async API with MongoDB, CORS, and Swagger docs.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.database import connect_to_mongo, close_mongo_connection
from routes import aqi_routes, prediction_routes, exposure_routes, insight_routes, ranking_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage startup and shutdown: connect/disconnect MongoDB."""
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title="Air Sense API",
    description="Backend API for AQI, predictions, exposure, insights, and clean air rankings.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(aqi_routes.router)
app.include_router(prediction_routes.router)
app.include_router(exposure_routes.router)
app.include_router(insight_routes.router)
app.include_router(ranking_routes.router)


@app.get("/")
async def root():
    """Root endpoint confirming backend is running."""
    return {"message": "Air Sense Backend Running"}


@app.get("/health")
async def health():
    """Health check for load balancers and monitoring."""
    return {"status": "ok"}
