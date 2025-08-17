import os
from flask import Flask, render_template, request
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import requests
from models import db, URLScan

load_dotenv()
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///scanner.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

def check_url_google_safe_browsing(url):
    endpoint = "https://safebrowsing.googleapis.com/v4/threatMatches:find"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "client": {
            "clientId": "yourcompanyname",
            "clientVersion": "1.0"
        },
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}],
        },
    }
    params = {'key': GOOGLE_API_KEY}
    response = requests.post(endpoint, params=params, headers=headers, json=payload)
    data = response.json()
    if 'matches' in data and data['matches']:
        return ("Unsafe", f"{data['matches'][0]['threatType']}")
    else:
        return ("Safe", "No threat detected by Google Safe Browsing")

@app.route('/', methods=['GET', 'POST'])
def home():
    url_status, reason = None, None
    scans = URLScan.query.order_by(URLScan.timestamp.desc()).limit(10).all()
    if request.method == 'POST':
        url = request.form['url']
        result, reason = check_url_google_safe_browsing(url)
        scan = URLScan(url=url, result=result, reason=reason)
        db.session.add(scan)
        db.session.commit()
        url_status = result
    return render_template('index.html', url_status=url_status, reason=reason, scans=scans)

if __name__ == '__main__':
    app.run(debug=True)
