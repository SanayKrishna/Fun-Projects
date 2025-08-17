from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class URLScan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(500), nullable=False)
    result = db.Column(db.String(100), nullable=False)
    reason = db.Column(db.String(500), nullable=True)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
