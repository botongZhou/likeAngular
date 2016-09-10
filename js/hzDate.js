/**
 * Created by admin on 2016/9/10.
 */
//dom加载完成触发事件，执行，寻找所有hz-bind属性元素，将dom与k存在一个数组里
var $scope={};
var divs=document.querySelectorAll('div');
HTMLElement.prototype.bind=function(){
    var k=this.getAttribute('hz-bind');
    // if(k&&k.indexOf('.')>-1){
    //     var k2=k.substr(k.indexOf('.')+1);
    //     k=k.substr(0,k.indexOf('.'));
    //     console.log(k);
    // }
    var that=this;
    console.log(k,1)
    k&&Object.defineProperty($scope,k,{
        set:function(nv){
            that.innerHTML=nv;
            this['_'+k]=nv;
        }
    })
};

for(var i=0,l=divs.length;i<l;i++){
    divs[i].bind();
}
$scope.v1=1;
$scope.v2=2;
$scope.v4={v41:1}