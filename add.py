# -*- coding: utf-8 -*-
## Author: RavelloH
## LICENSE: MIT
## 使用第三方API

import urllib
from urllib.request import Request, urlopen, urlretrieve, urlopen, build_opener,ProxyHandler
from wget import download
import time,datetime
import os,re
import json
from retrying import retry

@retry(wait_fixed=2)
def openurl(d):
    print('opening...')
    global textcontext
    textcontext=urlopen(d)
    

for i in range(76):
    now = datetime.datetime.now() + datetime.timedelta(hours=8) - datetime.timedelta(days=i)
    nowY = now.strftime("%Y")
    nowM = now.strftime("%m")
    nowD = now.strftime("%d")
    nowt = now.strftime("%Y-%m-%d")
    print(nowt)
    texturl = "https://api.blogs.ink/api/today/?date="+nowt
    os.makedirs('./'+str(nowY)+'/'+str(nowM)+'/',exist_ok=True)
    
    # 文字版生成
    f=open('./'+str(nowY)+'/'+str(nowM)+'/'+nowt+'.txt','w+')
    f2=open('./'+str(nowY)+'/'+str(nowM)+'/'+nowt+'.json','w+')
    openurl(texturl)
    try:
        textdata=textcontext.read()
        textjson = json.loads(textdata)
        textresult=''
        for i in textjson['data']['content']:
            textresult=textresult+i+'\n'
        f.write(textresult.replace('&#34;','"'))
        f2.write(str(textjson))
    except:
        print('err:'+nowt)
    time.sleep(2)
