import unittest

from fastapi.testclient import TestClient

from backend.main import app


class AccessControlTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_tasks_requires_auth(self):
        response = self.client.get('/api/v1/tasks')
        self.assertEqual(response.status_code, 401)

    def test_admin_tasks_require_admin_role(self):
        self.client.post('/api/auth/login', json={'username': 'tms_engineer', 'password': 'ir_password_2026'})
        response = self.client.get('/api/v1/admin/tasks')
        self.assertEqual(response.status_code, 403)


if __name__ == '__main__':
    unittest.main()
