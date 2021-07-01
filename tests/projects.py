import unittest
from . import BaseCase, APITestCase

def main(client):
    suite = unittest.TestSuite()
    # Sign-Up API Tests
    endpoint = '/sign-up'
    suite.addTest(BaseCase.parameters(APITestCase, endpoint=endpoint, method='POST', response='Account created successfully!', status_code=200, data=dict(username='admin', password='password', email='admin@mail.com'), data_type='form', client=client))

    unittest.TextTestRunner(verbosity=2).run(suite)