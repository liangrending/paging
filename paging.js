function paging(){
	if(!(this instanceof paging))
	{
		return new paging();
	}
	this.pageInfo = {
		currentPage: 1,
		nextFlag: false,
		lastFlag: false
	};
}
paging.prototype = {
	config:function(obj){
		try{
			this.setDataSourse(obj.dataSourse);
			this.setPageSize(obj.pageSize);
			this.setParentDiv(document.getElementById(obj.id));
			var fields = [];
			var fieldsName = [];
			this.setButtonImg(obj.imgSrc);
			/*for(let v in obj.feilds)
			{
				feilds.push(v);
				feildsName.push(obj.feilds[v]);
			}*/
			this.column = obj.column;
			this.setType();
			for(var i = 0; i < obj.column.length; i++){
				fields.push(obj.column[i]['field']);
				fieldsName.push(obj.column[i]['fieldName']);
			}
			this.setFeilds(fields);
			this.setFeildsName(fieldsName);
		}catch(e){
			console.log(e.message);
		}
		var _this = this;
		if(obj.homePageButton != undefined){
			document.getElementById(obj.homePageButton.id).addEventListener("click",function(e){
				_this.homePage();
				e.stopPropagation();
				if(typeof obj.homePageButton.callback == "function")
				{
					_this.reflashFlagInfo();
					obj.homePageButton.callback(_this.pageInfo);
				}
			});
		}
		if(obj.lastPageButton != undefined){
			document.getElementById(obj.lastPageButton.id).addEventListener("click",function(e){
				_this.lastPage();
				e.stopPropagation();
				if(typeof obj.lastPageButton.callback == "function")
				{
					_this.reflashFlagInfo();
					obj.lastPageButton.callback(_this.pageInfo);
				}
			});
		}
		if(obj.nextPageButton != undefined){
			document.getElementById(obj.nextPageButton.id).addEventListener("click",function(e){
				_this.nextPage();
				e.stopPropagation();
				if(typeof obj.nextPageButton.callback == "function")
				{
					_this.reflashFlagInfo();
					obj.nextPageButton.callback(_this.pageInfo);
				}
			});
		}
		if(obj.skipPageButton != undefined){
			document.getElementById(obj.skipPageButton.buttonId).addEventListener("click",function(e){
				var node = document.getElementById(obj.skipPageButton.textId);
				var text = node.innerHTML || node.value;
				var message;
				if(!isNaN(parseInt(text))){
					if(_this.skipPage(parseInt(text)))
					{
						message = true;
					}
					else
					{
						message = "页数超出限制";
					}
				}
				else{
					message = "读取跳转页数失败，请检查节点配置";
				}
				e.stopPropagation();
				if(typeof obj.skipPageButton.callback == "function")
				{
					_this.reflashFlagInfo();
					obj.skipPageButton.callback(_this.pageInfo,message);
				}
			});
		}
		this.init(obj.titleFlag);
	},
	moneyFormat:function(num){
		switch(typeof num){
			case 'string':
				num = parseFloat(num);
			case 'number':
				return num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g,"$1,");
				break;
		}
	},
	dateFormat1:function(date){
		var str = date.replace(/(\S+)\s(\S+)/,"$1")
		return str;
	},
	dateFormat2:function(date){
		var str = date.replace(/(\S+)\s(\S+)/,"$1"); 
		return str;
	},
	textFormat:function(str){
		return str;
	},
	setButtonImg:function(src){
		this.imgSrc = {
			last_gray: src.last_gray,
			last_red: src.last_red,
			next_red: src.next_red,
			next_gray: src.next_gray
		};
	},
	/*设置跳转区域*/
	setFootContain:function(){
		var foot = document.createElement("div");
		var footContain = document.createElement("div");
		this.imgLast = document.createElement("img");
		this.imgNext = document.createElement("img");
		foot.className = "paging_table_foot";
		footContain.className = "paging_table_foot_contain";
		this.imgLast.className = "paging_table_foot_img";
		this.imgNext.className = "paging_table_foot_img";
		foot.appendChild(footContain);
		footContain.appendChild(this.imgLast);
		footContain.appendChild(this.imgNext);
		this.body.appendChild(foot);
		this.setPageButton();
		this.setPageButtonClick();
	},
	/*设置按钮来源*/
	setPageButton:function(){
		if(this.pageInfo.lastFlag == false){
            this.imgLast.src = this.imgSrc.last_gray;
        }
        else{
            this.imgLast.src = this.imgSrc.last_red;
        }
        if(this.pageInfo.nextFlag == true) {
            this.imgNext.src = this.imgSrc.next_red;
        }
        else{
            this.imgNext.src = this.imgSrc.next_gray;
        }
	},
	/*设置按钮事件*/
	setPageButtonClick:function(){
		var _this = this;
		this.imgLast.addEventListener("click",function(){
			_this.lastPage();
			_this.setPageButton();
		});
		this.imgNext.addEventListener("click",function(){
			_this.nextPage();
			_this.setPageButton();
		});
	},
	/*设置其它属性*/
	setAttribute:function(){

		for(var i = 0; i < this.column.length; i++){
			for(var j = 0; j < this.span.length; j++){
				if(j < this.td.length){
					this.td[j][i].width = this.column[i].width;
				}
				this.span[j][i].style.width = this.column[i].width+"px";
			}
		}
		
	},
	//设置类型
	setType:function(){
		this.type = {
			date:this.dateFormat1,
			money:this.moneyFormat,
			text:this.textFormat
		};
	},
	init:function(titleFlag){
		this.page = 0;
		this.pageIndexFlag = new Array();
		for(var i = 0; i < this.pageSize; i++)
		{
			this.pageIndexFlag[i] = false;

		}
		/*初始化之前先清空父级子元素*/
		var childList = this.body.childNodes;
		for(var x = childList.length-1; x >= 0; x--)
		{	
			this.body.removeChild(childList[x]);
		}
		//对一个数字进行向上舍入
		this.maxSize =  Math.ceil(this.datas.length/this.pageSize);
		this.table = document.createElement("table");
		this.table.className = "paging_table_class";
		this.td = new Array();
		this.span = new Array();
		this.tr = new Array();
		var trTitle = document.createElement("tr");
		this.trIndex = 0;
		var tdTitleArray = new Array();
		var spanTitleArray = new Array();
		/*表格标题*/
		
		if(titleFlag != false){
			for(var i = 0; i < this.feildsName.length; i++)
			{
				tdTitleArray[i] = document.createElement("td");
				spanTitleArray[i] = document.createElement("div");
				spanTitleArray[i].innerHTML = this.feildsName[i];
				tdTitleArray[i].appendChild(spanTitleArray[i]);
				trTitle.appendChild(tdTitleArray[i]);

				spanTitleArray[i].style.width = this.column[i]['width'] + "px";
				tdTitleArray[i].width = this.column[i]['width'];
				spanTitleArray[i].style.cssText += this.column[i]['style'];
			}
			this.table.appendChild(trTitle);
		}
		/*表格内容，渲染第一页*/
		for(var i = 0; i < this.pageSize && i < this.datas.length; i++)//小于页码及小于数据源长度，防止数据源不到页码时报错
		{
			this.tr[i] = document.createElement("tr");
			this.tr[i].index = i;
			this.trIndex = i+1;
			this.td[i] = new Array();
			this.span[i] = new Array();
			for(var j = 0; j < this.feildsName.length; j++)
			{
				this.td[i][j] = document.createElement("td");
				this.span[i][j] = document.createElement("div");
				this.span[i][j].className = "pagin_table_contain";
				this.span[i][j].index = i; //第几列 
				
			
				this.span[i][j].innerHTML = this.type[this.column[j]['type']](this.datas[i][this.feilds[j]]);
				this.span[i][j].style.cssText = this.column[j]['style'];

				this.td[i][j].appendChild(this.span[i][j]);
				this.tr[i].appendChild(this.td[i][j]);
			}
			this.table.appendChild(this.tr[i]);
		}
		/*后面的页数*/
		for(var i = this.pageSize; i < this.datas.length; i++)
		{
			this.span[i] = new Array();
			this.trIndex = i+1;
			for(var j = 0; j < this.feildsName.length; j++)
			{
				this.span[i][j] = document.createElement("div");
				this.span[i][j].className = "pagin_table_contain";
				this.span[i][j].index = i; 
				
				this.span[i][j].innerHTML = this.type[this.column[j]['type']](this.datas[i][this.feilds[j]]);
				this.span[i][j].style.cssText = this.column[j]['style'];

			}
		}
		this.body.appendChild(this.table);
		if(this.datas.length == 0){
			var noDataDiv = document.createElement("div");
			noDataDiv.innerHTML = "暂无数据";
			noDataDiv.className = "paging_no_data_info";
			this.body.appendChild(noDataDiv);
		}
		this.reflashFlagInfo();
		this.setFootContain();
		this.setAttribute();
	},
	reflashFlagInfo:function(){
		this.pageInfo.currentPage = parseInt(this.page) + 1;
		if(this.page == 0){
			this.pageInfo.lastFlag = false;
		}
		else{
			this.pageInfo.lastFlag = true;
		}
		if(this.maxSize - this.page == 1){
			this.pageInfo.nextFlag = false;
		}
		else{
			this.pageInfo.nextFlag = true;
		}
	},
	homePage:function(){		
		this.page = 0;
		this.clearAddTr();
		this.getPageInfo();
		this.reflashFlagInfo();
	},
	lastPage:function(){
	 	if(this.page >= 1){
			this.page = this.page - 1;
			this.clearAddTr();
			this.getPageInfo();
			this.reflashFlagInfo();
		}
		else
		{
			this.reflashFlagInfo();
			return false;
		}
	},
	nextPage:function(){
		if(this.page <=  this.maxSize - 2){
			this.page = parseInt(this.page) + 1;
			this.clearAddTr();
			this.getPageInfo();
			this.reflashFlagInfo();
		}
		else{
			this.reflashFlagInfo();
			return false;
		}
	},
	skipPage:function(pageNum){
		this.page = pageNum - 1;
		if(this.page >= 0 && this.page < this.maxSize)
		{
			this.clearAddTr();
			this.getPageInfo();
			this.reflashFlagInfo();
			return true;
		}
		else
		{
			this.reflashFlagInfo();
			return false;
		}
	},
	getPageInfo:function(){
		for(var i = this.page*this.pageSize, j = 0; j < this.pageSize; i++,j++)
		{
			for(var k = 0; k < this.feilds.length; k++)
			{
				this.td[j][k].style.visibility= "visible";//将所有td设为可见
				var childList = this.td[j][k].childNodes;
				for(var x = childList.length-1; x >= 0; x--)//由于删除节点的时候节点的长度也在减小，从后往前删除节点
				{	
					this.td[j][k].removeChild(childList[x]);
				}
				if(i < this.datas.length)//大循环已经限制了页码，此处只需防止数据源长度不够
				{
					this.td[j][k].appendChild(this.span[i][k]);
				}
				else
				{
					this.td[j][k].style.visibility= "hidden " // 一页四个，现在只剩三条数据，剩下的一个td设为不可见，不然有条空数据在后面
				}
				/*this.span[j][k].innerHTML = this.datas[i][this.feilds[k]];*/
			}
		}
	},
	setDataSourse:function(dataSourse){ //设置数据源
		this.datas = dataSourse;
	},
	getDataSourse:function(){   
		return this.datas;
	},
	setPageSize:function(pageSize){  //设置每页最多显示的条数
		this.pageSize = pageSize;
	},
	getPageSize:function(){
		return this.pageSize;
	},
	setParentDiv:function(parentDiv){ //设置父级div
		this.body = parentDiv;
		this.body.className += " paging_contian";
	},
	setFeilds:function(feilds){  //设置字段属性
		this.feilds = feilds;
	},
	getFeilds:function(){
		return this.feilds;
	},
	setFeildsName:function(feildsName){
		this.feildsName = feildsName;
	},
	getFeildsName:function(){
		return this.feildsName;
	},
	setChangeEvent:function(changeEvent){
		this.change = changeEvent;
	},
	getCurrentPageNum:function(){
		return this.page;
	},
	modifyField:function(feildNum,addHtml,flag,rowIndex){
		if(flag == "template")
		{	
			this.span[rowIndex][feildNum].innerHTML = addHtml;
		}
		else
		{
			for(var i = 0; i < this.span.length; i++)
			{
				/*var childList = this.td[i][feildNum].childNodes;*/
				var text = this.span[i][feildNum].innerHTML;
   				/*this.td[i][feildNum].removeChild(childList[0]);*/
   				if(flag)
   				{
   					this.span[i][feildNum].innerHTML = addHtml;
   				}
  	 			else
   				{
		   			this.span[i][feildNum].innerHTML = addHtml + text;
   				}
			}
		}
	},
    templete:function(feildNum,functionName){
		var _this = this;
		this.modifyEvent(feildNum,"template",function(rowdata,rowIndex){
			var html = functionName(rowdata,rowIndex);
			_this.modifyField(feildNum , html ,"template",rowIndex);
		});
    },
	modifyEvent:function(feildNum,eventType,functionName){
		if(eventType == "template")
		{
			for(var i = 0; i < this.span.length; i++)
			{
				 functionName(this.datas[i],i);
			}
		}
		else if(feildNum == "tr")
		{
			for(var i = 0; i < this.tr.length; i++)
			{
				var _this = this;
				this.tr[i].addEventListener(eventType,function(){
					functionName(_this.datas[this.index]);
				});
			}
		}
		else
		{
			for(var i = 0; i < this.span.length; i++)
			{
				var _this = this;
				this.span[i][feildNum].addEventListener(eventType,function(){
					functionName(_this.datas[this.index]);//对this的妙用
				});
			}
		}
	},
	//增加节点
	addTr:function(index,trNode){
		index = index % this.pageSize;
		var indexOf = index;
		for(var i = 0; i < index; i++)
		{
			if(this.pageIndexFlag[i] == true)
				indexOf = indexOf + 1;
		}
		if(this.pageIndexFlag[index] == false)
		{
			this.table.insertBefore(trNode,this.table.childNodes[indexOf+2]);
			this.pageIndexFlag[index] = true;
			return true;		
		}
		else
		{
			return false;
		}
	},
	//删除节点
	deleteTr:function(index){
		index = index % this.pageSize;
		var indexOf = index;
		for(var i = 0; i < index; i++)
		{
			if(this.pageIndexFlag[i] == true)
				indexOf = indexOf + 1;
		}
		if(this.pageIndexFlag[index] == true)
		{
			this.table.removeChild(this.table.childNodes[indexOf+2]);
			this.pageIndexFlag[index] = false;	
			return true;
		}
		else
		{
			return false;
		}
	},
	//清楚所有增加节点
	clearAddTr:function(){
		for(var i = 0 ;i < this.pageIndexFlag.length;i++)
		{
			if(this.pageIndexFlag[i] == true)
			{
				this.table.removeChild(this.table.childNodes[i+2]);
			}
		}
		for(var i = 0; i < this.pageSize; i++)
		{
			this.pageIndexFlag[i] = false;
		}
	}
}