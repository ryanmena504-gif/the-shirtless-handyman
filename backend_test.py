import requests
import json
import sys
from datetime import datetime
import os

class AIRenovationAPITester:
    def __init__(self, base_url="https://design-reveal.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.contractor_id = None
        self.project_id = None
        self.lead_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def test_api_root(self):
        """Test root API endpoint"""
        try:
            response = requests.get(f"{self.base_url}/")
            success = response.status_code == 200
            return self.log_test("API Root", success, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("API Root", False, f"Error: {str(e)}")

    def test_seed_contractors(self):
        """Test seeding contractors"""
        try:
            response = requests.post(f"{self.base_url}/seed")
            success = response.status_code == 200
            data = response.json() if response.status_code == 200 else {}
            return self.log_test("Seed Contractors", success, f"Status: {response.status_code}, Message: {data.get('message', '')}")
        except Exception as e:
            return self.log_test("Seed Contractors", False, f"Error: {str(e)}")

    def test_contractor_register(self):
        """Test contractor registration"""
        try:
            timestamp = datetime.now().strftime("%H%M%S")
            payload = {
                "email": f"testcontractor_{timestamp}@example.com",
                "password": "testpass123",
                "company_name": f"Test Company {timestamp}",
                "specialties": ["Bathroom", "Kitchen"],
                "service_zip_codes": ["10001", "10002"],
                "phone": "(555) 123-4567",
                "description": "Test contractor for API testing"
            }
            
            response = requests.post(f"{self.base_url}/contractors/register", json=payload)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.token = data.get('token')
                self.contractor_id = data.get('contractor', {}).get('id')
                
            return self.log_test("Contractor Register", success, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Contractor Register", False, f"Error: {str(e)}")

    def test_contractor_login(self):
        """Test contractor login with seeded contractor"""
        try:
            payload = {
                "email": "info@elitebath.com",
                "password": "password123"
            }
            
            response = requests.post(f"{self.base_url}/contractors/login", json=payload)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.token = data.get('token')
                self.contractor_id = data.get('contractor', {}).get('id')
                
            return self.log_test("Contractor Login", success, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Contractor Login", False, f"Error: {str(e)}")

    def test_contractor_profile_get(self):
        """Test getting contractor profile"""
        if not self.token:
            return self.log_test("Get Contractor Profile", False, "No auth token available")
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{self.base_url}/contractors/me", headers=headers)
            success = response.status_code == 200
            
            return self.log_test("Get Contractor Profile", success, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Get Contractor Profile", False, f"Error: {str(e)}")

    def test_contractor_profile_update(self):
        """Test updating contractor profile"""
        if not self.token:
            return self.log_test("Update Contractor Profile", False, "No auth token available")
        
        try:
            payload = {
                "phone": "(555) 999-8888",
                "description": "Updated contractor description for testing"
            }
            
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.put(f"{self.base_url}/contractors/me", json=payload, headers=headers)
            success = response.status_code == 200
            
            return self.log_test("Update Contractor Profile", success, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Update Contractor Profile", False, f"Error: {str(e)}")

    def test_search_contractors(self):
        """Test contractor search by ZIP code"""
        try:
            response = requests.get(f"{self.base_url}/contractors/search?zip_code=10001")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                contractors = data.get('contractors', [])
                user_location = data.get('user_location', {})
                details = f"Found {len(contractors)} contractors, User location: {user_location}"
            else:
                details = f"Status: {response.status_code}"
                
            return self.log_test("Search Contractors", success, details)
        except Exception as e:
            return self.log_test("Search Contractors", False, f"Error: {str(e)}")

    def test_project_upload(self):
        """Test project upload - using small test image"""
        try:
            # Create a minimal test image data (1x1 pixel PNG)
            test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x02\x8c\xc2\xcb\x00\x00\x00\x00IEND\xaeB`\x82'
            
            files = {'photo': ('test.png', test_image_data, 'image/png')}
            data = {
                'zip_code': '10001',
                'project_type': 'Bathroom'
            }
            
            response = requests.post(f"{self.base_url}/projects/upload", files=files, data=data)
            success = response.status_code == 200
            
            if success:
                data_resp = response.json()
                self.project_id = data_resp.get('id')
                details = f"Project ID: {self.project_id}"
            else:
                details = f"Status: {response.status_code}"
                
            return self.log_test("Project Upload", success, details)
        except Exception as e:
            return self.log_test("Project Upload", False, f"Error: {str(e)}")

    def test_get_project(self):
        """Test getting project details"""
        if not self.project_id:
            return self.log_test("Get Project", False, "No project ID available")
        
        try:
            response = requests.get(f"{self.base_url}/projects/{self.project_id}")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Status: {data.get('status')}, Type: {data.get('project_type')}"
            else:
                details = f"Status: {response.status_code}"
                
            return self.log_test("Get Project", success, details)
        except Exception as e:
            return self.log_test("Get Project", False, f"Error: {str(e)}")

    def test_create_lead(self):
        """Test creating a lead"""
        try:
            payload = {
                "name": "Test Customer",
                "phone": "(555) 123-4567",
                "email": "testcustomer@example.com",
                "project_description": "Bathroom renovation test project",
                "zip_code": "10001",
                "project_id": self.project_id or "",
                "contractor_id": self.contractor_id or ""
            }
            
            response = requests.post(f"{self.base_url}/leads", json=payload)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.lead_id = data.get('id')
                details = f"Lead ID: {self.lead_id}, Status: {data.get('status')}"
            else:
                details = f"Status: {response.status_code}"
                
            return self.log_test("Create Lead", success, details)
        except Exception as e:
            return self.log_test("Create Lead", False, f"Error: {str(e)}")

    def test_get_leads(self):
        """Test getting leads for authenticated contractor"""
        if not self.token:
            return self.log_test("Get Contractor Leads", False, "No auth token available")
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{self.base_url}/leads/all", headers=headers)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                leads = data.get('leads', [])
                details = f"Found {len(leads)} leads"
            else:
                details = f"Status: {response.status_code}"
                
            return self.log_test("Get Contractor Leads", success, details)
        except Exception as e:
            return self.log_test("Get Contractor Leads", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🔍 Starting AI Renovation API Tests")
        print("=" * 50)
        
        # Basic API tests
        self.test_api_root()
        self.test_seed_contractors()
        
        # Contractor auth tests
        self.test_contractor_login()  # Use seeded contractor first
        self.test_contractor_profile_get()
        self.test_contractor_profile_update()
        self.test_contractor_register()  # Test new registration
        
        # Search and project tests
        self.test_search_contractors()
        self.test_project_upload()
        self.test_get_project()
        
        # Lead tests
        self.test_create_lead()
        self.test_get_leads()
        
        # Summary
        print("=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        print(f"🎯 Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = AIRenovationAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())