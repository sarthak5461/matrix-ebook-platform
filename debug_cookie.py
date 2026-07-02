#!/usr/bin/env python3
"""Quick debug script to check cookie behavior"""

import requests
import time

BASE_URL = "http://localhost:3000/api"
TEST_EMAIL = f"debug_{int(time.time())}@example.com"

# Test registration
session = requests.Session()
payload = {
    "name": "Debug User",
    "email": TEST_EMAIL,
    "password": "DebugPass123"
}

print("=== REGISTRATION REQUEST ===")
response = session.post(f"{BASE_URL}/auth/register", json=payload)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
print(f"\n=== RESPONSE HEADERS ===")
for key, value in response.headers.items():
    print(f"{key}: {value}")

print(f"\n=== SESSION COOKIES ===")
print(f"Cookies in session: {session.cookies}")
for cookie in session.cookies:
    print(f"  {cookie.name} = {cookie.value[:20]}... (secure={cookie.secure}, domain={cookie.domain}, path={cookie.path})")

print(f"\n=== TESTING /auth/me ===")
me_response = session.get(f"{BASE_URL}/auth/me")
print(f"Status: {me_response.status_code}")
print(f"Response: {me_response.json()}")

print(f"\n=== REQUEST HEADERS SENT ===")
print(f"Cookie header: {me_response.request.headers.get('Cookie', 'NOT SENT')}")
