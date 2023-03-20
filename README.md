<div align="center">

![hero image of collab action]()

# ChainPatrol Collab Action Bot

[![Build @chainpatrol/collab-action](https://github.com/chainpatrol/collab-action/actions/workflows/build.yaml/badge.svg)](https://github.com/chainpatrol/collab-action/actions/workflows/build.yaml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

ChainPatrol's Collab Action Bot is the official bot for Collab.land users to
enhance their security against scams and phishing attempts in their Discord
servers

</div>

---

| Environment | URL                                                           |
| ----------- | ------------------------------------------------------------- |
| Production  | https://chainpatrol-collab-action-production.up.railway.app/  |
| Development | https://chainpatrol-collab-action-development.up.railway.app/ |

## Features :rocket:

- :raising_hand: Easy integration with Discord servers through Collab.land
  Marketplace for seamless user experience.
- :white_check_mark: Check URLs against ChainPatrol's blacklist of known
  phishing sites using the `/chainpatrol check` command.
- :police_car: Report scam URLs to ChainPatrol using the `/chainpatrol report`
  command.

### Coming Soon :soon:

- :trophy: Display the ChainPatrol leaderboard of top reporters using the
  `/chainpatrol leaderboard` command.
- :eyes: Regular scans of Collab.land community messages to detect suspicious
  activity.
- :triangular_flag_on_post: Automatic notifications of potential scams to keep
  users informed and safe

## Screenshots :camera:

![CleanShot 2023-03-20 at 14 25 01@2x](https://user-images.githubusercontent.com/8302959/226469979-f887abcc-0a39-476e-be4a-e77e79473fbc.png)

![CleanShot 2023-03-20 at 14 26 01@2x](https://user-images.githubusercontent.com/8302959/226469929-92824469-a736-434f-bfeb-849f54a72e90.png)


## Usage :computer:

To use ChainPatrol's Collab Action Bot, simply add the bot to your Discord
server through the Collab.land Marketplace and customize your security settings
according to your preferences. The slash commands are listed below:

| Command               | Description                                                          |
| --------------------- | -------------------------------------------------------------------- |
| `/chainpatrol check`  | Check a URL against ChainPatrol's blacklist of known phishing sites. |
| `/chainpatrol report` | Report a scam URL to ChainPatrol.                                    |

## Contributing :raised_hands:

We welcome contributions from anyone interested in enhancing the security of the
web3 community. If you would like to contribute to the project, please feel free
to read through our issues and submit a pull request.

Thank you for using ChainPatrol's Collab Action Bot to protect yourself and your
community.

### Prerequisites

Node.js and npm (Node Package Manager) must be installed on your system.

### Familiarize yourself with Collab Action development

Try out the `/hello-action` example to see what Collab Action is capable of:

1. [Install hello-action template](https://dev.collab.land/docs/upstream-integrations/build-a-miniapp)

Next, once you get to play with this simple action, try to implement something
new and test it locally

2. [Implement & test your Action locally](https://dev.collab.land/docs/upstream-integrations/test-locally)

Explore more possibilities with Collab Action!

3. [Build a custom Collab Action](https://dev.collab.land/docs/upstream-integrations/build-a-custom-action)
