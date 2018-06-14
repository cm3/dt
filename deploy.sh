npm install
echo -n "set base url (default: /app/dt): "
read base
base=${base:-/app/dt}
echo -n "set port (default: 8000): "
read port
port=${port:-8000}
echo -e "{\n \"base\": \"${base}\",\n \"port\": ${port}\n}" > settings.json
echo "settings.json is saved."
forever start server.js
