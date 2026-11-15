# HostNode

Final project, group SE-2515
Team: Ramazan Zhunussov, Islam Baimagambet

HostNode is a multi-page responsive website that helps beginners set up and run their own Minecraft PaperMC server. It covers choosing server software, configuring server.properties, picking plugins and checking that the server is online.

Live website: https://zhromi.github.io/HostNode-Minecraft-Server/

Repository: https://github.com/zhromi/HostNode-Minecraft-Server

## Pages

index.html: setup guide and live server status, config.html: config reference and FAQ, plugins.html: plugin search and bookmarks, about.html: team and support form, signup.html, login.html, profile.html: user details and saved plugins

## Features

- Responsive layout built with Bootstrap 5
- Light and dark mode toggle, saved in localStorage
- Sign up, log in and profile simulated with localStorage
- Custom JavaScript form validation email, phone, required fields, password strength, with novalidate and inline error messages
- Plugin search with suggestions, last query saved; plugins can be saved and then appear in the profile
- Live Minecraft server status from the mcsrvstat.us API, with loading and error states
- Hover animations, transitions and click sounds

## Run locally

Open index.html in a browser. An internet connection is needed for Bootstrap, jQuery and the API

## Notes

The password is stored in plain text only because the project simulates a back end
