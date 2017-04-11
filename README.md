# g_js2exml
<br>反编译egret gui exml文件编译生成的.g.js
<br>egret引擎版本2.5.6（其他版本应该也可以，没测试过）
<br>需要安装nodejs环境 https://nodejs.org/en/
<br>使用说明：将g_js2exml.js放到需要反编译的目录下，用nodejs运行g_js2exml.js（或者把start.bat也放到相同目录下，双击start.bat）。运行时g_js2exml.js文件所在目录下的所有.g.js后缀名的文件（含文件夹中的.g.js文件）都会被反编译为exml文件，exml文件在skins中，层次结构和.g.js一样。
