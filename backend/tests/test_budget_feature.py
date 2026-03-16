"""
Test Suite for Budget Feature in AI Renovation Visualizer
Tests the budget field implementation from API upload through storage
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test image (1x1 PNG)
TEST_IMAGE_DATA = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82'


class TestBudgetFeature:
    """Tests for the new budget field feature"""
    
    # Test 1: Verify API accepts budget field in upload
    def test_upload_with_budget_under_5k(self):
        """Test project upload with 'under_5k' budget option"""
        files = {'photo': ('test.png', io.BytesIO(TEST_IMAGE_DATA), 'image/png')}
        data = {
            'zip_code': '10001',
            'project_type': 'Bathroom',
            'budget': 'under_5k'
        }
        response = requests.post(f"{BASE_URL}/api/projects/upload", files=files, data=data)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        result = response.json()
        
        # Verify budget is returned in response
        assert 'id' in result, "Response should contain project id"
        assert 'budget' in result, "Response should contain budget field"
        assert result['budget'] == 'under_5k', f"Budget should be 'under_5k', got '{result['budget']}'"
        
        # Store project id for retrieval test
        self.__class__.project_id_under_5k = result['id']
        print(f"Created project with budget 'under_5k': {result['id']}")
    
    def test_upload_with_budget_5k_10k(self):
        """Test project upload with '5k_10k' budget option"""
        files = {'photo': ('test.png', io.BytesIO(TEST_IMAGE_DATA), 'image/png')}
        data = {
            'zip_code': '90210',
            'project_type': 'Kitchen',
            'budget': '5k_10k'
        }
        response = requests.post(f"{BASE_URL}/api/projects/upload", files=files, data=data)
        
        assert response.status_code == 200
        result = response.json()
        assert result['budget'] == '5k_10k'
        self.__class__.project_id_5k_10k = result['id']
        print(f"Created project with budget '5k_10k': {result['id']}")
    
    def test_upload_with_budget_10k_20k(self):
        """Test project upload with '10k_20k' budget option"""
        files = {'photo': ('test.png', io.BytesIO(TEST_IMAGE_DATA), 'image/png')}
        data = {
            'zip_code': '94102',
            'project_type': 'Shower',
            'budget': '10k_20k'
        }
        response = requests.post(f"{BASE_URL}/api/projects/upload", files=files, data=data)
        
        assert response.status_code == 200
        result = response.json()
        assert result['budget'] == '10k_20k'
        self.__class__.project_id_10k_20k = result['id']
        print(f"Created project with budget '10k_20k': {result['id']}")
    
    def test_upload_with_budget_20k_plus(self):
        """Test project upload with '20k_plus' budget option"""
        files = {'photo': ('test.png', io.BytesIO(TEST_IMAGE_DATA), 'image/png')}
        data = {
            'zip_code': '33101',
            'project_type': 'Pool Deck',
            'budget': '20k_plus'
        }
        response = requests.post(f"{BASE_URL}/api/projects/upload", files=files, data=data)
        
        assert response.status_code == 200
        result = response.json()
        assert result['budget'] == '20k_plus'
        self.__class__.project_id_20k_plus = result['id']
        print(f"Created project with budget '20k_plus': {result['id']}")
    
    # Test 2: Verify GET returns budget field
    def test_get_project_returns_budget(self):
        """Test that GET /api/projects/{project_id} returns the budget field"""
        project_id = getattr(self.__class__, 'project_id_under_5k', None)
        if not project_id:
            pytest.skip("No project_id available from previous test")
        
        response = requests.get(f"{BASE_URL}/api/projects/{project_id}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        result = response.json()
        
        # Verify budget is persisted in database
        assert 'budget' in result, "GET response should contain budget field"
        assert result['budget'] == 'under_5k', f"Budget should be 'under_5k', got '{result.get('budget')}'"
        assert 'project_type' in result, "Response should have project_type"
        assert 'zip_code' in result, "Response should have zip_code"
        assert 'status' in result, "Response should have status"
        print(f"GET project verified budget field: {result['budget']}")
    
    def test_get_project_with_5k_10k_budget(self):
        """Verify persistence of 5k_10k budget"""
        project_id = getattr(self.__class__, 'project_id_5k_10k', None)
        if not project_id:
            pytest.skip("No project_id available")
        
        response = requests.get(f"{BASE_URL}/api/projects/{project_id}")
        assert response.status_code == 200
        result = response.json()
        assert result['budget'] == '5k_10k', f"Expected '5k_10k', got '{result.get('budget')}'"
        print(f"Verified 5k_10k budget persistence")
    
    def test_get_project_with_10k_20k_budget(self):
        """Verify persistence of 10k_20k budget"""
        project_id = getattr(self.__class__, 'project_id_10k_20k', None)
        if not project_id:
            pytest.skip("No project_id available")
        
        response = requests.get(f"{BASE_URL}/api/projects/{project_id}")
        assert response.status_code == 200
        result = response.json()
        assert result['budget'] == '10k_20k', f"Expected '10k_20k', got '{result.get('budget')}'"
        print(f"Verified 10k_20k budget persistence")
    
    def test_get_project_with_20k_plus_budget(self):
        """Verify persistence of 20k_plus budget"""
        project_id = getattr(self.__class__, 'project_id_20k_plus', None)
        if not project_id:
            pytest.skip("No project_id available")
        
        response = requests.get(f"{BASE_URL}/api/projects/{project_id}")
        assert response.status_code == 200
        result = response.json()
        assert result['budget'] == '20k_plus', f"Expected '20k_plus', got '{result.get('budget')}'"
        print(f"Verified 20k_plus budget persistence")


class TestBudgetValidation:
    """Tests for budget field validation scenarios"""
    
    def test_api_root_health(self):
        """Verify API is accessible"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        print(f"API health check passed")
    
    def test_upload_missing_budget_returns_422(self):
        """Test that upload without budget returns validation error"""
        files = {'photo': ('test.png', io.BytesIO(TEST_IMAGE_DATA), 'image/png')}
        data = {
            'zip_code': '10001',
            'project_type': 'Bathroom'
            # Missing budget
        }
        response = requests.post(f"{BASE_URL}/api/projects/upload", files=files, data=data)
        
        # FastAPI should return 422 for missing required field
        assert response.status_code == 422, f"Expected 422 for missing budget, got {response.status_code}"
        print("Missing budget validation works correctly (422)")
    
    def test_project_response_schema(self):
        """Verify project response contains all expected fields"""
        files = {'photo': ('test.png', io.BytesIO(TEST_IMAGE_DATA), 'image/png')}
        data = {
            'zip_code': '10001',
            'project_type': 'Patio',
            'budget': 'under_5k'
        }
        response = requests.post(f"{BASE_URL}/api/projects/upload", files=files, data=data)
        
        assert response.status_code == 200
        result = response.json()
        
        # Check all expected fields in response
        expected_fields = ['id', 'project_type', 'zip_code', 'budget', 'status', 'created_at']
        for field in expected_fields:
            assert field in result, f"Missing field '{field}' in response"
        
        print(f"Response schema verified with all expected fields: {list(result.keys())}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
