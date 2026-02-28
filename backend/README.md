# Backend for Smart BloodBank

This directory contains a simple Flask application that provides a REST API
for the frontend to consume.

## Setup

1. Create a virtual environment and activate it:

```bash
python -m venv venv
venv\Scripts\activate   # on Windows

# or
source venv/bin/activate  # on macOS / Linux
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the server:

```bash
python app.py
```

The API will be available at `http://localhost:5000`.

## Endpoints

- `GET /api/ping` – health check
- `GET /api/donors` – list donors
- `POST /api/donors` – add a donor (JSON body)
- `GET /api/receivers` – list receivers
- `POST /api/receivers` – add a receiver (JSON body)

Extend the application with your own models, database, and authentication as needed.
