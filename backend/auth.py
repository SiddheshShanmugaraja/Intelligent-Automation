from PIL import Image
from .models import User
from . import db, return_response
from flask_cors import cross_origin
from datetime import datetime, date
from flask import Blueprint, request
from werkzeug.security import generate_password_hash, check_password_hash

auth = Blueprint('auth', __name__)

################################################################################################################

def get_attribute_names(dict_, attributes_list):
    for attributes in attributes_list:
        dict_[attributes] = [attribute['name'] for attribute in dict_[attributes]] 
    return dict_

################################################################################################################

@auth.route('/sign-up', methods=['POST'])
@cross_origin()
def sign_up():
    """[summary]

    Returns:
        [type]: [description]
    """
    email = request.form.get('email')
    username = request.form.get('username')
    password = request.form.get('password')
    user1 = User.query.filter_by(email=email).first()# User.query.all()
    user2 = User.query.filter_by(username=username).first()
    if user1:
        status = 400
        message = "Email already exists!"
        data = None
    elif user2:
        status = 400
        message = "Username already exists!"
        data = None
    else:
        new_user = User(email=email, username=username, password=generate_password_hash(password))
        db.session.add(new_user)
        db.session.commit()
        status = 200
        message = "Account created successfully!"
        data = new_user.to_dict()
    return return_response(status, message, data)

@auth.route('/login', methods=['POST'])
@cross_origin()
def login():
    """[summary]

    Returns:
        [type]: [description]
    """
    username = request.form.get('username')
    password = request.form.get('password')
    user = User.query.filter_by(username=username).first()
    if user:
        if check_password_hash(user.password, password):
            status = 200
            message = "Login successful!"
            data = user.to_dict()
        else:
            status = 400
            message = "Incorrect Password!"
            data = None
    else:
        status = 400 
        message = f"No account registered with username: '{username}'!"
        data = None
    return return_response(status, message, data)

@auth.route('/change-password', methods=['POST'])
@cross_origin()
def change_password():
    """[summary]

    Returns:
        [type]: [description]
    """
    username = request.form.get('username')
    old_password = request.form.get('old_password')
    new_password = request.form.get('new_password')
    user = User.query.filter_by(username=username).first()
    if user:
        if check_password_hash(user.password, old_password):
            user.password = generate_password_hash(new_password)
            db.session.commit()
            status = 200
            message = "Password updated successfully!"
            data = user.to_dict()
        else:
            message = "Incorrect password!"
            status = 400
            data = None
    else:
        message = f"Incorrect username: '{username}'!"
        status = 400
        data = None
    return return_response(status, message, data)

@auth.route('/update-profile', methods=['POST'])
@cross_origin()
def update_profile():
    """[summary]

    Returns:
        [type]: [description]
    """
    username = request.form.get('username')
    user = User.query.filter_by(username=username).first()
    if user:
        user_info = dict(country = request.form.get('country'), gender = request.form.get('gender'), device = request.form.get('device'), phone = request.form.get('phone'), about = request.form.get('about'))
        for u in user_info:
            if eval(f"user_info[u]"):
                exec(f"user.{u} = user_info[u]")
        photo = request.files.get('photo')
        dob = request.form.get('dob')
        if photo:
            photo_path = f"static/profile_pictures/{username}.jpg"
            photo = Image.open(photo.stream)
            photo.save(photo_path)
            user.photo = photo_path
        if dob:
            user.dob = datetime.strptime(dob, "%d/%m/%Y").date()
        db.session.commit()
        status = 200
        message = "Profile update successful!"
        data = user.to_dict()
    else:
        status = 400
        message = f"No user with username: '{username}'!"
        data = None
    return return_response(status, message, data)

@auth.route('/search', methods=['GET', 'POST'])
@cross_origin()
def search():
    """[summary]

    Returns:
        [type]: [description]
    """
    if request.method == 'GET':
        users = User.query.all()
        data = [get_attribute_names(user.to_dict(), ['projects']) for user in users]
    elif request.method == 'POST':
        search_keyword = request.form.get('search_keyword')
        search_field = request.form.get('search_field').lower()
        users = eval(f"User.query.filter(User.{search_field}.contains('{search_keyword}'))")
        data = [get_attribute_names(user.to_dict(), ['projects']) for user in users]
    status = 200
    message = "Users queried successfully!"
    return return_response(status, message, data)

@auth.route('/transfer-credits', methods=['POST'])
@cross_origin()
def transfer_credits():
    """[summary]

    Returns:
        [type]: [description]
    """
    amount = abs(int(float(request.form.get("amount"))))
    sender_username = request.form.get("sender_username")
    reciever_username = request.form.get("reciever_username")
    sender = User.query.filter_by(username=sender_username).first()
    reciever = User.query.filter_by(username=reciever_username).first()
    if sender and reciever:
        if sender.credit >= amount:
            sender.credit -= amount
            reciever.credit += amount
            db.session.commit()
            data = dict(sender=sender.to_dict(), reciever=reciever.to_dict())
            status = 200
            message = "Credits transferred successfully!"
        else:
            data = None
            status = 400
            message = "Insufficient credits"
    else:
        data = None
        status = 400
        if (not sender) and (not reciever):
            message = f"No users with usernames - '{sender_username}', '{reciever_username}'!"
        elif not sender:
            message = f"No user with username - '{sender_username}'!"
        elif not reciever:
            message = f"No user with username - '{reciever_username}'!"
    return return_response(status, message, data)