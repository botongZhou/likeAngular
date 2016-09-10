/**
 * Created by admin on 2016/9/10.
 */
//dom加载完成触发事件，执行，寻找所有hz-bind属性元素，将dom与k存在一个数组里
var $scope={};
var $digest=[];
var divs=document.querySelectorAll('div');
HTMLElement.prototype.getScopeObj=function(){
    var scopeObj=null;
    var k=this.getAttribute('hz-bind');
    k&&(scopeObj={keys:getKeys(k),dom:this});
    return scopeObj
};
function getValueByKeys(obj,keys){
    var result=obj;
    for(var i=1;i<keys.length;i++){
        result=result[keys[i]];
    }
    return result
}
function getKeys(k){
    k=k.replace(/\[/g,'.');
    k=k.replace(/\]/g,'');
    var keys=k.split('.');
    return keys;
}
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
for(var i=0,l=divs.length;i<l;i++){
    var k=divs[i].getScopeObj();
    k&&$digest.push(k);
}
$digest=orderByProperty($digest);
//为$scope对象每个属性绑定set方法
for(var k in $digest){
  Object.defineProperty($scope,k,{
      set:(function(k){
          return function(nv){
              this['_'+k]=nv;
              for(var i=0;i<$digest[k].length;i++){
                  $digest[k][i].dom.innerHTML=getValueByKeys(nv,$digest[k][i].keys);
              }
          }
      })(k)
  })
}
$scope.v1=1;
$scope.v2=2;
$scope.v4={v41:1};
$scope.v5=[{v51:5},2];