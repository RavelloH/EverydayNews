## Author: RavelloH
## LICENSE: MIT
## 使用第三方API

import urllib
from urllib.request import Request, urlopen, urlretrieve, urlopen, build_opener,ProxyHandler
from wget import download
import time,datetime
import os,re

url = "https://api.03c3.cn/zb/api.php"
res=urlopen(url)    
data = res.read()
# 转换成字符串
strs = str(data)
# 截取字符串
pattern = re.compile(r'[a-zA-z]+://[^\s"]*')
strs_for_json = pattern.search(strs).group()

now = datetime.datetime.now()+ datetime.timedelta(hours=8)
nowY = now.strftime("%Y")
nowM = now.strftime("%m")
nowD = now.strftime("%d")
nowt = now.strftime("%Y-%m-%d")
print(nowt)
os.makedirs('./'+str(nowY)+'/'+str(nowM)+'/',exist_ok=True)
# 保存到本地
path=download(strs_for_json,out='./'+str(nowY)+'/'+str(nowM)+'/'+nowt+'.jpg')
print(path)
