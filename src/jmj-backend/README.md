# System Backend

## Table of Contents
+ Description
+ Windows Installation Guide
+ How to Run
+ User Tokens

## Description
For the backend implementation, we are going to use the Laravel Framework backed with a MySQL service. To facilitate the development we are going to use the Sail package provided by the Laravel Framework which uses  Docker to start up containers with a web server and MySQL service.

## Windows Installation Guide
### Install the Prerequisites
1. Enable  `virtualization` in the BIOS settings
2. Install [Docker](https://desktop.docker.com/win/stable/Docker%20Desktop%20Installer.exe)
3. Setup [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10#manual-installation-steps). You can use Ubuntu 20.04 for the Linux distribution.
4. Install [Windows Terminal](https://www.microsoft.com/en-ca/p/windows-terminal/9n0dx20hk701?rtc=1&activetab=pivot:overviewtab) 
5. Install [Visual Studio Code](https://code.visualstudio.com/)
6. Install the [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) VS code extension

### Setting up Ubuntu 20.04
1. Run Ubuntu system from Windows Terminal by typing `ubuntu2004` in the command prompt 
2. Update the system 
    ```
    sudo apt update
    ```
3. Install dependencies
    ```
    sudo apt -y install php7.4

    sudo apt-get install -y php7.4-cli php7.4-json php7.4-common php7.4-mysql php7.4-zip php7.4-gd php7.4-mbstring php7.4-curl php7.4-xml php7.4-bcmath
    ```
4. Install composer
    ```
    php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"

    php -r "if (hash_file('sha384', 'composer-setup.php') === '756890a4488ce9024fc62c56153228907f1545c228516cbf63f885e036d37e9a59d27d63f46af1d4d07ee0f76181c7d3') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"

    php composer-setup.php

    php -r "unlink('composer-setup.php');"

    sudo mv composer.phar /usr/local/bin/composer
    ```
5. Add an alias for Sail
    ```
    echo "alias sail='./vendor/bin/sail'" >> ~/.bashrc
    ```

## How to Run
1. cd into the project directory
    ```
    cd backend
    ```
3. Install dependencies via composer
    ```
    composer update
    ```
4. Copy env file to proper env file
    ```
    cp .env.example .env
    ```
5. Run Sail in detached mode ( remove the -d to have it linger in the terminal )
    ```
    sail up -d
    ```
6. open the project in VS Code
	```
	code .
	```
7. Run database migrations and seedings
    ```
    sail artisan migrate --seed
    ```
>Note: Use `sail artisan migrate:fresh --seed` to drop existing tables in the database 

## User Tokens
+ Viewer: `5|w3e9QdJuz7ZXGHhyzGbyUjTCYOlm9clhGIgEVmBQ`
+ Researcher: `2|PA9HGaJwBfQk6fKR6SfPfJkTqGPegyA7rsDlblcG`
+ Reviewer: `4|W6KGSQ6QvsPDYu1CDjMI3zUjCmNh5B9soyWEQXXh`
+ Editor: `3|wBwJaLPpTEQ0GjcOwtHd5orHc3rMwd1bMidcCOPD`
+ Admin: `1|YwTXYUlnjnPDmU0pZEsnslFK3kwXf8GItIp3C2Nb`