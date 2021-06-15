import io
from PIL import Image
from .hashing import Hash
from . import database, models
from sqlalchemy.orm import Session
from datetime import date, datetime
from .utils import get_attribute_names
from typing import List, Dict, Tuple, Optional
from fastapi import APIRouter, Form, File, UploadFile, Depends, Response, status as STATUS

auth = APIRouter()

@auth.post('/sign-up', status_code=STATUS.HTTP_200_OK, tags=['Users'])
def sign_up(response: Response, email: str = Form(...), username: str = Form(...), password: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''[summary]

    Args:
        response (Response): [description]
        email (str, optional): [description]. Defaults to Form(...).
        username (str, optional): [description]. Defaults to Form(...).
        password (str, optional): [description]. Defaults to Form(...).
        db (Session, optional): [description]. Defaults to Depends(database.get_db).

    Returns:
        Dict: [description]
    '''
    user1 = db.query(models.User).filter_by(email=email).first()
    user2 = db.query(models.User).filter_by(username=username).first()
    if user1:
        status = response.status_code = STATUS.HTTP_400_BAD_REQUEST
        message = 'Email already exists!'
        data = None
    elif user2:
        status = response.status_code = STATUS.HTTP_400_BAD_REQUEST
        message = 'Username already exists!'
        data = None
    else:
        new_user = models.User(email=email, username=username, password=Hash.generate_password_hash(password))
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        status = response.status_code = STATUS.HTTP_200_OK
        message = 'Account created successfully!'
        data = new_user.to_dict()
    return dict(status=status, message=message, data=data)

@auth.post('/login', status_code=STATUS.HTTP_200_OK, tags=['Users'])
def login(response: Response, username: str = Form(...), password: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''[summary]

    Args:
        response (Response): [description]
        username (str, optional): [description]. Defaults to Form(...).
        password (str, optional): [description]. Defaults to Form(...).
        db (Session, optional): [description]. Defaults to Depends(database.get_db).

    Returns:
        Dict: [description]
    '''
    user = db.query(models.User).filter_by(username=username).first()
    if user:
        if Hash.check_password_hash(password, user.password):
            status = response.status_code = STATUS.HTTP_200_OK
            message = 'Login successful!'
            data = user.to_dict()
        else:
            status = response.status_code = STATUS.HTTP_404_NOT_FOUND
            message = 'Incorrect Password!'
            data = None
    else:
        status = response.status_code = STATUS.HTTP_404_NOT_FOUND 
        message = f'No account registered with username: {username}!'
        data = None
    return dict(status=status, message=message, data=data)

@auth.delete('/delete-user', status_code=STATUS.HTTP_200_OK, tags=['Users'])
def delete_user(response: Response, username: str, db: Session = Depends(database.get_db)) -> Dict:
    '''[summary]

    Args:
        response (Response): [description]
        username (str): [description]
        db (Session, optional): [description]. Defaults to Depends(database.get_db).

    Returns:
        Dict: [description]
    '''
    user = db.query(models.User).filter_by(username=username).first()
    if user:
        db.delete(user)
        db.commit()
        status = response.status_code = STATUS.HTTP_200_OK
        message = 'Account deleted successfully!'
    else:
        status = response.status_code = STATUS.HTTP_404_NOT_FOUND
        message = 'User not found!'
    return dict(status=status, message=message)

@auth.put('/update-password', status_code=STATUS.HTTP_200_OK, tags=['Users'])
def change_password(response: Response, username: str, old_password: str, new_password: str, db: Session = Depends(database.get_db)) -> Dict:
    '''[summary]

    Args:
        response (Response): [description]
        username (str): [description]
        old_password (str): [description]
        new_password (str): [description]
        db (Session, optional): [description]. Defaults to Depends(database.get_db).

    Returns:
        Dict: [description]
    '''
    user = db.query(models.User).filter_by(username=username).first()
    if user:
        if Hash.check_password_hash(old_password, user.password):
            user.password = Hash.generate_password_hash(new_password)
            db.commit()
            status = response.status_code = STATUS.HTTP_200_OK
            message = 'Password updated successfully!'
        else:
            message = 'Incorrect password!'
            status = response.status_code = STATUS.HTTP_400_BAD_REQUEST
    else:
        message = f'Incorrect username {username}!'
        status = response.status_code = STATUS.HTTP_400_BAD_REQUEST
    return dict(status=status, message=message)

@auth.put('/update-profile', status_code=STATUS.HTTP_200_OK, tags=['Users'])
def update_profile(response: Response, username: str = Form(...), name: Optional[str] = Form(None), dob: Optional[str] = Form(None), country: Optional[str] = Form(None), gender: Optional[str] = Form(None), device: Optional[str] = Form(None), phone: Optional[str] = Form(None), about: Optional[str] = Form(None), photo: Optional[UploadFile] = File(None), db: Session = Depends(database.get_db)) -> Dict:
    '''[summary]

    Args:
        response (Response): [description]
        username (str, optional): [description]. Defaults to Form(...).
        name (Optional[str], optional): [description]. Defaults to Form(None).
        dob (Optional[str], optional): [description]. Defaults to Form(None).
        country (Optional[str], optional): [description]. Defaults to Form(None).
        gender (Optional[str], optional): [description]. Defaults to Form(None).
        device (Optional[str], optional): [description]. Defaults to Form(None).
        phone (Optional[str], optional): [description]. Defaults to Form(None).
        about (Optional[str], optional): [description]. Defaults to Form(None).
        photo (Optional[UploadFile], optional): [description]. Defaults to File(None).
        db (Session, optional): [description]. Defaults to Depends(database.get_db).

    Returns:
        Dict: [description]
    '''
    user = db.query(models.User).filter_by(username=username).first()
    if user:
        user_info = dict(name=name, country=country, gender=gender, device=device, phone=phone, about=about)
        for u in user_info:
            if eval(f'user_info[u]'):
                exec(f'user.{u} = user_info[u]')
        if photo:
            photo_path = f'static/profile_pictures/{username}.jpg'
            with open(photo_path, 'wb+') as f:
                f.write(photo.file.read())
            user.photo = photo_path
        if dob:
            user.dob = datetime.strptime(dob, '%d/%m/%Y').date()
        db.commit()
        status = response.status_code = STATUS.HTTP_200_OK
        message = 'Profile update successful!'
        data = user.to_dict()
    else:
        status = response.status_code = STATUS.HTTP_400_BAD_REQUEST
        message = f'No user with username: {username}!'
        data = None
    return dict(status=status, message=message, data=data)

@auth.get('/search', status_code=STATUS.HTTP_200_OK, tags=['Users'])
def search(response: Response, db: Session = Depends(database.get_db)) -> Dict:
    '''[summary]

    Args:
        response (Response): [description]
        db (Session, optional): [description]. Defaults to Depends(database.get_db).

    Returns:
        Dict: [description]
    '''
    users = db.query(models.User).all()
    data = [get_attribute_names(user.to_dict(), ['projects']) for user in users]
    status = response.status_code = STATUS.HTTP_200_OK
    message = 'Users queried successfully!'
    return dict(status=status, message=message, data=data)

@auth.post('/search', status_code=STATUS.HTTP_200_OK, tags=['Users'])
def search(response: Response, search_keyword: str = Form(...), search_field: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''[summary]

    Args:
        response (Response): [description]
        search_keyword (str, optional): [description]. Defaults to Form(...).
        search_field (str, optional): [description]. Defaults to Form(...).
        db (Session, optional): [description]. Defaults to Depends(database.get_db).

    Returns:
        Dict: [description]
    '''
    users = eval(f'db.query(models.User).filter(models.User.{search_field.lower()}.contains("{search_keyword}"))')
    data = [get_attribute_names(user.to_dict(), ['projects']) for user in users]
    status = response.status_code = STATUS.HTTP_200_OK
    message = 'Users queried successfully!'
    return dict(status=status, message=message, data=data)

@auth.post('/transfer-credits', status_code=STATUS.HTTP_200_OK, tags=['Users'])
def transfer_credits(response: Response, amount: int = Form(...), sender_username: str = Form(...), reciever_username: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''[summary]

    Args:
        response (Response): [description]
        amount (int, optional): [description]. Defaults to Form(...).
        sender_username (str, optional): [description]. Defaults to Form(...).
        reciever_username (str, optional): [description]. Defaults to Form(...).
        db (Session, optional): [description]. Defaults to Depends(database.get_db).

    Returns:
        Dict: [description]
    '''
    sender = db.query(models.User).filter_by(username=sender_username).first()
    reciever = db.query(models.User).filter_by(username=reciever_username).first()
    if sender and reciever:
        if sender.credit >= amount:
            sender.credit -= amount
            reciever.credit += amount
            db.commit()
            data = dict(sender=sender.to_dict(), reciever=reciever.to_dict())
            status = response.status_code = STATUS.HTTP_200_OK
            message = f'Credits transferred from {sender.username} to {reciever.username} successfully!'
        else:
            data = None
            status = response.status_code = STATUS.HTTP_400_BAD_REQUEST
            message = 'Insufficient credits'
    else:
        data = None
        status = response.status_code = STATUS.HTTP_400_BAD_REQUEST
        if (not sender) and (not reciever):
            message = f'No users with usernames - {sender_username}, {reciever_username}!'
        elif not sender:
            message = f'No user with username - {sender_username}!'
        elif not reciever:
            message = f'No user with username - {reciever_username}!'
    return dict(status=status, message=message, data=data)