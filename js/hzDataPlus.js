/**
 * Created by admin on 2016/9/10.
 */
//dom加载完成触发事件，执行，寻找所有hz-bind属性元素，将dom与k存在一个数组里
var $scope={};
var $digest=[];
var $hz=['hz-bind','hz-model','hz-true-value','hz-false-value'];
var $instructionConfig={
    val:['hz-bind','hz-model'],
    css:['hz-class','hz-show','hz-hide','hz-style'],
    eve:['hz-click','hz-change','hz-click','hz-keydown'],
    attr:['hz-href','hz-src'],
    form:['hz-model','hz-true-value','hz-false-value'],
    repeat:['hz-repeat','hz-options']
}
//将指令值转换的数组及name作为dom属性[{ins:'hz-xx',keys:[xx,xx]},{}]
//返回dom所有指令值及dom对象
HTMLElement.prototype.getScopeObj=function(){
    var scopeObjs=[];
    var k=getAttr(this);
    if(k.length>0){
        this.instruction=[];
        for(var i=0;i<k.length;i++){
            this.instruction.push({ins:k[i].name,key:k[i].key});
            scopeObjs.push({keys:getKeys(k[i].key),dom:this});
        }
    }
    return scopeObjs
};
//设置dom值，并监测数据变化.每种指令对应的值都应该和dom相关
//与html内容相关 hz-model hz-bind
//与样式相关 hz-class hz-show hz-hide hz-style
//与事件相关hz-change hz-click hz-keydown hz-keyup hz-keypress hz-mouse....
//与dom其他属性相关hz-href hz-src
//与表单相关hz-model hz-true-value hz-false-value
//与循环有关hz-repeat hz-options
HTMLElement.prototype.setValue=function(v){
    for(var i=0,l=this.instruction.length;i<l;i++){
        var k=this.instruction[i];
        if($instructionConfig.val.toString().indexOf(k.ins)>-1){//hz-bind hz-model
            if(this.value===undefined){
                this.innerHTML=v;
            }else{
                this.value=v;
            }
            if(k.ins=='hz-model'){
                console.log(k.key)
                this.addEventListener('change',function setVal(){
                    var v2=this.value;
                    var trueK=this.getAttribute('hz-true-value');
                    var falseK=this.getAttribute('hz-false-value');
                    trueK&&this.checked==true&&(v2=isNaN(Number(trueK))?Number(trueK):trueK===true?true:trueK);
                    falseK&&this.checked==false&&(v2=isNaN(Number(falseK))?Number(falseK):falseK===false?false:falseK);
                    console.log(v2,k.key)
                    setValueByKeys(getKeys(k.key),v2);
                    // if(trueK||falseK){
                    //     this.removeEventListener('change',setVal,false);
                    // }
                },false);
            }
        }else if($instructionConfig.css.toString().indexOf(k.ins)>-1){
            switch(k.ins){
                case 'hz-class':
                   this.className+=(' '+v);
                   break;
                case 'hz-show':
                    this.style.display=v?'block':'none';
                    break;
                case 'hz-hide':
                    this.style.display=v?'none':'block';
            }
        }else if($instructionConfig.eve.toString().indexOf(k.ins)>-1){
            typeof v=='function'&&this.addEventListener(k.ins.substr(3),v,false);
        }else if($instructionConfig.attr.toString().indexOf(k.ins)>-1){
            switch(k.ins){
                case 'hz-href':
                    this.href=v;
                    break;
                case 'hz-src':
                    this.src=v;
                    break;
            }
        }else if(k.ins!='hz-model'&&$instructionConfig.form.toString().indexOf(k.ins)>-1){
            switch(k.ins){
                case 'hz-true-value':
                    this.checked=v==k.key?true:false;
                    break;
                case 'hz-false-value':
                    this.checked=v==k.key?false:true;
                    break;
            }
        }
    }

}
//获取指令值
function getAttr(dom){
    var ks=[];
    for(var i=0;i<$hz.length;i++){
        var k=dom.getAttribute($hz[i]);
        k&&ks.push({name:$hz[i],key:k});
    }
    return ks
}
//通过属性数组获取value
function getValueByKeys(obj,keys){
    var result=obj;
    for(var i=1;i<keys.length;i++){
        result=result[keys[i]];
    }
    return result
}
//通过绑定的数据改变$scope属性值
function setValueByKeys(keys,v){
    var obj=$scope;
    for(var i=0;i<keys.length-1;i++){
        obj=obj[keys[i]];
    }
    obj[keys[keys.length-1]]=v;
}
//将绑定k变为属性数组
function getKeys(k){
    k=k.replace(/\[/g,'.');
    k=k.replace(/\]/g,'');
    var keys=k.split('.');
    return keys;
}
//将$digest以$scope直接子属性分组
function orderByProperty(arr){
    //result=[k:[{k:xx,dom:xx},{k:xx,dom:xx}]]
    var result=[];
    for(var i=0;i<arr.length;i++){
        if(!result[arr[i].keys[0]]){
            result[arr[i].keys[0]]=[arr[i]];
        }else{
            result=result[arr[i].keys[0]].push(arr[i]);
        }
    }
    return result
}
//遍历dom树，获取所有digest对象
traversal(document.body);
function traversal(node){
    //对node的处理
    if(node && node.nodeType === 1){
        var k=node.getScopeObj();
        k.length>0&&($digest=$digest.concat(k));
    }
    var i = 0, childNodes = node.childNodes,item;
    for(; i < childNodes.length ; i++){
        item = childNodes[i];
        if(item.nodeType === 1){
            //递归先序遍历子节点
            traversal(item);
        }
    }
}
$digest=orderByProperty($digest);
//为$scope对象每个属性绑定set方法,实现双向数据绑定
for(var k in $digest){
    Object.defineProperty($scope,k,{
        get:(function(k){return function(){return this['_'+k]}})(k),
        set:(function(k){
            return function(nv){
                this['_'+k]=nv;
                for(var i=0;i<$digest[k].length;i++){
                    $digest[k][i].dom.setValue(getValueByKeys(nv,$digest[k][i].keys));
                }
            }
        })(k)
    })
}
//为ngmodel指令绑定change事件

$scope.v1='hhhh';
$scope.v2=2;
$scope.v4={v41:1};
$scope.v5=[{v51:5},2];
$scope.i1=3;
$scope.i2={i21:[{i23:3}]};
$scope.ic1=-3;
setInterval(function(){
    $scope.v2++;
    console.log($scope.ic1,$scope.v2,$scope.i1,$scope.i2.i21[0].i23)
},1000)