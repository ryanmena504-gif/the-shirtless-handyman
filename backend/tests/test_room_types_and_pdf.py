"""
Tests for expanded room types and materials list PDF feature
"""
import pytest
import requests
import os
import sys

# Add backend to path for imports
sys.path.insert(0, '/app/backend')

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test room types covering all 14 categories
ALL_ROOM_TYPES = [
    # Interior Rooms (6)
    "Bathroom", "Kitchen", "Living Room", "Bedroom", "Kids Room", "Home Office",
    # Functional Rooms (4)
    "Garage", "Laundry Room", "Basement", "Mudroom",
    # Outdoor Areas (4)
    "Patio", "Pool Deck", "Backyard", "Outdoor Kitchen"
]

@pytest.fixture
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestAPIHealth:
    """Basic API health tests"""
    
    def test_api_health(self, api_client):
        """Test API is running"""
        response = api_client.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"API Health: {data}")


class TestCostEstimator:
    """Tests for cost estimator with all 14 room types"""
    
    def test_all_room_types_have_base_costs(self):
        """Test that all 14 room types have base cost definitions"""
        from cost_estimator import BASE_COSTS
        for room_type in ALL_ROOM_TYPES:
            assert room_type in BASE_COSTS, f"{room_type} missing from BASE_COSTS"
            assert "labor" in BASE_COSTS[room_type]
            assert "material" in BASE_COSTS[room_type]
            print(f"PASS: {room_type} has base costs defined")
    
    def test_cost_estimator_bathroom(self):
        """Test cost estimate for Bathroom (Interior)"""
        from cost_estimator import estimate_cost
        cost = estimate_cost("Bathroom", "10001")
        assert "labor_low" in cost
        assert "labor_high" in cost
        assert "material_low" in cost
        assert "material_high" in cost
        assert cost["project_type"] == "Bathroom"
        print(f"Bathroom cost estimate: ${cost['total_low']} - ${cost['total_high']}")
    
    def test_cost_estimator_living_room(self):
        """Test cost estimate for Living Room (Interior)"""
        from cost_estimator import estimate_cost
        cost = estimate_cost("Living Room", "90210")
        assert "labor_low" in cost
        assert cost["project_type"] == "Living Room"
        print(f"Living Room cost estimate: ${cost['total_low']} - ${cost['total_high']}")
    
    def test_cost_estimator_garage(self):
        """Test cost estimate for Garage (Functional)"""
        from cost_estimator import estimate_cost
        cost = estimate_cost("Garage", "60601")
        assert "labor_low" in cost
        assert cost["project_type"] == "Garage"
        print(f"Garage cost estimate: ${cost['total_low']} - ${cost['total_high']}")
    
    def test_cost_estimator_backyard(self):
        """Test cost estimate for Backyard (Outdoor)"""
        from cost_estimator import estimate_cost
        cost = estimate_cost("Backyard", "33101")
        assert "labor_low" in cost
        assert cost["project_type"] == "Backyard"
        print(f"Backyard cost estimate: ${cost['total_low']} - ${cost['total_high']}")
    
    def test_cost_estimator_outdoor_kitchen(self):
        """Test cost estimate for Outdoor Kitchen (Outdoor)"""
        from cost_estimator import estimate_cost
        cost = estimate_cost("Outdoor Kitchen", "70112")
        assert "labor_low" in cost
        assert cost["project_type"] == "Outdoor Kitchen"
        print(f"Outdoor Kitchen cost estimate: ${cost['total_low']} - ${cost['total_high']}")


class TestStylePrompts:
    """Tests to verify STYLE_PROMPTS has all 14 room types"""
    
    def test_all_room_types_have_style_prompts(self):
        """Test that all 14 room types have style prompts defined"""
        with open('/app/backend/server.py', 'r') as f:
            content = f.read()
        
        for room_type in ALL_ROOM_TYPES:
            assert f'"{room_type}"' in content or f"'{room_type}'" in content, \
                f"{room_type} missing from STYLE_PROMPTS"
            print(f"PASS: {room_type} found in STYLE_PROMPTS")


class TestContractorAndLeadAPI:
    """Tests for contractors and leads"""
    
    def test_contractors_search(self, api_client):
        """Test contractor search API"""
        response = api_client.get(f"{BASE_URL}/api/contractors/search?zip_code=70112")
        assert response.status_code == 200
        data = response.json()
        assert "contractors" in data
        assert "user_location" in data
        print(f"Found {len(data['contractors'])} contractors in New Orleans area")
    
    def test_lead_creation(self, api_client):
        """Test creating a lead"""
        lead_data = {
            "name": "TEST_PDF_Feature",
            "phone": "555-123-4567",
            "email": "test_pdf@example.com",
            "zip_code": "70112",
            "project_description": "Testing PDF feature for Living Room renovation",
            "selected_design_style": "Modern Luxe Living"
        }
        response = api_client.post(f"{BASE_URL}/api/leads", json=lead_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["status"] == "new"
        print(f"Lead created successfully: {data['id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
