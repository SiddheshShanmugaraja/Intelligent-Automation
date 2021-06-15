from passlib.context import CryptContext

class Hash:

    pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

    @staticmethod
    def generate_password_hash(password: str) -> str: 
        """[summary]

        Args:
            password (str): [description]

        Returns:
            str: [description]
        """
        return Hash.pwd_context.hash(password)

    @staticmethod
    def check_password_hash(password: str, password_hash: str) -> str:
        """[summary]

        Args:
            password1 (str): [description]
            password2 (str): [description]

        Returns:
            str: [description]
        """
        return Hash.pwd_context.verify(password, password_hash)