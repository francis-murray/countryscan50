from flask import Flask, render_template, request, url_for
import requests
import os

# configure application
application = Flask(__name__)

# default route
@application.route("/", methods=["GET"])
def index():
    """Render Index/Population page."""

    # access World Population API to return a list of all countries in the statistical dataset
    url = "https://dyicn1e62j3n1.cloudfront.net:443/1.0/countries"
    r = requests.get(url)
    countries_list = r.json()["countries"]

    # pass the list of countries and display form
    return render_template("index.html", countries_list=countries_list)


# run the app.
if __name__ == "__main__":
    application.run()
