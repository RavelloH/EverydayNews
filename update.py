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

# 发送请求

# 处理请求

data = res.read()

# 转换成字符串

strs = str(data)

# 截取字符串

strs_for_json = strs[63:]

k=1

while '",' in strs_for_json:

    strs_for_json = strs_for_json[:-k]

strs_for_json = strs_for_json[:-1]

print(strs_for_json)

now = time.localtime()

nowY = time.strftime("%Y", now)

nowM = time.strftime("%m", now)

nowD = time.strftime("%d", now)

nowt = time.strftime("%Y-%m-%d", now)

print(nowt)

os.makedirs('./'+str(nowY)+'/'+str(nowM)+'/',exist_ok=True)

# 保存到本地

path=download(strs_for_json,out='./'+str(nowY)+'/'+str(nowM)+'/'+nowt+'.jpg')

print(path)
