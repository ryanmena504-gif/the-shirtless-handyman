"""
Test suite for new features:
1. Multi-image upload (2-3 pics) with primary selection
2. Contractor search with is_suggested flag
3. Easter egg: ZIP 70123 returns 'The Shirtless Handyman'
4. Portfolio CRUD (admin and public)
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test image (1x1 red pixel PNG)
TEST_IMAGE_B64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
TEST_IMAGE_BYTES = base64.b64decode(TEST_IMAGE_B64)


class TestMultiImageUpload:
    """Test multi-image upload functionality"""

    def test_single_image_upload(self):
        """Test uploading a single image works"""
        files = {
            'photo': ('test.png', TEST_IMAGE_BYTES, 'image/png'),
        }
        data = {
            'zip_code': '70112',
            'project_type': 'Bathroom',
            'budget': '10k_20k',
            'primary_index': '0',
        }
        response = requests.post(f"{BASE_URL}/api/projects/upload", files=files, data=data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        result = response.json()
        assert 'id' in result
        assert result['project_type'] == 'Bathroom'
        assert result['zip_code'] == '70112'
        assert result['budget'] == '10k_20k'
        print(f"PASS: Single image upload - project ID: {result['id']}")

    def test_multi_image_upload_two_photos(self):
        """Test uploading 2 images with primary selection"""
        files = [
            ('photo', ('primary.png', TEST_IMAGE_BYTES, 'image/png')),
            ('additional_photos', ('extra1.png', TEST_IMAGE_BYTES, 'image/png')),
        ]
        data = {
            'zip_code': '70113',
            'project_type': 'Kitchen',
            'budget': '5k_10k',
            'primary_index': '0',
        }
        response = requests.post(f"{BASE_URL}/api/projects/upload", files=files, data=data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        result = response.json()
        assert 'id' in result
        project_id = result['id']
        
        # Verify project has additional_images
        get_response = requests.get(f"{BASE_URL}/api/projects/{project_id}")
        assert get_response.status_code == 200
        project = get_response.json()
        assert 'additional_images' in project
        assert len(project['additional_images']) == 1, f"Expected 1 additional image, got {len(project.get('additional_images', []))}"
        print(f"PASS: Multi-image upload (2 photos) - project ID: {project_id}, additional_images: {len(project['additional_images'])}")

    def test_multi_image_upload_three_photos(self):
        """Test uploading 3 images (max allowed)"""
        files = [
            ('photo', ('primary.png', TEST_IMAGE_BYTES, 'image/png')),
            ('additional_photos', ('extra1.png', TEST_IMAGE_BYTES, 'image/png')),
            ('additional_photos', ('extra2.png', TEST_IMAGE_BYTES, 'image/png')),
        ]
        data = {
            'zip_code': '70114',
            'project_type': 'Living Room',
            'budget': '20k_plus',
            'primary_index': '0',
        }
        response = requests.post(f"{BASE_URL}/api/projects/upload", files=files, data=data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        result = response.json()
        project_id = result['id']
        
        # Verify project has 2 additional images
        get_response = requests.get(f"{BASE_URL}/api/projects/{project_id}")
        assert get_response.status_code == 200
        project = get_response.json()
        assert len(project.get('additional_images', [])) == 2, f"Expected 2 additional images, got {len(project.get('additional_images', []))}"
        print(f"PASS: Multi-image upload (3 photos) - project ID: {project_id}, additional_images: {len(project['additional_images'])}")


class TestContractorSearch:
    """Test contractor search with is_suggested flag and easter egg"""

    def test_contractor_search_returns_is_suggested(self):
        """Test that first contractor has is_suggested=true"""
        # First ensure seed data exists
        requests.post(f"{BASE_URL}/api/seed")
        
        response = requests.get(f"{BASE_URL}/api/contractors/search?zip_code=70112&project_type=Bathroom")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        result = response.json()
        assert 'contractors' in result
        contractors = result['contractors']
        assert len(contractors) > 0, "Expected at least one contractor"
        
        # First contractor should have is_suggested=true
        assert contractors[0].get('is_suggested') is True, f"First contractor should have is_suggested=true, got {contractors[0].get('is_suggested')}"
        print(f"PASS: Contractor search returns is_suggested=true on first contractor: {contractors[0]['company_name']}")

    def test_easter_egg_zip_70123_shirtless_handyman(self):
        """Test that ZIP 70123 returns 'The Shirtless Handyman' as first result"""
        response = requests.get(f"{BASE_URL}/api/contractors/search?zip_code=70123")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        result = response.json()
        contractors = result['contractors']
        assert len(contractors) > 0, "Expected at least one contractor"
        
        first_contractor = contractors[0]
        assert first_contractor['company_name'] == "The Shirtless Handyman", f"Expected 'The Shirtless Handyman', got {first_contractor['company_name']}"
        assert first_contractor.get('is_easter_egg') is True, "Expected is_easter_egg=true"
        assert first_contractor.get('is_suggested') is True, "Expected is_suggested=true"
        print(f"PASS: Easter egg ZIP 70123 returns 'The Shirtless Handyman' with is_easter_egg=true")

    def test_regular_zip_no_easter_egg(self):
        """Test that regular ZIP (70112) does NOT return easter egg contractor"""
        response = requests.get(f"{BASE_URL}/api/contractors/search?zip_code=70112")
        assert response.status_code == 200
        result = response.json()
        contractors = result['contractors']
        
        # Check that no contractor has is_easter_egg=true
        for c in contractors:
            assert c.get('is_easter_egg') != True, f"Contractor {c['company_name']} should not have is_easter_egg for ZIP 70112"
        
        # Also verify first contractor is NOT 'The Shirtless Handyman'
        if contractors:
            assert contractors[0]['company_name'] != "The Shirtless Handyman", "Regular ZIP should not return Shirtless Handyman first"
        print(f"PASS: Regular ZIP 70112 does NOT return easter egg contractor")


class TestPortfolioCRUD:
    """Test portfolio CRUD operations"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": "renovate2024admin"})
        if response.status_code == 200:
            return response.json().get('token')
        pytest.skip("Admin login failed")

    def test_admin_login(self):
        """Test admin login works"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": "renovate2024admin"})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        result = response.json()
        assert 'token' in result
        assert result.get('role') == 'admin'
        print(f"PASS: Admin login successful")

    def test_admin_portfolio_upload(self, admin_token):
        """Test admin can upload portfolio item"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        files = {
            'before_photo': ('before.png', TEST_IMAGE_BYTES, 'image/png'),
            'after_photo': ('after.png', TEST_IMAGE_BYTES, 'image/png'),
        }
        data = {
            'title': 'Test Bathroom Remodel',
            'description': 'A beautiful bathroom transformation',
            'room_type': 'Bathroom',
        }
        response = requests.post(f"{BASE_URL}/api/admin/portfolio", files=files, data=data, headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        result = response.json()
        assert 'id' in result
        assert result.get('message') == 'Portfolio item added'
        print(f"PASS: Admin portfolio upload - item ID: {result['id']}")
        return result['id']

    def test_admin_get_portfolio(self, admin_token):
        """Test admin can get portfolio items"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/portfolio", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        result = response.json()
        assert 'items' in result
        assert 'total' in result
        print(f"PASS: Admin get portfolio - {result['total']} items")

    def test_public_portfolio_api(self):
        """Test public portfolio API returns items"""
        response = requests.get(f"{BASE_URL}/api/portfolio")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        result = response.json()
        assert 'items' in result
        print(f"PASS: Public portfolio API - {len(result['items'])} items")

    def test_admin_delete_portfolio(self, admin_token):
        """Test admin can delete portfolio item"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # First upload an item to delete
        files = {
            'before_photo': ('before.png', TEST_IMAGE_BYTES, 'image/png'),
            'after_photo': ('after.png', TEST_IMAGE_BYTES, 'image/png'),
        }
        data = {
            'title': 'Item to Delete',
            'description': 'This will be deleted',
            'room_type': 'Kitchen',
        }
        upload_response = requests.post(f"{BASE_URL}/api/admin/portfolio", files=files, data=data, headers=headers)
        assert upload_response.status_code == 200
        item_id = upload_response.json()['id']
        
        # Now delete it
        delete_response = requests.delete(f"{BASE_URL}/api/admin/portfolio/{item_id}", headers=headers)
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}: {delete_response.text}"
        result = delete_response.json()
        assert result.get('message') == 'Portfolio item deleted'
        
        # Verify it's gone from public API
        public_response = requests.get(f"{BASE_URL}/api/portfolio")
        items = public_response.json().get('items', [])
        item_ids = [i['id'] for i in items]
        assert item_id not in item_ids, "Deleted item should not appear in public portfolio"
        print(f"PASS: Admin delete portfolio - item {item_id} deleted and verified")

    def test_portfolio_requires_admin_auth(self):
        """Test that portfolio upload requires admin auth"""
        files = {
            'before_photo': ('before.png', TEST_IMAGE_BYTES, 'image/png'),
            'after_photo': ('after.png', TEST_IMAGE_BYTES, 'image/png'),
        }
        data = {'title': 'Unauthorized Upload'}
        
        # Without auth
        response = requests.post(f"{BASE_URL}/api/admin/portfolio", files=files, data=data)
        assert response.status_code in [401, 403, 422], f"Expected 401/403/422 without auth, got {response.status_code}"
        print(f"PASS: Portfolio upload requires admin auth (got {response.status_code})")


class TestAdminStats:
    """Test admin stats include portfolio count"""
    
    def test_admin_stats_includes_portfolio(self):
        """Test admin stats endpoint includes total_portfolio"""
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": "renovate2024admin"})
        assert login_response.status_code == 200
        token = login_response.json()['token']
        
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        result = response.json()
        
        assert 'total_portfolio' in result, "Admin stats should include total_portfolio"
        assert isinstance(result['total_portfolio'], int)
        print(f"PASS: Admin stats includes total_portfolio: {result['total_portfolio']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
