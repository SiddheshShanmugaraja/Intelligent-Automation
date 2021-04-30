from .models import User
from . import db, return_response
from flask_cors import cross_origin
from flask import Blueprint, request
from werkzeug.security import generate_password_hash, check_password_hash

auth = Blueprint('auth', __name__)

@auth.route('/sign-up', methods=['POST'])
@cross_origin()
def sign_up():
    """[summary]

    Returns:
        [type]: [description]
    """
    username = request.form.get('username')
    password = request.form.get('password')
    user = User.query.filter_by(username=username).first()
    if user:
        status = 400
        message = "Username already exists!"
        data = None
    else:
        new_user = User(username=username, password=generate_password_hash(password, method='sha256'))
        db.session.add(new_user)
        db.session.commit()
        status = 200
        message = "Account created successfully!"
        data = {"username": f"{new_user.username}", "user_id": user.id}
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
            data = {"username": user.username, "user_id": user.id}
        else:
            status = 400
            message = "Incorrect Password!"
            data = None
    else:
        status = 400 
        message = f"No account registered with username: '{username}'!"
        data = None
    return return_response(status, message, data)