from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import jwt
import datetime
from functools import wraps
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        return f'<User {self.username}>'

# Create tables
with app.app_context():
    db.create_all()

# Token decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(id=data['user_id']).first()
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Check if user exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username already exists!'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already exists!'}), 400
        
        # Hash the password
        password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        # Create new user
        new_user = User(
            username=data['username'],
            email=data['email'],
            password_hash=password_hash
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': 'User created successfully!',
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email
            }
        }), 201
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Find user by username
        user = User.query.filter_by(username=data['username']).first()
        
        if not user:
            return jsonify({'message': 'User not found!'}), 404
        
        # Check password
        if bcrypt.check_password_hash(user.password_hash, data['password']):
            # Generate token
            token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, app.config['SECRET_KEY'], algorithm='HS256')
            
            return jsonify({
                'message': 'Login successful!',
                'token': token,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            }), 200
        else:
            return jsonify({'message': 'Invalid password!'}), 401
            
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/profile', methods=['GET'])
@token_required
def profile(current_user):
    return jsonify({
        'user': {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'created_at': current_user.created_at
        }
    }), 200

@app.route('/api/hash-demo', methods=['POST'])
def hash_demo():
    """Demo endpoint to show password hashing"""
    try:
        data = request.get_json()
        password = data.get('password', '')
        
        # Generate hash
        hashed = bcrypt.generate_password_hash(password).decode('utf-8')
        
        # Verify hash
        verified = bcrypt.check_password_hash(hashed, password)
        
        return jsonify({
            'original_password': password,
            'hashed_password': hashed,
            'verified': verified,
            'hash_info': {
                'algorithm': 'bcrypt',
                'hash_length': len(hashed),
                'hash_structure': 'salt + hash (bcrypt format)'
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)