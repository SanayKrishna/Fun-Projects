from flask import Flask, render_template, request
import subprocess

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def scan():
    scan_output = None
    if request.method == 'POST':
        try:
            result = subprocess.run(
                ['nmap', '127.0.0.1'],
                capture_output=True,
                text=True
            )
            scan_output = result.stdout
        except Exception as e:
            scan_output = f"Error: {str(e)}"
    return render_template('scan.html', scan_output=scan_output)

if __name__ == '__main__':
    app.run(debug=True)
