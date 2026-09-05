"""
FastAPI Microservice for MediNexa AI Hospital Occupancy Forecasting
Port: 8000
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from forecaster import forecaster

app = FastAPI(
    title="MediNexa ML Hospital Occupancy Forecasting Service",
    description="Machine Learning service providing next-day and 7-day bed surge forecasting, ICU bottleneck detection, and proactive clinical recommendations.",
    version="1.0.0",
)

# CORS middleware for Next.js frontend and NestJS API calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ForecastRequest(BaseModel):
    facilityId: str
    currentOccupancyRate: Optional[float] = 65.0
    totalBeds: Optional[int] = 25
    occupiedBeds: Optional[int] = 16
    icuTotal: Optional[int] = 4
    icuOccupied: Optional[int] = 2
    emergencyTotal: Optional[int] = 4
    emergencyOccupied: Optional[int] = 2


@app.get("/")
def root():
    return {
        "service": "MediNexa ML Occupancy Forecaster",
        "version": "1.0.0",
        "status": "ONLINE",
        "endpoints": ["/health", "/forecast", "/docs"],
    }


@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "service": "ml-forecasting",
        "model_trained": forecaster.is_trained,
        "algorithm": "Ridge Polynomial Regression (Scikit-Learn)",
    }


@app.get("/forecast")
def get_forecast_get(
    facilityId: str = Query("default-facility", description="Hospital Facility ID"),
    currentOccupancyRate: float = Query(65.0, description="Current Hospital Occupancy Rate %"),
    totalBeds: int = Query(25, description="Total Hospital Beds"),
    occupiedBeds: int = Query(16, description="Currently Occupied Beds"),
    icuTotal: int = Query(4, description="Total ICU Beds"),
    icuOccupied: int = Query(2, description="Currently Occupied ICU Beds"),
    emergencyTotal: int = Query(4, description="Total Emergency Beds"),
    emergencyOccupied: int = Query(2, description="Currently Occupied Emergency Beds"),
):
    """GET endpoint for easy integration and browser testing."""
    return forecaster.forecast_next_7_days(
        facility_id=facilityId,
        current_occupancy_rate=currentOccupancyRate,
        total_beds=totalBeds,
        occupied_beds=occupiedBeds,
        icu_total=icuTotal,
        icu_occupied=icuOccupied,
        emergency_total=emergencyTotal,
        emergency_occupied=emergencyOccupied,
    )


@app.post("/forecast")
def get_forecast_post(payload: ForecastRequest):
    """POST endpoint receiving full JSON parameters."""
    return forecaster.forecast_next_7_days(
        facility_id=payload.facilityId,
        current_occupancy_rate=payload.currentOccupancyRate or 65.0,
        total_beds=payload.totalBeds or 25,
        occupied_beds=payload.occupiedBeds or 16,
        icu_total=payload.icuTotal or 4,
        icu_occupied=payload.icuOccupied or 2,
        emergency_total=payload.emergencyTotal or 4,
        emergency_occupied=payload.emergencyOccupied or 2,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
