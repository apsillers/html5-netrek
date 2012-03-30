if [ ! -f compiler.jar ]; then
  echo 'You need the Closure compiler here, named "compiler.jar"';
  exit 1;
fi
java -jar compiler.jar js/*.js > all.js
