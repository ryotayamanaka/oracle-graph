## Add Ingress Rule

From the Oracle Cloud web interface, go to the setting of subnet, and add the ingress rule below to the security list.

- Source: 0.0.0.0/0
- Destiinatioin Port Range: 8888

## Install Jupyter Notebook

Login to the compute instance as `opc` user.

    $ ssh <public_ip_address> -l opc -i <secret_key_file>

Install Jupyter. (https://jupyter.readthedocs.io/en/latest/install/notebook-classic.html)

    $ sudo pip3 install --upgrade pip
    $ sudo pip3 install jupyter

Open the firewall for port 8888.

    $ sudo firewall-cmd --permanent --zone=public --add-port=8888/tcp
    $ sudo firewall-cmd --reload

Generate the config file.

    $ jupyter notebook --generate-config

Edit the config file.

    $ vi .jupyter/jupyter_notebook_config.py

Change the IP address setting.

    ## The IP address the notebook server will listen on.
    #c.NotebookApp.ip = 'localhost'
    c.NotebookApp.ip = '*'

Run notebook.

    $ jupyter notebook
    
    ...
    
    To access the notebook, open this file in a browser:
        file:///home/opc/.local/share/jupyter/runtime/nbserver-4505-open.html
    Or copy and paste one of these URLs:
        http://localhost:8888/?token=b7dac861311a8742dfc6942bf03433d883adb62f1f1739ab
     or http://127.0.0.1:8888/?token=b7dac861311a8742dfc6942bf03433d883adb62f1f1739ab

Access the public IP address with the token provided.

- http://<public_ip_address>:8888/?token=b7dac861311a8742dfc6942bf03433d883adb62f1f1739ab

For setting a password, run below and restart.

    $ jupyter notebook password
    Enter password: 
    Verify password: 

## Connect to Graph Server using Jupyter

In[1]: (Please replace username and password)

```py
import json
import os
import platform
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError
import pypgx as pgx

base_url = "https://localhost:7007"
username = "<username>"
password = "<password>"

def generateToken():
    body = json.dumps({ 'username': username, 'password': password }).encode('utf8')
    headers = { 'content-type': 'application/json' }
    request = Request(base_url + '/auth/token', data=body, headers=headers)
    try:
        response = urlopen(request).read().decode('utf-8')
        return json.loads(response).get('access_token')
    except HTTPError as err:
        if err.code == 400:
            print('Authentication failed no username/password given')
        elif err.code == 401:
            print('Authentication failed invalid username/password')
        else:
            print("Server returned HTTP response code: {} for URL: {}".format(err.code, err.url))
        os._exit(1)
 
session = pgx.get_session(base_url=base_url, token=generateToken())
analyst = session.create_analyst()
print(session)
```

Out[1]:

    PgxSession(id: 6b8f2964-7606-44f9-84b9-a3a018379baf, name: python_pgx_client)

In[2]:

```py
graph = session.get_graph("hr")
graph
```

Out[2]:

    PgxGraph(name: hr, v: 215, e: 509, directed: True, memory(Mb): 0)