from passlib.context import CryptContext

class Hash:

    # Create the Crypt Context variable
    pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

    @staticmethod
    def generate_password_hash(password: str) -> str: 
        """Generate a hash for given password string

        Args:
            password (str): Password in readable string format.

        Returns:
            str: Password hash in encrypted string format.
        """
        return Hash.pwd_context.hash(password)

    @staticmethod
    def check_password_hash(password: str, password_hash: str) -> bool:
        """Validate the entered password and password hash.

        Args:
            password (str): Password in readable string format.
            password_hash (str): Password hash in encrypted string format.

        Returns: Returns True if the password was verified else False.
        """
        return Hash.pwd_context.verify(password, password_hash)