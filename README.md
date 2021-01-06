# Obsidian Plugin *YouHaveBeenStaring*

This is a plugin for Obsidian (https://obsidian.md).

A sweet, short and subtle reminder that you might want to take a break from staring at your screen 🧐.

It tells you in natural language in the status bar for how long your vault is open (since how long ago the plugin was loaded).

## Features
- [x] Show for how long you've been staring at your vault since startup of obsidian in the status bar
- [x] Show total staring time (measured in increments of 1s whenever the plugin is active) in the status bar
- [x] Allow customization of display text `You have been staring at your vault for $amount` (both total and current staring duration)
- [x] Allow calculating the current staring duration from midnight today, if the startup was earlier than midnight today

## TODO
- [ ] Implement `take a break` reminders, configurable

## How to install
*You can find this plugin in the official third party obsidian plugins*

### For downloading from this repo:

Simply download and install this plugin in your *.obsidian/plugins* folder.

Then restart your Obsidian instance, navigate to "Settings -> Third-party plugins" and enable "YouHaveBeenStaring".

You will see the time since when you've been staring at your vault in the lower right status bar.

![](screenshot.png)
