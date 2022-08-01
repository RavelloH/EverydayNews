## Author: RavelloH

## LICENSE: MIT

## 使用第三方API

import urllib

from urllib.request import Request, urlopen, urlretrieve, urlopen, build_opener,ProxyHandler

import random

from wget import download

import time # 反反爬

import os

url = "https://api.xiaolu520.cn/api/60s.php"

res=urlopen(url)    

now = time.localtime()

nowY = time.strftime("%Y", now)

nowM = time.strftime("%m", now)

nowD = time.strftime("%d", now)

nowt = time.strftime("%Y-%m-%d", now)

print(nowt)

os.makedirs('./'+str(nowY)+'/'+str(nowM)+'/',exist_ok=True)

# 保存到本地

path=download(url,out='./'+str(nowY)+'/'+str(nowM)+'/'+nowt+'.jpg')

print(path)
