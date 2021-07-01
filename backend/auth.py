from .hashing import Hash
from datetime import datetime
from . import database, models
from typing import Dict, Optional
from sqlalchemy.orm import Session
from .utils import get_attribute_names
from fastapi import APIRouter, Form, File, UploadFile, Depends, Response, status as STATUS

# Initialize the router instance from FastAPI
auth = APIRouter()

# API Routes
@auth.post('/sign-up', status_code=STATUS.HTTP_200_OK, tags=['Users'])
def sign_up(response: Response, email: str = Form(...), username: str = Form(...), password: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''Sign-up a new user for the Intelligent Automation application. Add the user to the database.

    Args:
        response (Response): Response object for the FastAPI app.
        email (str): Unique email id of the user. Defaults to Form(...).
        username (str): Unique username of the user. Defaults to Form(...).
        password (str): Password set by the user. Defaults to Form(...).
        db (Session): Database session to commit changes to the Database. Defaults to Depends(database.get_db).

    Returns:
        Dict: Returns a response with status and message along with the information of the new user if new user is added.
    '''

    # Check if a user already exists with the same email and username.
    user1 = db.query(models.User).filter_by(email=email).first()
    user2 = db.query(models.User).filter_by(username=username).first()
    if user1:
        status = response.status_code = STATUS.HTTP_201_CREATED
        message = 'Email already exists!'
        data = None
    elif user2:
        status = response.status_code = STATUS.HTTP_201_CREATED
        message = 'Username already exists!'
        data = None
    else:
        # If no user exists, create a new user and commit changes to the database.
        new_user = models.User(email=email, username=username, password=Hash.generate_password_hash(password))
        db.add(new_user);db.commit();db.refresh(new_user)
        status = response.status_code = STATUS.HTTP_200_OK
        message = 'Account created successfully!'
        data = new_user.to_dict()
    return dict(status=status, message=message, data=data)

@auth.post('/login', status_code=STATUS.HTTP_200_OK, tags=['Users'])
def login(response: Response, username: str = Form(...), password: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''Login an already registered user to the Intelligent Automation app.

    Args:
        response (Response): Response object for the FastAPI app.
        username (str): Unique username of the user. Defaults to Form(...).
        password (str): Password set by the user. Defaults to Form(...).
        db (Session): Database session to commit changes to the Database. Defaults to Depends(database.get_db).

    Returns:
        Dict: Returns a response with status and message along with the information of the user if the user exists.
    '''
    # Check if a user exists with the given username.
    user = db.query(models.User).filter_by(username=username).first()
    if user:
        # Validate the entered password with the password hash from database.
        if Hash.check_password_hash(password, user.password):
            # If validated return a response with the user information.
            status = response.status_code = STATUS.HTTP_200_OK
            message = 'Login successful!'
            data = user.to_dict()
        else:
            status = response.status_code = STATUS.HTTP_201_CREATED
            message = 'Incorrect Password!'
            data = None
    else:
        status = response.status_code = STATUS.HTTP_201_CREATED 
        message = f'No account registered with username: {username}!'
        data = None
    return dict(status=status, message=message, data=data)

@auth.delete('/delete-user', status_code=STATUS.HTTP_200_OK, tags=['Users'])
def delete_user(response: Response, username: str, db: Session = Depends(database.get_db)) -> Dict:
    '''Delete a user from the Intelligent Automation app.

    Args:
        response (Response): Response object for the FastAPI app.
        username (str): Unique username of the user. Defaults to Form(...).
        db (Session): Database session to commit changes to the Database. Defaults to Depends(database.get_db).

    Returns:
        Dict: Message indicating success or failure of the deleting.
    '''
    # Check if a user exists with the given username.
    user = db.query(models.User).filter_by(username=username).first()
    if user:
        # Delete the user from the database
        db.delete(user);db.commit()
        status = response.status_code = STATUS.HTTP_200_OK
        message = 'Account deleted successfully!'
    else:
        status = response.status_code = STATUS.HTTP_201_CREATED
        message = 'User not found!'
    return dict(status=status, message=message)

@auth.post('/change-password', status_code=STATUS.HTTP_200_OK, tags=['Users'])
def change_password(response: Response, username: str = Form(...), old_password: str = Form(...), new_password: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''Change/Update password for the Intelligent Automation app.

    Args:
        response (Response): Response object for the FastAPI app.
        username (str): Unique username of the user. Defaults to Form(...).
        old_password (str): Current password of the user. Defaults to Form(...).
        new_password (str): New password of the user. Defaults to Form(...).
        db (Session): Database session to commit changes to the Database. Defaults to Depends(database.get_db).

    Returns:
        Dict: Response with the information of the user whose password was updated.
    '''
    # Check if a user exists with the given username.
    user = db.query(models.User).filter_by(username=username).first()
    if user:
        # Validate the Current Password with the password hash from the database.
        if Hash.check_password_hash(old_password, user.password):
            # Commit the changes in password to the database.
            user.password = Hash.generate_password_hash(new_password)
            db.commit()
            status = response.status_code = STATUS.HTTP_200_OK
            message = 'Password updated successfully!'
        else:
            message = 'Incorrect password!'
            status = response.status_code = STATUS.HTTP_201_CREATED
    else:
        message = f'Incorrect username {username}!'
        status = response.status_code = STATUS.HTTP_201_CREATED
    return dict(status=status, message=message)

@auth.post('/update-profile', status_code=STATUS.HTTP_200_OK, tags=['Users'])
def update_profile(response: Response, username: str = Form(...), name: Optional[str] = Form(None), dob: Optional[str] = Form(None), country: Optional[str] = Form(None), gender: Optional[str] = Form(None), device: Optional[str] = Form(None), phone: Optional[str] = Form(None), about: Optional[str] = Form(None), photo: Optional[UploadFile] = File(None), db: Session = Depends(database.get_db)) -> Dict:
    '''Update the profile information for a user in the Intelligent Automation app.

    Args:
        response (Response): Response object for the FastAPI app.
        username (str): Unique username of the user. Defaults to Form(...).
        name (Optional[str]): Name of the user to be updated. Defaults to Form(None).
        dob (Optional[str]): Date of Birth of the user. Defaults to Form(None).
        country (Optional[str]): Country of the user. Defaults to Form(None).
        gender (Optional[str]): Gender of the user. Defaults to Form(None).
        device (Optional[str]): Devices used by the user. Defaults to Form(None).
        phone (Optional[str]): Phone number of the user. Defaults to Form(None).
        about (Optional[str]): Description of the user. Defaults to Form(None).
        photo (Optional[UploadFile]): Profile photo of the user. Defaults to File(None).
        db (Session): Database session to commit changes to the Database. Defaults to Depends(database.get_db).

    Returns:
        Dict: Returns a response with the updated information of the user.
    '''
    # Check if a user exists with the given username.
    user = db.query(models.User).filter_by(username=username).first()
    if user:
        # Gather all the information from the forms in a dictionary
        user_info = dict(name=name, country=country, gender=gender, device=device, phone=phone, about=about)
        
        # Update the information if the field is not None
        for u in user_info:
            if eval(f'user_info[u]'):
                exec(f'user.{u} = user_info[u]')
        
        if photo:
            # Create a path to save the profile photo by using the unique username.
            photo_path = f'static/profile_pictures/{username}.jpg'
            # Write it to the file system
            with open(photo_path, 'wb+') as f:
                f.write(photo.file.read())
            user.photo = photo_path
        
        if dob:
            # Convert string to datetime object for updating the DOB of the user.
            user.dob = datetime.strptime(dob, '%d/%m/%Y').date()
        
        # Commit changes to the database.
        db.commit();db.refresh(user)
        status = response.status_code = STATUS.HTTP_200_OK
        message = 'Profile update successful!'
        data = user.to_dict()
    
    else:
        status = response.status_code = STATUS.HTTP_201_CREATED
        message = f'No user with username: {username}!'
        data = None
    
    return dict(status=status, message=message, data=data)

@auth.get('/search', status_code=STATUS.HTTP_200_OK, tags=['Users'])
def search(response: Response, db: Session = Depends(database.get_db)) -> Dict:
    '''Get request to fetch all the users of the Intelligent Automation app.

    Args:
        response (Response): Response object for the FastAPI app.
        db (Session): Database session to commit changes to the Database. Defaults to Depends(database.get_db).

    Returns:
        Dict: Returns response with all the user information from the Intelligent Automation database.
    '''
    # Get all the records from the Users Table in the Intelligent Automation database.
    users = db.query(models.User).all()
    data = [get_attribute_names(user.to_dict(), ['projects']) for user in users]
    status = response.status_code = STATUS.HTTP_200_OK
    message = 'Users queried successfully!'
    return dict(status=status, message=message, data=data)

@auth.post('/search', status_code=STATUS.HTTP_200_OK, tags=['Users'])
def search(response: Response, search_keyword: str = Form(...), search_field: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''Post request to query users from database with serach keyword and field from the Intelligent Automation app.

    Args:
        response (Response): Response object for the FastAPI app.
        search_keyword (str): Search term. Defaults to Form(...).
        search_field (str): Search column in the Users Table of the Intelligent Automation database. Defaults to Form(...).
        db (Session): Database session to commit changes to the Database. Defaults to Depends(database.get_db).

    Returns:
        Dict: Returns response with the queried user information from the Intelligent Automation database.
    '''
    # Query users from the Intelligent Automation databse with search field and keyword.
    users = eval(f'db.query(models.User).filter(models.User.{search_field.lower()}.contains("{search_keyword}"))')
    data = [get_attribute_names(user.to_dict(), ['projects']) for user in users]
    status = response.status_code = STATUS.HTTP_200_OK
    message = 'Users queried successfully!'
    return dict(status=status, message=message, data=data)

@auth.post('/transfer-credits', status_code=STATUS.HTTP_200_OK, tags=['Users'])
def transfer_credits(response: Response, amount: int = Form(...), sender_username: str = Form(...), reciever_username: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''Transfer credits from one user to another in the Intelligent Automation app.

    Args:
        response (Response): Response object for the FastAPI app.
        amount (int): Amount to be transferred between users. Defaults to Form(...).
        sender_username (str): Username of the sender. Defaults to Form(...).
        reciever_username (str): Username of the reciever. Defaults to Form(...).
        db (Session): Database session to commit changes to the Database. Defaults to Depends(database.get_db).

    Returns:
        Dict: Returns a response with updated information of the users involved in the transaction.
    '''
    # Query the sender and receiver information from the User table in the Intelligent Automation database.
    sender = db.query(models.User).filter_by(username=sender_username).first()
    reciever = db.query(models.User).filter_by(username=reciever_username).first()
    if sender and reciever:
        # Credit and debit amount from the sender and receiver's credit amount
        if sender.credit >= amount:
            sender.credit -= amount
            reciever.credit += amount
            db.commit(); db.refresh(sender); db.refresh(reciever)
            data = dict(sender=sender.to_dict(), reciever=reciever.to_dict())
            status = response.status_code = STATUS.HTTP_200_OK
            message = f'{amount} Credits transferred from {sender.username} to {reciever.username} successfully!'
        else:
            data = None
            status = response.status_code = STATUS.HTTP_201_CREATED
            message = 'Insufficient credits'
    else:
        data = None
        status = response.status_code = STATUS.HTTP_201_CREATED
        if (not sender) and (not reciever):
            message = f'No users with usernames - {sender_username}, {reciever_username}!'
        elif not sender:
            message = f'No user with username - {sender_username}!'
        elif not reciever:
            message = f'No user with username - {reciever_username}!'
    return dict(status=status, message=message, data=data)