# CookieClicker Unofficial Plugin for Elgato Streamdeck

Tap the CookieClicker icon and gain cookies. The more cookies you gain the bigger your fame and title will become!

This an extension for the [ElGato-StreamDeck](https://www.elgato.com/en/gaming/stream-deck).

## Screenshot

![screencap.gif](doc/screencap.gif)

Please report any issues you see on the project's Github page. I welcome any feedback.

## Installation

Download from Release folder [Release Folder](Release/com.f00d4tehg0dz.cookieclicker.streamDeckPlugin)

Double click to install to StreamDeck. 

## Debugging

You can debug the Javascript plugin using Google Chrome's web developer tools. In order to do so, you first need to enable the HTML remote debugger in Stream Deck:

- on macOS, you will need to run the following command line in the Terminal:
   `defaults write com.elgato.StreamDeck html_remote_debugging_enabled -bool YES`
- on Windows, you will need to add a `DWORD html_remote_debugging_enabled with value 1` in the registry `@ HKEY_CURRENT_USER\Software\Elgato Systems GmbH\StreamDeck`.

After you relaunch the Stream Deck app, you can open [http://localhost:23654/](http://localhost:23654/) in Chrome, where you will find a list of `Inspectable pages` (plugins):

## Ongoing work
