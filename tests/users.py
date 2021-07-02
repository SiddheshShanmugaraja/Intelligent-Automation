import unittest
from . import BaseCase, APITestCase

def main(client):
    suite = unittest.TestSuite()
    # Sign-Up API Tests
    endpoint = '/sign-up'
    suite.addTest(BaseCase.parameters(APITestCase, endpoint=endpoint, method='POST', response='Account created successfully!', status_code=200, data=dict(username='admin', password='password', email='admin@mail.com'), data_type='form', client=client))
    suite.addTest(BaseCase.parameters(APITestCase, endpoint=endpoint, method='POST', response='Email already exists!', status_code=201, data=dict(username='admin1', password='password', email='admin@mail.com'), data_type='form', client=client))
    suite.addTest(BaseCase.parameters(APITestCase, endpoint=endpoint, method='POST', response='Username already exists!', status_code=201, data=dict(username='admin', password='password', email='admin@email.com'), data_type='form', client=client))
    
    # Login API Tests
    endpoint = '/login'
    suite.addTest(BaseCase.parameters(APITestCase, endpoint=endpoint, method='POST', response='Login successful!', status_code=200, data=dict(username='admin', password='password'), data_type='form', client=client))
    suite.addTest(BaseCase.parameters(APITestCase, endpoint=endpoint, method='POST', response='No account registered with username: admin1!', status_code=201, data=dict(username='admin1', password='password'), data_type='form', client=client))
    suite.addTest(BaseCase.parameters(APITestCase, endpoint=endpoint, method='POST', response='Incorrect Password!', status_code=201, data=dict(username='admin', password='password1'), data_type='form', client=client))
    
    # Update Password API Tests
    endpoint = '/change-password'
    suite.addTest(BaseCase.parameters(APITestCase, endpoint=endpoint, method='POST', response='Password updated successfully!', status_code=200, data=dict(username='admin', old_password='password', new_password='password'), data_type='form', client=client))
    suite.addTest(BaseCase.parameters(APITestCase, endpoint=endpoint, method='POST', response='Incorrect username admin1!', status_code=201, data=dict(username='admin1', old_password='password', new_password='password'), data_type='form', client=client))
    suite.addTest(BaseCase.parameters(APITestCase, endpoint=endpoint, method='POST', response='Incorrect password!', status_code=201, data=dict(username='admin', old_password='password1', new_password='password'), data_type='form', client=client))

    # Update Profile
    endpoint = '/update-profile'
    suite.addTest(BaseCase.parameters(APITestCase, endpoint=endpoint, method='POST', response='Profile update successful!', status_code=200, data=dict(username='admin', name='James Bourne', dob='04/07/1998', country='UK', device='Mobile', phone='1000000008', about='World class spy at British Secret Service'), data_type='form', client=client))

    # Search API Tests
    endpoint = '/search'
    suite.addTest(BaseCase.parameters(APITestCase, endpoint=endpoint, method='GET', response='Users queried successfully!', status_code=200, data=None, data_type=None, client=client))
    suite.addTest(BaseCase.parameters(APITestCase, endpoint=endpoint, method='POST', response='Users queried successfully!', status_code=200, data=dict(search_keyword='admin', search_field='Username'), data_type='form', client=client))
    
    # Transfer Credits API Tests
    endpoint = '/transfer-credits'
    suite.addTest(BaseCase.parameters(APITestCase, endpoint=endpoint, method='POST', response='10 Credits transferred from admin to admin successfully!', status_code=200, data=dict(amount=10, sender_username='admin', reciever_username='admin'), data_type='form', client=client))
    suite.addTest(BaseCase.parameters(APITestCase, endpoint=endpoint, method='POST', response='Insufficient credits', status_code=201, data=dict(amount=2000, sender_username='admin', reciever_username='admin'), data_type='form', client=client))
    suite.addTest(BaseCase.parameters(APITestCase, endpoint=endpoint, method='POST', response='No users with usernames - admin1, admin2!', status_code=201, data=dict(amount=2000, sender_username='admin1', reciever_username='admin2'), data_type='form', client=client))
    
    unittest.TextTestRunner(verbosity=2).run(suite)