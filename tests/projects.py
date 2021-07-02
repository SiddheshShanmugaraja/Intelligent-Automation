import unittest
from . import BaseCase, APITestCase

def main(client):
    suite = unittest.TestSuite()
    
    unittest.TextTestRunner(verbosity=2).run(suite)