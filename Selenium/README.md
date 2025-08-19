Selenium Automation Script – TestFire Demo Site

This project is a simple Selenium automation script that interacts with the TestFire banking demo website. The script uses Python and Selenium WebDriver with Google Chrome to perform basic login and navigation steps automatically.

When the script runs, it first opens the Chrome browser and goes to the TestFire demo site. It then clicks on the "Sign In" link and logs in using the credentials admin as both the username and password. After successfully signing in, the script continues to explore different parts of the website.

It clicks on several links in sequence, including Customize Site Language, View Recent Transactions, View Account Summary, Transfer Funds, and Search News Articles. Each page is opened one by one, with short pauses (time.sleep) added so you can clearly see each step being performed.

To run this script, you need Python, the Selenium library, Google Chrome, and ChromeDriver installed on your system. After saving the code in a Python file (for example, testfire_automation.py), you can execute it from the terminal using the command:
