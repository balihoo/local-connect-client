#!/bin/bash
set -e

FILE=$(echo "$1" | sed s/\//\\\//g)   # escape the // in the url (i.e. https://xxxx) so that it doesn't error in the second sed command
BASEPATH=$2

echo "Patching base url..."
sed -i "s/{{baseUrl}}/$BASEPATH/" $FILE