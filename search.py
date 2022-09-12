# -*- coding: utf-8 -*-
## 使用有问题请到github.com/ravelloh/RPageSearch提ISSUE
### Author: RavelloH
#### MICENCE: MIT
##### RPageSearch
import os
import time,datetime
from bs4 import BeautifulSoup
import json

## JSON标准格式
main_structure_head='{"news":['
main_structure_end=']}'
inner_structure_1='{"title":"'
inner_structure_2='","time":"'
inner_structure_3='","text":"'
inner_structure_4='"}'

## 遍历所有文件
# 获取时间差 
d1 = '2022-06-05' #0605
nowfor = datetime.datetime.now() + datetime.timedelta(hours=8)
d2 = nowfor.strftime("%Y-%m-%d")
date1 = datetime.datetime.strptime(d1, "%Y-%m-%d").date()
date2 = datetime.datetime.strptime(d2, "%Y-%m-%d").date()
days = (date2 - date1).days

# 重组json
json_all = main_structure_head
for i in range(days):
    now = datetime.datetime.now() - datetime.timedelta(hours=24*i)
    nowY = now.strftime("%Y")
    nowM = now.strftime("%m")
    nowD = now.strftime("%d")
    nowt = now.strftime("%Y-%m-%d")
    try:
        with open('./'+nowY+'/'+nowM+'/'+nowt+'.json','r') as f:
            try:
                text = f.read().replace("'",'"')
                jsons = json.loads(text)
                time = jsons['data']['updated'][:10]
                title = time.replace('-','年',1).replace('-','月',1)+'日'
                content = jsons['data']['content']
                # 重构json title time
                json_all = json_all + inner_structure_1 + title + inner_structure_2 + time + inner_structure_3
        
                # 内容循环
                for j in range(3,len(content)-1):
                    json_all = json_all + content[j] + '  '
                json_all = json_all + inner_structure_4 + ','
            except:
                 pass
    except:
        pass
json_all = json_all[:-1] + main_structure_end

total_str = 'var SearchResult = "' + json_all.replace('"','\\"') + '"'
## 写入JSON
with open('searchdata.js','w+') as f1:
    f1.write(total_str)
