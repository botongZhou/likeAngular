/**
 * Created by admin on 2016/9/10.
 */
//dom加载完成触发事件，执行，寻找所有hz-bind属性元素，将dom与k存在一个数组里
var $scope={};
var $digest=[];
var $hz=['hz-bind','hz-model'];
//返回dom所有指令值及dom对象
HTMLElement.prototype.getScopeObj=function(){
    var scopeObjs=[];
    var k=getAttr(this);
    if(k.length>0){
      for(var i=0;i<k.length;i++){
          scopeObjs.push({keys:getKeys(k[i]),dom:this})
      }
    }
    return scopeObjs
};
//设置dom值，并监测数据变化
HTMLElement.prototype.setValue=function(v){
    if(this.value===undefined){
        this.innerHTML=v;
    }else{
        this.value=v;
    }
    if(this.getAttribute('hz-model')){
        this.addEventListener('change',function(){
          var keys=this.getAttribute('hz-model');
          keys=getKeys(keys);
          setValueByKeys(keys,this.value)
        },false)
    }
}
//获取指令值
function getAttr(dom){
    var ks=[];
    for(var i=0;i<$hz.length;i++){
        var k=dom.getAttribute($hz[i]);
        k&&ks.push(k);
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
setInterval(function(){
    console.log($scope.i1,$scope.i2.i21[0].i23)
},1000)