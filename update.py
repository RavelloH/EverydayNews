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
import ssl

url = "https://api.noome.cn/zb/60spng.php"
texturl = "https://60s.viki.moe/60s?e=json"
res=urlopen(url)    
data = res.read()
# 转换成字符串
#strs = str(data)
# 截取字符串
#pattern = re.compile(r'[a-zA-z]+://[^\s"]*')
#strs_for_json = pattern.search(strs).group()

now = datetime.datetime.now()+ datetime.timedelta(hours=8)
nowY = now.strftime("%Y")
nowM = now.strftime("%m")
nowD = now.strftime("%d")
nowt = now.strftime("%Y-%m-%d")
print(nowt)
os.makedirs('./'+str(nowY)+'/'+str(nowM)+'/',exist_ok=True)

# 文字版生成
context=ssl._create_unverified_context()
f=open('./'+str(nowY)+'/'+str(nowM)+'/'+nowt+'.txt','w+')
f2=open('./'+str(nowY)+'/'+str(nowM)+'/'+nowt+'.json','w+')
os.remove('./latest.txt')
os.remove('./latest.json')
f3=open('./latest.txt','w+')
f4=open('./latest.json','w+')
textcontext=urlopen(texturl,context=context)
textdata=textcontext.read()
textjson = json.loads(textdata)
textresult=''
for i in textjson['data']:
    textresult=textresult+i+'\n'
f.write(textresult.replace('&#34;','"'))
f2.write(str(textjson))
f3.write(textresult.replace('&#34;','"'))
f4.write(str(textjson))
# 保存到本地
path=download(url,out='./'+str(nowY)+'/'+str(nowM)+'/'+nowt+'.jpg')
os.remove('./latest.jpg')
download(url,out='./latest.jpg')
print(path)
