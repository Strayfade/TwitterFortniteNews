# Fortnite News
Uses a Python script to grab NEWS data from EpicGames, then uses Javascript to post it on Twitter!

### How To Use:
1. Run install.bat to install necessary prerequisities.
2. Open **`config.js`** and edit the keys using your personal Twitter API keys. These can be found here: https://developer.twitter.com/
3. Run console command **`node index.js`** to run the application and post news! (make sure it is run in the index.js directory)


## Extra Information
 - All of the data from EpicGames servers is stored in the */Cache/* folder. This data is stored in **JSON** files and will automatically update every time the Python script is ran.
 - Most likely will require **NodeJS** to run. Download found here: https://nodejs.org/dist/v12.19.0/node-v12.19.0-x64.msi
 - Built using Visual Studio Code
