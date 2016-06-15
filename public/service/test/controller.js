angular.module("Translate",[
    
]).controller("TranslateController",function($scope){
    console.log("Hello Angular");
    
    
    
    var THIS = this;
    
    THIS.concat = function(data){
        $scope.input =  $scope.input+" concat this";
    }
});