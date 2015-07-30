#!/bin/bash
set -e

FILE=$1
BASEPATH=$2

echo "Patching base url..."
sed -i "s/{{baseUrl}}/$BASEPATH/" $FILE