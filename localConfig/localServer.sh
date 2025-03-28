#!/bin/bash

# database credentials
export DB_HOSTNAME="localhost"
export DB_USERNAME=""
export DB_PASSWORD=""
export DB_NAME=""

# setup an app in discord dev portal
export DC_CLIENT_ID=""
export DC_CLIENT_SECRET=""

# use a random string
export SECRET=""

# create a php server
cd ../../
php -S localhost:8000
