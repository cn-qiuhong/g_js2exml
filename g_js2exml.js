/*
 create by qiuhong
 2017.3.17
 将egret编译生成的.g.js混合成一个js文件
 */
let fs = require("fs");
let path = require("path");
let readline = require("readline");

//------------------Array--------------

//查询是否含有指定元素
function hasO(arr, o) {
	return arr.indexOf(o) >= 0;
}

//最后的参数，arg：数组，倒数第几个（默认1）
function lasT(arr, arg) {
	if (arr.length < 1)return;
	arg = arg || 1;
	return arr[arr.length - arg];
}

//------------------Object----------------------

//填加属性
function addKV(o, k, v) {
	if (k instanceof Array) {
		for (let i = 0; i < k.length; i++) {
			o[k[i]] = v[i];
		}
	}//k键v值
	else if (k instanceof Object) {
		for (let i in k) {
			o[i] = k[i];
		}
	}//k键值对
	else if (typeof k == "string") {
		o[k] = v;
	}//k键v值
}

//深拷贝，一般数据、对象或数组
function clonE(o) {
	let c;
	if (o instanceof Array) c = [];
	else if (o instanceof Object) c = {};
	else return o;
	for (let key in o) {
		if (o[key] instanceof Object) c[key] = clonE(o[key]);//对象或数组
		else c[key] = o[key];
	}
	return c;
}

//格式化，去函数，return:新对象
function formaT(ob) {
	let o = {};
	for (let i in ob) {
		if (typeof ob[i] != "function") o[i] = ob[i];
		else if (typeof ob[i] == "object") o[i] = formaT(ob[i]);//无效，无法去除子对象中的函数
	}
	return o;
}

//--------------------String--------------------

//判断两个字符串相等，不管",'引号
String.prototype.equal_wuyf = function (s) {
	return this.quYinhao() == s.quYinhao();
};

/*
 获取index处s串后面的有效内容（英文数字）
 [type：default：普通变量，object：对象{}，array：数组[]，string：字符串（含引号），kuohao：圆括号()]
 [num：要第几个有效内容，默认第一个]
 return:括号和普通变量无左右边值，其他有
 */
String.prototype.get = function (s, index, type, num) {
	s = s || "";//s串可以为空
	let tx = this.slice(index + s.length), fh = 0, start = 0, startnum = 0, endnum = 0;
	for (let i = 0; i < tx.length; i++) {
		let c = tx.charCodeAt(i);
		if (type == "object") {
			if (c == 123) {
				startnum++;
				if (startnum == 1) start = i;
			}
			else if (c == 125 && startnum > 0) {
				endnum++;
				if (endnum == startnum) fh++;//左右括号数量相等时返回
			}
		}//对象
		else if (type == "array") {
			if (c == 91) {
				startnum++;
				if (startnum == 1) start = i;
			}
			else if (c == 93 && startnum > 0) {
				endnum++;
				if (endnum == startnum) fh++;//左右括号数量相等时返回
			}
		}//数组
		else if (type == "string") {
			if (c == 34 || c == 39) {
				if (startnum == c) fh++;//结束
				else if (!startnum) {
					start = i;
					startnum = c;
				}//开始
			}
		}//字符串
		else if (type == "kuohao") {
			if (c == 40) {
				startnum++;
				if (startnum == 1) start = i + 1;
			}
			else if (c == 41 && startnum > 0) {
				endnum++;
				if (endnum == startnum) fh++;//左右括号数量相等时返回
			}
		}//圆括号
		else if (type == "fenhao") {
			if (!startnum) {
				if (c == 36) startnum = 1;//$
				else if (c == 45) startnum = 1;//负号
				else if (c >= 48 && c <= 57) startnum = 1;//数字
				else if (c >= 65 && c <= 90) startnum = 1;//大写字母
				else if (c == 95) startnum = 1;//下划线
				else if (c >= 97 && c <= 122) startnum = 1;//小写字母
				if (startnum) start = i;
				if (c == 34 || c == 39) {
					startnum = 1;
					i++;
					start = i;
				}
			}//开始
			else if (c == 59) {
				fh++;
				let pc = tx.charCodeAt(i - 1);
				if (pc == 34 || pc == 39) i--;//引号"'
			}//结束
			if (startnum && i == tx.length - 1)return tx.substring(start);
		}//到句末（分号）
		else {
			if (!startnum) {
				if (c == 36) startnum = 1;//$
				else if (c == 45) startnum = 1;//负号
				else if (c >= 48 && c <= 57) startnum = 1;//数字
				else if (c >= 65 && c <= 90) startnum = 1;//大写字母
				else if (c == 95) startnum = 1;//下划线
				else if (c >= 97 && c <= 122) startnum = 1;//小写字母
				if (startnum) start = i;
			}//开始
			else {
				if (c < 48 || c > 122) fh++;
				else if (c > 57 && c < 65) fh++;
				else if (c > 90 && c < 95) fh++;
				else if (c == 96) fh++;
			}//结束
			if (startnum && i == tx.length - 1)return tx.substring(start);
		}//普通变量
		
		if (fh) {
			if (fh < num) {
				startnum = 0;
				endnum = 0;
				num--;
				fh = 0;
			}
			else {
				//普通变量i的位置已经不是有效内容，其他的为}]"'
				if (type == "object" || type == "array" || type == "string") i++;
				//圆括号不要)即不要i位数据，取出字符串可以用逗号分割
				return tx.substring(start, i);
			}
		}//返回有效内容
	}
	if (type)return "";//空字符串用if判断其值为假
	else  return tx;
};

//把has和get整合的：获取第num个s串后面第n2个有效内容，num,type，n2可不置
String.prototype.getByNum = function (s, num, type, n2) {
	let index = this.has(s, num);
	if (isNaN(index))return;
	return this.get(s, index, type, n2);
};

//查询第num个s子串的位置，num默认为空，num<=1时都当1算
String.prototype.has = function (s, num) {
	let tp = this.indexOf(s);
	if (num > 1) {
		//如果递归函数返回nan，所有返回都变成nan，所以只用判断是否为nan就行，如果改为返回原值，则多次查找后仍然可能会返回大于-1的值，表示查到了（其实根本没有）
		if (tp >= 0) return this.slice(tp + s.length).has(s, num - 1) + s.length + tp;
		else return NaN;
	}
	else return tp < 0 ? NaN : tp;//判断用if（返回值）就可以了，不用判断返回值是否>=0
};

//去实例化，只要传入对象的参数
String.prototype.quShilihua = function () {
	let result = this.getByNum("", 0, 'kuohao');
	if (result)return result;
	else return this;
};

//去引号
String.prototype.quYinhao = function () {
	let l = this.length, s = this.charCodeAt(0), e = this.charCodeAt(l - 1);
	if (s == e && (s == 34 || s == 39)) return this.substring(1, l - 1);
	return this;
};

//双引号转单引号
String.prototype.syh2dyh = function () {
	return this.replace(/"/g, "'");
};

//字符串转数组，专门为egret编译生成的.g.js做处理
String.prototype.toArray = function () {
	let c = this.charCodeAt(0), str;
	if (c == 91) str = this.substring(1, this.length - 1);//91:[
	else str = this;
	let btns = [], btjsq = 1;
	while (1) {
		let s = this.has("new egret.gui.ButtonSkin", btjsq);
		if (s >= 0) {
			let v = this.get("new egret.gui.ButtonSkin", 0, "kuohao", btjsq);
			btns.push(`@ButtonSkin(${v.syh2dyh()})`);
			btjsq++;
			continue;
		}
		break;
	}
	let a = str.split(", "), b = [], sy = 0;
	for (let i = 0; i < a.length; i++) {
		if (a[i].indexOf("new egret.gui.ButtonSkin") >= 0) {
			b.push(btns[sy]);
			let mj = btns[sy].match(/,/g);
			if (mj) i += mj.length;
			sy++;
			continue;
		}
		if (a[i].charCodeAt(0) == 34) {
			b.push(a[i]);
			if (a[i].charCodeAt(a[i].length - 1) != 34) {
				let bl = b.length, j = 1;
				while (a[i + j].charCodeAt(a[i + j].length - 1) != 34) {
					b[bl] += a[i + j];
					i++;
				}
			}//一条属性被分隔成多段了，例如一个字符串中用了分隔符号(, )英文的逗号+空格
		}
		else b.push(a[i].quShilihua());
	}
	return b;
};

//字符串转json
String.prototype.toJson = function () {
	let result;
	try {
		result = JSON.parse(this);
	}
	catch (e) {
		// console.log(e);
		return this;
	}
	return result;
};

//-----------------------------------------

//反编译
let files, xiewenjiancount = 0,
	tdf = {path: './scene/', name: 'ShowcaseSkin.g.js'}, allfile = 1;//allfile真时批处理，否则编译单文件
function decompilation() {
	if (allfile) {
		files = getFileList("./");//获取该路径下的所有文件
		files = shaiXuanJsfile(files);
		for (let f of files) {
			let rl = readline.createInterface({
				input: fs.createReadStream(f.path + f.name)
			});
			let filedata = "";
			rl.on('line', (line) => {
				filedata += line.trim() + " ";
			});
			rl.on("close", () => {
				jieXi(filedata, f.path);
			});
			if (!fs.existsSync("./skins")) fs.mkdirSync("./skins");
		}
	}
	else {
		let rl = readline.createInterface({
			input: fs.createReadStream(tdf.path + tdf.name)
		});
		let filedata = "";
		rl.on('line', (line) => {
			filedata += line.trim() + " ";
		});
		rl.on("close", () => {
			jieXi(filedata);
		});
	}
}

//获取文件夹下的所有文件
function getFileList(path) {
	let filesList = [];
	readFileList(path, filesList);
	return filesList;
}

//获取对应的键值
function getStateValue(jxo, key) {
	let o = {};
	if (!jxo.states)return o;
	for (let i in jxo.states) {//i 1层键名，state名
		let t1 = jxo.states[i];
		for (let j in t1) {//j 2层键名，id
			let t2 = t1[j];
			if (key.equal_wuyf(j)) {
				for (let k in t2) {//k 3层键名，属性名，
					if (k == "includeIn") {
						o.includeIn = o.includeIn || [];
						o.includeIn.push(i);
					}
					else {
						let t3 = t2[k];//属性值
						o[k.quYinhao() + "." + i.quYinhao()] = t3.quYinhao();
					}
				}
			}//检查key和id是否一样
		}
	}
	return o;
}

//解析
let jxo;//解析对象最外层
function jieXi(data, fpath) {
	data = data.getByNum("var skins;", 0, "kuohao");//过滤一些高版本在之前生成的东西
	jxo = {name: "Skin"};
	jxo.packname = data.getByNum("var ", 1);//包名
	jxo.skinname = data.getByNum("var ", 2);//皮肤名，例：buttonskin
	if (jxo.skinname.has("Skin")) jxo.skinrname = jxo.skinname.substr(0, jxo.skinname.length - 4);//皮肤名skin前部分，例：button
	else jxo.skinrname = jxo.skinname;//也有例外，没有skin后缀的
	jxo.zishenshuxing = {};
	jxo.zssxkey = [];
	jxo.zssxvalue = [];
	jxo.elements = [];
	jxo.transitions = [];
	jxo.additems = [];
	
	let hsk = data.getByNum("function " + jxo.skinname, 0, "object"),
		k = data.getByNum("this.__s(this,", 0, "array"), i, v;
	if (k) {
		i = data.has("this.__s(this,", 0) + 5;
		v = data.get("this.__s(this,", i, "array");
		addKV(jxo.zishenshuxing, k.toJson(), v.toArray());
	}//根节点属性，构造函数
	
	k = data.getByNum("this.states =", 0, "array");
	if (k) {
		jxo.states = {};
		let j = 1;
		while (k.getByNum("new egret.gui.State(", j, "string")) {
			i = k.getByNum("new egret.gui.State(", j, "string");
			jxo.states[i] = {};
			j++;
			let temp = k.getByNum(i, 1, "array");//[]
			let a = 1, st = jxo.states[i];
			let tpk = temp.getByNum("new egret.gui.SetProperty", a, "kuohao");
			while (tpk) {
				let tp = tpk.split(", ");
				let s = tpk.has("new egret.gui.ButtonSkin");
				if (s >= 0) {
					let v = tpk.get("new egret.gui.ButtonSkin", 0, "kuohao");
					tp[2] = `@ButtonSkin(${v.syh2dyh()})`;
				}
				if (tp[0] != `""`) addKV(st[tp[0]] = st[tp[0]] || {}, tp[1], tp[2]);
				else addKV(st[`"jxoroot"`] = st[`"jxoroot"`] || {}, tp[1], tp[2]);
				a++;
				tpk = temp.getByNum("new egret.gui.SetProperty", a, "kuohao");
			}//()
			a = 1;
			tpk = temp.getByNum("new egret.gui.AddItems", a, "kuohao");
			while (tpk) {
				let tp = tpk.split(", ");//4个元素，自己函数名，父级函数名，位置关系，后面节点函数名
				addKV(st[tp[0]] = st[tp[0]] || {}, "includeIn", 1);
				let h;
				for (h = 0; h < jxo.additems.length; h++) {
					let item = jxo.additems[h];
					if (item[0] == tp[0])break;
				}
				if (h >= jxo.additems.length) jxo.additems.push(tp);//不要重复添加
				a++;
				tpk = temp.getByNum("new egret.gui.AddItems", a, "kuohao");
			}
		}
		addKV(jxo.zishenshuxing, getStateValue(jxo, "jxoroot"));//从根节点的state上获取当前子节点的属性
	}//states
	
	i = 1;//单一的自身属性，要排除某些特定组，见变量paichuzu，还有子节点
	let items = [];
	while (hsk.getByNum("this.", i)) {
		k = hsk.getByNum("this.", i);
		v = hsk.getByNum("this." + k + " = ");
		if (k == "transitions") {
			let pianduan = hsk.getByNum("this.transitions = ", 0, "array");
			let j = 1;
			while (pianduan.getByNum("this.", j)) {
				let temp = pianduan.getByNum("this.", j);
				let o = jiexiElements(data, temp, jxo);
				if (o) jxo.transitions.push(o);
				j++;
			}
		}
		else if (!hasO(paichuzu, k) && v) {
			jxo.zishenshuxing[k] = v;
		}//自身属性
		else if (k == "elementsContent") {
			let pianduan = hsk.getByNum("this.elementsContent = ", 0, "array");
			let j = 1;
			while (pianduan.getByNum("this.", j)) {
				let temp = pianduan.getByNum("this.", j);
				let o = jiexiElements(data, temp, jxo);
				if (o) jxo.elements.push(o);
				j++;
			}
		}//子节点
		else if (!isNaN(hsk.has("this." + k + "();"))) {
			let o = jiexiElements(data, k, jxo);
			if (o) jxo.elements.push(o);
			else items.push(k);
		}//函数调用，大部分也是子节点
		i++;
	}
	
	for (let k = 0; k < items.length; k++) {
		let it = items[k];
		for (i = 0; i < jxo.additems.length; i++) {
			let a = jxo.additems[i], o, name = a[0].quYinhao() + "_i";
			if (it != name)continue;
			let pid = a[1].quYinhao(), wz = a[2].quYinhao(), hid = a[3].quYinhao();
			o = jiexiElements(data, name, jxo, a[1]);
			if (!o)continue;
			let p = getElements(jxo, pid) || jxo;
			if (wz == "first") p.elements.unshift(o);
			else if (wz == "before") {
				for (let j = 0; j < p.elements.length; j++) {
					let e = p.elements[j];
					if (e.name == hid) {
						p.elements.splice(j, 0, o);
						break;
					}
				}
			}
			else if (wz == "last") p.elements.push(o);
		}
	}
	// for (i = 0; i < jxo.additems.length; i++) {
	// 	let a = jxo.additems[i], o, name = a[0].quYinhao() + "_i", pid = a[1].quYinhao(), wz = a[2].quYinhao(), hid = a[3].quYinhao();
	// 	o = jiexiElements(data, name, jxo, a[1]);
	// 	if (!o)continue;
	// 	let p = getElements(jxo, pid) || jxo;
	// 	if (wz == "first") p.elements.unshift(o);
	// 	else if (wz == "before") {
	// 		for (let j = 0; j < p.elements.length; j++) {
	// 			let e = p.elements[j];
	// 			if (e.name == hid) {
	// 				p.elements.splice(j, 0, o);
	// 				break;
	// 			}
	// 		}
	// 	}
	// 	else if (wz == "last") p.elements.push(o);
	// }//additems
	
	writeExml(jxo, fpath);
	
	//获取所有子节点
	function getElements(n, id) {
		if (!n || !n.elements || n.elements.length < 1)return;
		for (let i = 0; i < n.elements.length; i++) {
			let e = n.elements[i];
			if (e.name == id)return e;
			let jg = getElements(e, id);
			if (jg)return jg;
		}
	}
}

//解析子节点,arg:全文字符串，函数名，顶级解析对象
let paichuzu = ["layout", "elementsContent", "states", "__s"];//排除组
function jiexiElements(data, hsm, jxo, parent) {
	// log("-------------" + hsm);
	let hsmd = hsm.substr(0, hsm.length - 2);
	for (let i = 0; i < jxo.additems.length; i++) {
		let a = jxo.additems[i];
		if (hsmd == a[0].quYinhao() && parent != a[1])return;
	}
	
	let o = {name: hsm, modul: [], elements: []}, v, k;
	addKV(o.zishenshuxing = {}, getStateValue(jxo, hsmd));//从根节点的state上获取当前子节点的属性
	let hsk = data.getByNum("p." + hsm, 0, "object"),//函数块
		khw = hsk.indexOf("("), i = 1;
	
	k = hsk.has("this." + hsmd + " = t");//id
	if (!isNaN(k) && hsmd.indexOf("__") != 0) o.zishenshuxing.id = hsmd;
	else o.id = parseInt(hsmd.substr(2));
	o.name = hsmd;//name
	
	o.modul.push(hsk.getByNum("var t = new "));//模块名，依次排序
	while (hsk.has(".", i) < khw) {
		o.modul.push(hsk.getByNum("var t = new ", 1, null, i + 1));
		i++;
	}
	
	let mokuaiming = "", mkkey = "";//命名空间
	for (let i = 0; i < o.modul.length - 1; i++) {
		let n = o.modul[i];
		if (i > 0) {
			mokuaiming += `.${n}`;
			mkkey += `_${n}`;
		}
		else {
			mokuaiming += n;
			mkkey += n;
		}
	}
	if (mkkey != "egret_gui") {
		let mmkj = jxo.namespace || {};
		mmkj[mkkey] = mokuaiming;
		jxo.namespace = mmkj;
		o.namespace = mkkey;
	}
	
	if (hsk.has("var t = {}")) o.modul.push("Object");//对象
	
	k = hsk.getByNum("this.__s(t,", 0, "array");
	if (k) {
		i = hsk.has("this.__s(t,", 0) + 5;
		v = hsk.get("this.__s(t,", i, "array");
		addKV(o.zishenshuxing, k.toJson(), v.toArray());
	}//该节点属性，构造函数
	
	//单一的自身属性，要排除某些特定组，见变量paichuzu
	i = 1;
	while (hsk.getByNum("t.", i)) {
		k = hsk.getByNum("t.", i);
		v = hsk.getByNum("t." + k + " = ");
		if (!hasO(paichuzu, k) && v) {
			if (v == "new") {
				v = hsk.getByNum("t." + k + " = ", 0, "kuohao");
				if (v) {
					if (hsk.getByNum("t." + k + " = new egret.gui.ButtonSkin")) {
						o.zishenshuxing[k] = `@ButtonSkin(${v.syh2dyh()})`;
					}
					else o.zishenshuxing[k] = v;
				}
			}//new一个对象时传入的属性
			else if (v != "this") {
				v = hsk.getByNum("t." + k + " = ", 0, "fenhao");
				o.zishenshuxing[k] = v;
			}//自身属性
			else if (v == "this") {
				v = hsk.getByNum(`t.${k} = this.`, 0, "fenhao");//v可能为undefined，可能为this的方法调用，这两种情况都要排除
				if (v && v == hsk.getByNum(`t.${k} = this.`)) o.zishenshuxing[k] = `{${v}}`;
			}//自身属性，对根节点的子节点引用，例如：t.target=this.markRemember;
		}
		i++;
	}
	i = 1;
	while (hsk.getByNum(`t.setStyle`, i, "kuohao")) {
		k = hsk.getByNum(`t.setStyle`, i, "kuohao");
		v = k.split(", ");
		o.zishenshuxing[v[0]] = v[1];
		i++;
	}
	
	k = hsk.getByNum("t.layout = this.");//layout
	if (k) {
		let e = jiexiElements(data, k, jxo);
		if (e) o.layout = e;
	}
	
	i = 1;//子节点
	while (hsk.getByNum("this.", i)) {
		k = hsk.getByNum("this.", i);
		if (!isNaN(hsk.has("this." + k + "()")) && isNaN(hsk.has("t.layout = this." + k))) {
			let e = jiexiElements(data, k, jxo);
			if (e) o.elements.push(e);
		}//要排除是layout节点的情况
		i++;
	}
	
	o.exlh = 1;//子节点先layout后
	if (o.layout) {
		let queding;
		for (let i of o.elements) {
			if (i.id == null)continue;
			if (i.id > o.layout.id) {
				o.exlh = 0;
				queding = 1;
				break;
			}
			else break;
		}
		if (!queding && o.layout.id + 1 < o.id) o.exlh = 0;
	}
	
	return o;
}

//打印信息
function log(tx) {
	console.log(tx);
}

//读取path路径下的所有文件
function readFileList(path, filesList) {
	let files = fs.readdirSync(path);
	files.forEach(function (itm, index) {
		let stat = fs.statSync(path + itm);
		if (stat.isDirectory()) {
			//递归读取文件
			readFileList(path + itm + "/", filesList)
		}
		else {
			let obj = {};//定义一个对象存放文件的路径和名字
			obj.path = path.substr(2);//路径
			obj.name = itm;//名字
			filesList.push(obj);
		}
	})
}

//筛选.g.js文件
function shaiXuanJsfile(files) {
	let jsfs = [];
	files.forEach((file) => {
		let temp = file.name.split("."), tlen = temp.length;
		if (temp[tlen - 1] == "js" && temp[tlen - 2] == "g") {
			jsfs.push(file);
		}
	});
	return jsfs;
}

//生成exml
let fengbimokuai = ["Group", "Scroller", "DataGroup", "List"];
function writeExml(jxo, fpath) {
	let ws;
	if (files) {
		if (!fs.existsSync("./skins/" + fpath)) fs.mkdirSync("./skins/" + fpath);
		ws = fs.createWriteStream("./skins/" + fpath + jxo.skinname + ".exml",
			{flags: 'w', defaultEncoding: 'utf8', fd: null, mode: 0o666, autoClose: true});
	}//批处理
	else {
		ws = fs.createWriteStream(tdf.path + jxo.skinname + ".exml",
			{flags: 'w', defaultEncoding: 'utf8', fd: null, mode: 0o666, autoClose: true});
	}//单文件
	ws.write('<?xml version="1.0" encoding="utf-8"?>\n');
	ws.write('<e:Skin xmlns:e="http://ns.egret-labs.org/egret" xmlns:w="http://ns.egret-labs.org/wing"');
	
	if (jxo.namespace) {
		for (let k in jxo.namespace) {
			let v = jxo.namespace[k];
			ws.write(` xmlns:${k}="${v}.*"`);
		}
	}//命名空间
	
	let zsx = jxo.zishenshuxing;//自身属性
	if (zsx) {
		ws.write('\n\t');
		for (let i in zsx) {
			ws.write(` ${i}="${zsx[i].quYinhao()}"`);
		}
	}
	ws.write('>\n\t<w:HostComponent name="egret.gui.' + jxo.skinrname + '" />\n');
	
	let st = jxo.states;
	if (st) {
		ws.write('\t<e:states>\n');
		for (let i in st) {
			ws.write('\t\t<e:State name=' + i + ' />\n');
		}
		ws.write('\t</e:states>\n');
	}
	
	let ts = jxo.transitions;
	if (ts && ts.length > 0) {
		ws.write(`\t<e:transitions>\n`);
		for (let i of ts) {
			writeElement(i, 2);
		}
		ws.write(`\t</e:transitions>\n`);
	}
	
	let es = jxo.elements;
	if (es && es.length > 0) {
		for (let i of es) {
			writeElement(i, 1);
		}
	}
	
	ws.end('</e:Skin>');
	if (files) log("解析进度：" + (++xiewenjiancount) + "/" + files.length);
	
	//写子节点，arg：节点内容，层次（对齐用）
	function writeElement(e, cc) {
		// log(e);
		if (e.namespace) write_t(`<${e.namespace}:` + lasT(e.modul), cc);
		else write_t('<e:' + lasT(e.modul), cc);
		
		let zsx = e.zishenshuxing,
			lo = e.layout,
			es = e.elements;
		if (zsx) {
			for (let i in zsx) {
				if (i == "percentHeight") ws.write(' percentHeight="' + zsx[i] + '%"');
				else if (i == "percentWidth") ws.write(' percentWidth="' + zsx[i] + '%"');
				else if (i == "includeIn") {
					ws.write(` includeIn="`);
					for (let j = 0; j < zsx[i].length; j++) {
						if (j == 0) ws.write(`${zsx[i][j].quYinhao()}`);
						else ws.write(`,${zsx[i][j].quYinhao()}`);
					}
					ws.write(`"`);
				}
				else ws.write(' ' + i.quYinhao() + '="' + zsx[i].quYinhao() + '"');
			}
		}
		if (hasO(fengbimokuai, lasT(e.modul)) || (es && es.length > 0)) ws.write('>\n');//自身属性结束
		else ws.write(' />\n');//自身属性结束
		
		if (es.length > 0 || lo) {
			if (e.exlh) {
				for (let i of es) {
					writeElement(i, cc + 1);
				}
			}
			if (lo) {
				write_t('<e:layout>\n', cc + 1);
				writeElement(lo, cc + 2);
				write_t('</e:layout>\n', cc + 1);
			}
			if (!e.exlh) {
				for (let i of es) {
					writeElement(i, cc + 1);
				}
			}
			//该节点结束
			if (e.namespace) write_t(`</${e.namespace}:` + lasT(e.modul) + '>\n', cc);
			else write_t('</e:' + lasT(e.modul) + '>\n', cc);
		}
		else if (hasO(fengbimokuai, lasT(e.modul))) {
			if (e.namespace) write_t(`</${e.namespace}:` + lasT(e.modul) + '>\n', cc);
			else write_t('</e:' + lasT(e.modul) + '>\n', cc);
		}//该节点结束
	}
	
	//格式化写入，带层次
	function write_t(tx, cc) {
		let a = 0;
		while (a < cc) {
			a++;
			ws.write('\t');
		}
		ws.write(tx);
	}
}

decompilation();