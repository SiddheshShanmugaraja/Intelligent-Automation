import unittest

class BaseCase(unittest.TestCase):

    def __init__(self, method_name='APITests', endpoint=None, method=None, response=None, status_code=None, data=None, data_type=None, client=None):
        super(BaseCase, self).__init__(method_name)
        self.endpoint = endpoint
        self.method = method.lower()
        self.response = response
        self.status_code = status_code
        self.data = data
        self.data_type = data_type.lower() if data_type is not None else None
        self.client = client

    @staticmethod
    def parameters(testcase_klass, endpoint=None, method=None, response=None, status_code=None, data=None, data_type=None, client=None):
        """Create a suite containing all tests taken from the given subclass, passing them the parameter 'param'."""
        testloader = unittest.TestLoader()
        testnames = testloader.getTestCaseNames(testcase_klass)
        suite = unittest.TestSuite()
        for name in testnames:
            suite.addTest(testcase_klass(name, endpoint=endpoint, method=method, response=response, status_code=status_code, data=data, data_type=data_type, client=client))
        return suite

    # Query the API and return the response
    def query(self):
        print(f'\nEndpoint - {self.endpoint}')
        if self.data:
            if self.data_type == 'json':
                return eval(f'self.client.{self.method}("{self.endpoint}", json=self.data)')
            elif self.data_type == 'form':
                return eval(f'self.client.{self.method}("{self.endpoint}", data=self.data)')
        else:
            return eval(f'self.client.{self.method}("{self.endpoint}")')

class APITestCase(BaseCase):

    def test_api(self):
        response = self.query()
        self.assertEqual(response.status_code, self.status_code)
        self.assertEqual(response.headers.get('content-type'), 'application/json')
        response = response.json()
        self.assertEqual(response.get('message'), self.response)