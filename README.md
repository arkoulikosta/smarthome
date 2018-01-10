=----------------------------UPDATE--------------------------------------= 
sudo apt-get update
sudo apt-get upgrade -y
sudo reboot
=----------------------------UPDATE--------------------------------------= 
=----------------------------NPM--------------------------------------= 
sudo apt-get install npm -y
npm install onoff express sleep socket.io rpio

sudo git clone https://github.com/abelectronicsuk/ABElectronics_NodeJS_Libraries.git
sudo cp -avr ABElectronics_NodeJS_Libraries/lib/iopi/ /home/pi/node_modules/
=----------------------------NPM--------------------------------------= 
=----------------------------FTP--------------------------------------= 
sudo apt-get install pure-ftpd -y
sudo groupadd ftpgroup
sudo useradd ftpuser -g ftpgroup -s /sbin/nologin -d /dev/null  
mkdir /home/pi/smarthome/
sudo chown -R ftpuser:ftpgroup /home/pi/smarthome
sudo pure-pw useradd kostas -u ftpuser -g ftpgroup -d /home/pi/smarthome -m //user:kostas
sudo ln -s /etc/pure-ftpd/conf/PureDB /etc/pure-ftpd/auth/60puredb
sudo service pure-ftpd restart
=----------------------------FTP--------------------------------------=
=----------------------------NODEMON--------------------------------------= 
sudo npm install -g nodemon
sudo nodemon /home/pi/smarthome/server.js
=----------------------------NODEMON--------------------------------------= 
=----------------------------RUN--------------------------------------= 
sudo node /home/pi/smarthome/server.js
OR
sudo nodemon /home/pi/smarthome/server.js
=----------------------------RUN--------------------------------------= 
