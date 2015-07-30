#!/bin/bash
set -e

FILE=$1
S3BUCKET=$2

AWS_CREDENTIAL_FILE="${bamboo_this_aws_cred_file}"
s3Url="s3://${S3BUCKET}/${FILE}"
s3Url=$(echo "${s3Url}" | sed s/\ /_/g)

putCmd="/usr/bin/s3cmd put --force --acl-public --config=${bamboo_dev_aws_s3cfg} ${FILE} ${s3Url}"
echo "Putting archive to s3... cmd: $putCmd"
$putCmd