#!/bin/bash
Red='\033[0;31m'
Green='\033[0;32m'
Blue='\033[0;34m'
Color_Off='\033[0m'

./deploy.sh local
res=$?
{ set +x; } 2>/dev/null
if [ $res -ne 0 ]; then
    echo -e "${Red}"
    echo "-----------------------------------------------------------------------"
    echo "-----------------------------------------------------------------------"
    echo "Failed to run BTA frontend application"
    echo "-----------------------------------------------------------------------"
    echo "-----------------------------------------------------------------------"
    echo -e "${Color_Off}"
    exit 1
  fi

echo -e "${Green}"
echo "-----------------------------------------------------------------------"
echo "-----------------------------------------------------------------------"
echo "BTA frontend has been successfully started"
echo -e "Subscribe using ${Blue}http://localhost:4200/#/auth/register${Green}"
echo "Then Log in as super admin to approve new subscription using http://localhost:4200/#/auth/login."
echo "-----------------------------------------------------------------------"
echo "-----------------------------------------------------------------------"
echo -e "${Color_Off}"
