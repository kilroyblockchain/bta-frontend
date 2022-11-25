ENV=$1

C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_BLUE='\033[0;34m'

println() {
  echo -e "$1"
}

# errorln echos i red color
errorln() {
  println "${C_RED}${1}${C_RESET}"
}

# successln echos in green color
successln() {
  println "${C_GREEN}${1}${C_RESET}"
}

infoln() {
  println "${C_BLUE}${1}${C_RESET}"
}

printHelp() {
    USAGE="$1"
    infoln "---------------------------------------------------------------------------"
    infoln "---------------------------------------------------------------------------"
    infoln "Please use the following valid arguments: local, dev, beta or production"
    infoln
    infoln "For example: ./deploy.sh local"
    infoln "---------------------------------------------------------------------------"
    infoln "---------------------------------------------------------------------------"
}

if [[ $# -lt 1 ]] ; then
    errorln "---------------------------------------------------------------------------"
    errorln "---------------------------------------------------------------------------"
    errorln "Arguments not found."
    errorln "---------------------------------------------------------------------------"
    errorln "---------------------------------------------------------------------------"
    printHelp
    exit 0
else
  ENV=$1
  case $ENV in
  "local")
    successln "Set ENV=$ENV"
    ;;
  "dev")
    successln "Set ENV=$ENV"
    ;;
    "beta")
    successln "Set ENV=$ENV"
    ;;
    "production")
    successln "Set ENV=$ENV"
    ;;
  *)
    errorln "---------------------------------------------------------------------------"
    errorln "---------------------------------------------------------------------------"
    errorln "Invalid Environment passed."
    errorln "---------------------------------------------------------------------------"
    errorln "---------------------------------------------------------------------------"
    printHelp
    exit 0
    ;;
esac
fi

docker-compose build --build-arg ENV=$1
docker-compose up -d