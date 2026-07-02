#!/usr/bin/env python3
"""
Comprehensive backend API test for Matrix Structural Analysis ebook platform.
Tests all endpoints with proper authentication flow and cookie management.
"""

import requests
import json
import time
from pymongo import MongoClient
import os

# Configuration
BASE_URL = "http://localhost:3000/api"
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "matrix_ebook")

# Test data
ADMIN_EMAIL = "admin@matrix.com"
ADMIN_PASSWORD = "Admin@123"
TEST_USER_EMAIL = f"testuser_{int(time.time())}@example.com"
TEST_USER_PASSWORD = "TestPass123"
TEST_USER_NAME = "Test User"

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_test(name):
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST: {name}{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")

def print_pass(msg):
    print(f"{GREEN}✓ PASS: {msg}{RESET}")

def print_fail(msg):
    print(f"{RED}✗ FAIL: {msg}{RESET}")

def print_info(msg):
    print(f"{YELLOW}ℹ INFO: {msg}{RESET}")

def get_mongo_client():
    """Get MongoDB client"""
    return MongoClient(MONGO_URL)

def get_reset_token_from_db(user_email):
    """Fetch the latest password reset token from MongoDB"""
    try:
        client = get_mongo_client()
        db = client[DB_NAME]
        users = db.users
        user = users.find_one({"email": user_email})
        if not user:
            return None
        
        resets = db.password_resets
        reset = resets.find_one(
            {"userId": user["id"], "used": False},
            sort=[("createdAt", -1)]
        )
        return reset["token"] if reset else None
    except Exception as e:
        print_fail(f"Error fetching reset token from DB: {e}")
        return None
    finally:
        client.close()

# Test Results Tracker
test_results = {
    "passed": 0,
    "failed": 0,
    "tests": []
}

def record_result(test_name, passed, details=""):
    """Record test result"""
    test_results["tests"].append({
        "name": test_name,
        "passed": passed,
        "details": details
    })
    if passed:
        test_results["passed"] += 1
    else:
        test_results["failed"] += 1

def print_summary():
    """Print test summary"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST SUMMARY{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    print(f"Total Tests: {test_results['passed'] + test_results['failed']}")
    print(f"{GREEN}Passed: {test_results['passed']}{RESET}")
    print(f"{RED}Failed: {test_results['failed']}{RESET}")
    
    if test_results["failed"] > 0:
        print(f"\n{RED}Failed Tests:{RESET}")
        for test in test_results["tests"]:
            if not test["passed"]:
                print(f"  {RED}✗ {test['name']}{RESET}")
                if test["details"]:
                    print(f"    {test['details']}")

# ============================================================================
# TEST 1: Health Check
# ============================================================================
def test_health():
    print_test("1. Health Check - GET /api/root")
    try:
        response = requests.get(f"{BASE_URL}/root", timeout=10)
        print_info(f"Status: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True:
                print_pass("Health check passed")
                record_result("Health Check", True)
                return True
            else:
                print_fail(f"Unexpected response: {data}")
                record_result("Health Check", False, f"Unexpected response: {data}")
                return False
        else:
            print_fail(f"Expected 200, got {response.status_code}")
            record_result("Health Check", False, f"Status {response.status_code}")
            return False
    except Exception as e:
        print_fail(f"Exception: {e}")
        record_result("Health Check", False, str(e))
        return False

# ============================================================================
# TEST 2: Auth Flow - Register
# ============================================================================
def test_register():
    print_test("2. Auth - Register New User")
    session = requests.Session()
    
    try:
        # Test successful registration
        payload = {
            "name": TEST_USER_NAME,
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        response = session.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
        print_info(f"Status: {response.status_code}")
        print_info(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            user = data.get("user")
            if user and user.get("email") == TEST_USER_EMAIL.lower():
                if user.get("purchasedBook") == False and user.get("role") == "user":
                    # Check if cookie is set
                    if "msa_token" in session.cookies:
                        print_pass("Registration successful with correct user data and cookie")
                        record_result("Register - Success", True)
                        
                        # Test duplicate registration
                        dup_response = session.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
                        if dup_response.status_code == 409:
                            print_pass("Duplicate registration correctly rejected with 409")
                            record_result("Register - Duplicate Check", True)
                        else:
                            print_fail(f"Duplicate registration should return 409, got {dup_response.status_code}")
                            record_result("Register - Duplicate Check", False, f"Status {dup_response.status_code}")
                        
                        return session, user
                    else:
                        print_fail("Cookie 'msa_token' not set")
                        record_result("Register - Success", False, "Cookie not set")
                else:
                    print_fail(f"User data incorrect: purchasedBook={user.get('purchasedBook')}, role={user.get('role')}")
                    record_result("Register - Success", False, "Incorrect user data")
            else:
                print_fail(f"User data missing or incorrect: {data}")
                record_result("Register - Success", False, "User data missing")
        else:
            print_fail(f"Expected 200, got {response.status_code}")
            record_result("Register - Success", False, f"Status {response.status_code}")
        
        return None, None
    except Exception as e:
        print_fail(f"Exception: {e}")
        record_result("Register - Success", False, str(e))
        return None, None

# ============================================================================
# TEST 3: Auth Flow - Me, Login, Logout
# ============================================================================
def test_auth_flow(session):
    print_test("3. Auth - Me, Login, Logout")
    
    if not session:
        print_fail("No session provided, skipping")
        return None
    
    try:
        # Test /auth/me
        response = session.get(f"{BASE_URL}/auth/me", timeout=10)
        print_info(f"GET /auth/me Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("user") and data["user"].get("email") == TEST_USER_EMAIL.lower():
                print_pass("/auth/me returns correct user")
                record_result("Auth - Me", True)
            else:
                print_fail(f"/auth/me returned unexpected data: {data}")
                record_result("Auth - Me", False, "Unexpected data")
        else:
            print_fail(f"/auth/me expected 200, got {response.status_code}")
            record_result("Auth - Me", False, f"Status {response.status_code}")
        
        # Test login with wrong password
        wrong_payload = {"email": TEST_USER_EMAIL, "password": "WrongPassword"}
        response = session.post(f"{BASE_URL}/auth/login", json=wrong_payload, timeout=10)
        print_info(f"Login with wrong password Status: {response.status_code}")
        
        if response.status_code == 401:
            print_pass("Login with wrong password correctly rejected with 401")
            record_result("Auth - Login Wrong Password", True)
        else:
            print_fail(f"Expected 401, got {response.status_code}")
            record_result("Auth - Login Wrong Password", False, f"Status {response.status_code}")
        
        # Test login with correct credentials
        correct_payload = {"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
        response = session.post(f"{BASE_URL}/auth/login", json=correct_payload, timeout=10)
        print_info(f"Login with correct credentials Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("user") and "msa_token" in session.cookies:
                print_pass("Login successful with correct credentials")
                record_result("Auth - Login Success", True)
            else:
                print_fail("Login response missing user or cookie")
                record_result("Auth - Login Success", False, "Missing user or cookie")
        else:
            print_fail(f"Expected 200, got {response.status_code}")
            record_result("Auth - Login Success", False, f"Status {response.status_code}")
        
        # Test logout
        response = session.post(f"{BASE_URL}/auth/logout", timeout=10)
        print_info(f"Logout Status: {response.status_code}")
        
        if response.status_code == 200:
            # Check /auth/me after logout
            me_response = session.get(f"{BASE_URL}/auth/me", timeout=10)
            me_data = me_response.json()
            if me_data.get("user") is None:
                print_pass("Logout successful, /auth/me returns null user")
                record_result("Auth - Logout", True)
            else:
                print_fail(f"/auth/me should return null user after logout, got: {me_data}")
                record_result("Auth - Logout", False, "User still present after logout")
        else:
            print_fail(f"Expected 200, got {response.status_code}")
            record_result("Auth - Logout", False, f"Status {response.status_code}")
        
        # Re-login for subsequent tests
        session.post(f"{BASE_URL}/auth/login", json=correct_payload, timeout=10)
        return session
        
    except Exception as e:
        print_fail(f"Exception: {e}")
        record_result("Auth Flow", False, str(e))
        return session

# ============================================================================
# TEST 4: Forgot/Reset Password
# ============================================================================
def test_forgot_reset_password():
    print_test("4. Forgot/Reset Password")
    
    try:
        # Test forgot password
        payload = {"email": TEST_USER_EMAIL}
        response = requests.post(f"{BASE_URL}/auth/forgot-password", json=payload, timeout=10)
        print_info(f"Forgot password Status: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        if response.status_code == 200:
            print_pass("Forgot password request successful")
            record_result("Forgot Password", True)
            
            # Fetch token from MongoDB
            time.sleep(1)  # Give DB time to write
            token = get_reset_token_from_db(TEST_USER_EMAIL)
            
            if token:
                print_info(f"Retrieved reset token from DB: {token[:20]}...")
                
                # Test reset with valid token
                new_password = "NewPass123"
                reset_payload = {"token": token, "password": new_password}
                reset_response = requests.post(f"{BASE_URL}/auth/reset-password", json=reset_payload, timeout=10)
                print_info(f"Reset password Status: {reset_response.status_code}")
                
                if reset_response.status_code == 200:
                    print_pass("Password reset successful")
                    record_result("Reset Password - Valid Token", True)
                    
                    # Test login with new password
                    login_payload = {"email": TEST_USER_EMAIL, "password": new_password}
                    login_response = requests.post(f"{BASE_URL}/auth/login", json=login_payload, timeout=10)
                    
                    if login_response.status_code == 200:
                        print_pass("Login with new password successful")
                        record_result("Reset Password - Login with New Password", True)
                    else:
                        print_fail(f"Login with new password failed: {login_response.status_code}")
                        record_result("Reset Password - Login with New Password", False, f"Status {login_response.status_code}")
                    
                    # Test reset with invalid token
                    invalid_reset = {"token": "invalid_token_xyz", "password": "AnotherPass123"}
                    invalid_response = requests.post(f"{BASE_URL}/auth/reset-password", json=invalid_reset, timeout=10)
                    
                    if invalid_response.status_code == 400:
                        print_pass("Invalid token correctly rejected with 400")
                        record_result("Reset Password - Invalid Token", True)
                    else:
                        print_fail(f"Invalid token should return 400, got {invalid_response.status_code}")
                        record_result("Reset Password - Invalid Token", False, f"Status {invalid_response.status_code}")
                else:
                    print_fail(f"Reset password failed: {reset_response.status_code}")
                    record_result("Reset Password - Valid Token", False, f"Status {reset_response.status_code}")
            else:
                print_fail("Could not retrieve reset token from DB")
                record_result("Reset Password - Token Retrieval", False, "Token not found in DB")
        else:
            print_fail(f"Expected 200, got {response.status_code}")
            record_result("Forgot Password", False, f"Status {response.status_code}")
            
    except Exception as e:
        print_fail(f"Exception: {e}")
        record_result("Forgot/Reset Password", False, str(e))

# ============================================================================
# TEST 5: Purchase Flow (MOCK)
# ============================================================================
def test_purchase_flow():
    print_test("5. Purchase Flow (MOCK Razorpay)")
    
    # Create a new user for purchase testing
    session = requests.Session()
    purchase_user_email = f"purchaseuser_{int(time.time())}@example.com"
    
    try:
        # Register new user
        reg_payload = {
            "name": "Purchase Test User",
            "email": purchase_user_email,
            "password": "PurchasePass123"
        }
        reg_response = session.post(f"{BASE_URL}/auth/register", json=reg_payload, timeout=10)
        
        if reg_response.status_code != 200:
            print_fail(f"Failed to register purchase test user: {reg_response.status_code}")
            record_result("Purchase Flow - User Registration", False, f"Status {reg_response.status_code}")
            return
        
        print_pass("Purchase test user registered")
        
        # Test reader access before purchase (should be 402)
        reader_response = session.get(f"{BASE_URL}/reader/info", timeout=10)
        print_info(f"Reader access before purchase Status: {reader_response.status_code}")
        
        if reader_response.status_code == 402:
            print_pass("Reader correctly blocked before purchase (402)")
            record_result("Purchase Flow - Reader Before Purchase", True)
        else:
            print_fail(f"Expected 402, got {reader_response.status_code}")
            record_result("Purchase Flow - Reader Before Purchase", False, f"Status {reader_response.status_code}")
        
        # Create order
        order_response = session.post(f"{BASE_URL}/payment/create-order", timeout=10)
        print_info(f"Create order Status: {order_response.status_code}")
        print_info(f"Response: {order_response.text}")
        
        if order_response.status_code == 200:
            order_data = order_response.json()
            if order_data.get("mock") == True and order_data.get("orderId"):
                print_pass("Order created successfully in MOCK mode")
                record_result("Purchase Flow - Create Order", True)
                
                order_id = order_data["orderId"]
                
                # Verify payment
                verify_payload = {
                    "razorpay_order_id": order_id,
                    "razorpay_payment_id": "pay_mock_test",
                    "razorpay_signature": "mock_signature"
                }
                verify_response = session.post(f"{BASE_URL}/payment/verify", json=verify_payload, timeout=10)
                print_info(f"Verify payment Status: {verify_response.status_code}")
                
                if verify_response.status_code == 200:
                    verify_data = verify_response.json()
                    if verify_data.get("ok") == True:
                        print_pass("Payment verified successfully")
                        record_result("Purchase Flow - Verify Payment", True)
                        
                        # Check user.purchasedBook is now true
                        me_response = session.get(f"{BASE_URL}/auth/me", timeout=10)
                        me_data = me_response.json()
                        
                        if me_data.get("user", {}).get("purchasedBook") == True:
                            print_pass("User purchasedBook flag set to true")
                            record_result("Purchase Flow - PurchasedBook Flag", True)
                        else:
                            print_fail(f"purchasedBook should be true, got: {me_data.get('user', {}).get('purchasedBook')}")
                            record_result("Purchase Flow - PurchasedBook Flag", False, "Flag not set")
                        
                        # Try to create order again (should fail with 400)
                        dup_order_response = session.post(f"{BASE_URL}/payment/create-order", timeout=10)
                        
                        if dup_order_response.status_code == 400:
                            print_pass("Duplicate order correctly rejected with 400")
                            record_result("Purchase Flow - Duplicate Order Check", True)
                        else:
                            print_fail(f"Duplicate order should return 400, got {dup_order_response.status_code}")
                            record_result("Purchase Flow - Duplicate Order Check", False, f"Status {dup_order_response.status_code}")
                    else:
                        print_fail(f"Verify response unexpected: {verify_data}")
                        record_result("Purchase Flow - Verify Payment", False, "Unexpected response")
                else:
                    print_fail(f"Verify payment failed: {verify_response.status_code}")
                    record_result("Purchase Flow - Verify Payment", False, f"Status {verify_response.status_code}")
            else:
                print_fail(f"Order response missing mock flag or orderId: {order_data}")
                record_result("Purchase Flow - Create Order", False, "Missing data")
        else:
            print_fail(f"Create order failed: {order_response.status_code}")
            record_result("Purchase Flow - Create Order", False, f"Status {order_response.status_code}")
            
    except Exception as e:
        print_fail(f"Exception: {e}")
        record_result("Purchase Flow", False, str(e))

# ============================================================================
# TEST 6: Reader Endpoints
# ============================================================================
def test_reader_endpoints():
    print_test("6. Reader Endpoints (Protected)")
    
    # Create a user with purchase
    session = requests.Session()
    reader_user_email = f"readeruser_{int(time.time())}@example.com"
    
    try:
        # Register and purchase
        reg_payload = {
            "name": "Reader Test User",
            "email": reader_user_email,
            "password": "ReaderPass123"
        }
        session.post(f"{BASE_URL}/auth/register", json=reg_payload, timeout=10)
        
        # Create and verify order
        order_response = session.post(f"{BASE_URL}/payment/create-order", timeout=10)
        if order_response.status_code == 200:
            order_id = order_response.json()["orderId"]
            verify_payload = {
                "razorpay_order_id": order_id,
                "razorpay_payment_id": "pay_mock",
                "razorpay_signature": "mock"
            }
            session.post(f"{BASE_URL}/payment/verify", json=verify_payload, timeout=10)
        
        # Test /reader/info
        info_response = session.get(f"{BASE_URL}/reader/info", timeout=10)
        print_info(f"Reader info Status: {info_response.status_code}")
        print_info(f"Response: {info_response.text}")
        
        if info_response.status_code == 200:
            info_data = info_response.json()
            if info_data.get("pageCount") == 10:
                print_pass("Reader info returns correct pageCount (10)")
                record_result("Reader - Info Endpoint", True)
            else:
                print_fail(f"Expected pageCount=10, got {info_data.get('pageCount')}")
                record_result("Reader - Info Endpoint", False, f"Wrong pageCount: {info_data.get('pageCount')}")
        else:
            print_fail(f"Reader info failed: {info_response.status_code}")
            record_result("Reader - Info Endpoint", False, f"Status {info_response.status_code}")
        
        # Test /reader/page/1
        page_response = session.get(f"{BASE_URL}/reader/page/1", timeout=10)
        print_info(f"Reader page/1 Status: {page_response.status_code}")
        print_info(f"Content-Type: {page_response.headers.get('Content-Type')}")
        
        if page_response.status_code == 200:
            content_type = page_response.headers.get('Content-Type', '')
            if 'application/pdf' in content_type:
                if page_response.content[:4] == b'%PDF':
                    print_pass("Reader page/1 returns valid PDF")
                    record_result("Reader - Page Endpoint", True)
                else:
                    print_fail("Response doesn't start with %PDF")
                    record_result("Reader - Page Endpoint", False, "Invalid PDF content")
            else:
                print_fail(f"Expected application/pdf, got {content_type}")
                record_result("Reader - Page Endpoint", False, f"Wrong content type: {content_type}")
        else:
            print_fail(f"Reader page/1 failed: {page_response.status_code}")
            record_result("Reader - Page Endpoint", False, f"Status {page_response.status_code}")
        
        # Test invalid page
        invalid_page_response = session.get(f"{BASE_URL}/reader/page/999", timeout=10)
        print_info(f"Reader page/999 Status: {invalid_page_response.status_code}")
        
        if invalid_page_response.status_code == 400:
            print_pass("Invalid page correctly rejected with 400")
            record_result("Reader - Invalid Page", True)
        else:
            print_fail(f"Expected 400, got {invalid_page_response.status_code}")
            record_result("Reader - Invalid Page", False, f"Status {invalid_page_response.status_code}")
        
        # Test without auth
        no_auth_session = requests.Session()
        no_auth_response = no_auth_session.get(f"{BASE_URL}/reader/info", timeout=10)
        print_info(f"Reader without auth Status: {no_auth_response.status_code}")
        
        if no_auth_response.status_code == 401:
            print_pass("Reader without auth correctly rejected with 401")
            record_result("Reader - No Auth", True)
        else:
            print_fail(f"Expected 401, got {no_auth_response.status_code}")
            record_result("Reader - No Auth", False, f"Status {no_auth_response.status_code}")
        
        # Test with auth but no purchase
        no_purchase_session = requests.Session()
        no_purchase_email = f"nopurchase_{int(time.time())}@example.com"
        no_purchase_payload = {
            "name": "No Purchase User",
            "email": no_purchase_email,
            "password": "NoPass123"
        }
        no_purchase_session.post(f"{BASE_URL}/auth/register", json=no_purchase_payload, timeout=10)
        no_purchase_response = no_purchase_session.get(f"{BASE_URL}/reader/info", timeout=10)
        print_info(f"Reader with auth but no purchase Status: {no_purchase_response.status_code}")
        
        if no_purchase_response.status_code == 402:
            print_pass("Reader with auth but no purchase correctly rejected with 402")
            record_result("Reader - No Purchase", True)
        else:
            print_fail(f"Expected 402, got {no_purchase_response.status_code}")
            record_result("Reader - No Purchase", False, f"Status {no_purchase_response.status_code}")
            
    except Exception as e:
        print_fail(f"Exception: {e}")
        record_result("Reader Endpoints", False, str(e))

# ============================================================================
# TEST 7: Admin Endpoints
# ============================================================================
def test_admin_endpoints():
    print_test("7. Admin Endpoints")
    
    # Login as admin
    admin_session = requests.Session()
    admin_payload = {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    
    try:
        admin_login = admin_session.post(f"{BASE_URL}/auth/login", json=admin_payload, timeout=10)
        
        if admin_login.status_code != 200:
            print_fail(f"Admin login failed: {admin_login.status_code}")
            record_result("Admin - Login", False, f"Status {admin_login.status_code}")
            return
        
        print_pass("Admin logged in successfully")
        
        # Test /admin/stats
        stats_response = admin_session.get(f"{BASE_URL}/admin/stats", timeout=10)
        print_info(f"Admin stats Status: {stats_response.status_code}")
        print_info(f"Response: {stats_response.text}")
        
        if stats_response.status_code == 200:
            stats_data = stats_response.json()
            if "totalUsers" in stats_data and "totalPurchases" in stats_data and "totalRevenue" in stats_data:
                print_pass("Admin stats returns correct data")
                record_result("Admin - Stats", True)
            else:
                print_fail(f"Stats missing required fields: {stats_data}")
                record_result("Admin - Stats", False, "Missing fields")
        else:
            print_fail(f"Admin stats failed: {stats_response.status_code}")
            record_result("Admin - Stats", False, f"Status {stats_response.status_code}")
        
        # Test /admin/users
        users_response = admin_session.get(f"{BASE_URL}/admin/users", timeout=10)
        print_info(f"Admin users Status: {users_response.status_code}")
        
        if users_response.status_code == 200:
            users_data = users_response.json()
            if "users" in users_data and isinstance(users_data["users"], list):
                print_pass("Admin users returns list")
                record_result("Admin - Users", True)
            else:
                print_fail(f"Users response unexpected: {users_data}")
                record_result("Admin - Users", False, "Unexpected format")
        else:
            print_fail(f"Admin users failed: {users_response.status_code}")
            record_result("Admin - Users", False, f"Status {users_response.status_code}")
        
        # Test /admin/purchases
        purchases_response = admin_session.get(f"{BASE_URL}/admin/purchases", timeout=10)
        print_info(f"Admin purchases Status: {purchases_response.status_code}")
        
        if purchases_response.status_code == 200:
            purchases_data = purchases_response.json()
            if "purchases" in purchases_data and isinstance(purchases_data["purchases"], list):
                # Check if purchases have userName and userEmail
                if len(purchases_data["purchases"]) > 0:
                    first_purchase = purchases_data["purchases"][0]
                    if "userName" in first_purchase and "userEmail" in first_purchase:
                        print_pass("Admin purchases returns enriched data with userName/userEmail")
                        record_result("Admin - Purchases", True)
                    else:
                        print_fail("Purchases missing userName/userEmail")
                        record_result("Admin - Purchases", False, "Missing user fields")
                else:
                    print_pass("Admin purchases returns list (empty)")
                    record_result("Admin - Purchases", True)
            else:
                print_fail(f"Purchases response unexpected: {purchases_data}")
                record_result("Admin - Purchases", False, "Unexpected format")
        else:
            print_fail(f"Admin purchases failed: {purchases_response.status_code}")
            record_result("Admin - Purchases", False, f"Status {purchases_response.status_code}")
        
        # Test /admin/export.csv
        csv_response = admin_session.get(f"{BASE_URL}/admin/export.csv", timeout=10)
        print_info(f"Admin export.csv Status: {csv_response.status_code}")
        print_info(f"Content-Type: {csv_response.headers.get('Content-Type')}")
        
        if csv_response.status_code == 200:
            content_type = csv_response.headers.get('Content-Type', '')
            if 'text/csv' in content_type:
                csv_content = csv_response.text
                if csv_content.startswith('"PurchaseID"'):
                    print_pass("Admin export.csv returns valid CSV with header")
                    record_result("Admin - CSV Export", True)
                else:
                    print_fail(f"CSV doesn't start with expected header, got: {csv_content[:100]}")
                    record_result("Admin - CSV Export", False, "Invalid header")
            else:
                print_fail(f"Expected text/csv, got {content_type}")
                record_result("Admin - CSV Export", False, f"Wrong content type: {content_type}")
        else:
            print_fail(f"Admin export.csv failed: {csv_response.status_code}")
            record_result("Admin - CSV Export", False, f"Status {csv_response.status_code}")
        
        # Test admin endpoints as non-admin user
        user_session = requests.Session()
        user_email = f"normaluser_{int(time.time())}@example.com"
        user_payload = {
            "name": "Normal User",
            "email": user_email,
            "password": "NormalPass123"
        }
        user_session.post(f"{BASE_URL}/auth/register", json=user_payload, timeout=10)
        
        forbidden_response = user_session.get(f"{BASE_URL}/admin/stats", timeout=10)
        print_info(f"Admin stats as non-admin Status: {forbidden_response.status_code}")
        
        if forbidden_response.status_code == 403:
            print_pass("Admin endpoints correctly reject non-admin with 403")
            record_result("Admin - Non-Admin Access", True)
        else:
            print_fail(f"Expected 403, got {forbidden_response.status_code}")
            record_result("Admin - Non-Admin Access", False, f"Status {forbidden_response.status_code}")
            
    except Exception as e:
        print_fail(f"Exception: {e}")
        record_result("Admin Endpoints", False, str(e))

# ============================================================================
# TEST 8: Contact Form
# ============================================================================
def test_contact():
    print_test("8. Contact Form")
    
    try:
        # Test successful contact submission
        payload = {
            "name": "John Doe",
            "email": "john@example.com",
            "message": "This is a test message"
        }
        response = requests.post(f"{BASE_URL}/contact", json=payload, timeout=10)
        print_info(f"Contact Status: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True:
                print_pass("Contact form submission successful")
                record_result("Contact - Success", True)
            else:
                print_fail(f"Unexpected response: {data}")
                record_result("Contact - Success", False, "Unexpected response")
        else:
            print_fail(f"Expected 200, got {response.status_code}")
            record_result("Contact - Success", False, f"Status {response.status_code}")
        
        # Test with missing fields
        incomplete_payload = {"name": "John Doe", "email": "john@example.com"}
        incomplete_response = requests.post(f"{BASE_URL}/contact", json=incomplete_payload, timeout=10)
        print_info(f"Contact with missing fields Status: {incomplete_response.status_code}")
        
        if incomplete_response.status_code == 400:
            print_pass("Contact with missing fields correctly rejected with 400")
            record_result("Contact - Missing Fields", True)
        else:
            print_fail(f"Expected 400, got {incomplete_response.status_code}")
            record_result("Contact - Missing Fields", False, f"Status {incomplete_response.status_code}")
            
    except Exception as e:
        print_fail(f"Exception: {e}")
        record_result("Contact Form", False, str(e))

# ============================================================================
# MAIN TEST RUNNER
# ============================================================================
def main():
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}Matrix Structural Analysis - Backend API Test Suite{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    print(f"Base URL: {BASE_URL}")
    print(f"MongoDB: {MONGO_URL}/{DB_NAME}")
    
    # Run all tests
    test_health()
    session, user = test_register()
    test_auth_flow(session)
    test_forgot_reset_password()
    test_purchase_flow()
    test_reader_endpoints()
    test_admin_endpoints()
    test_contact()
    
    # Print summary
    print_summary()
    
    # Exit with appropriate code
    if test_results["failed"] > 0:
        exit(1)
    else:
        exit(0)

if __name__ == "__main__":
    main()
