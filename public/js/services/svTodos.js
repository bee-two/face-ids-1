var app=angular.module("app.todos");

app.factory("svTodos",["$http", function ($http) {
    return {
        get: function () {
            return $http.get("/nodetodo")
        },
        create: function (todoData) {
            return $http.post("/nodetodo", todoData);
        },
        update: function (todoData){
            return $http.put("/nodetodo",todoData);
        },
        updateFn: function (todoData){
            return $http.put("/nodetodofn",todoData);
        },
        delete: function (id){
            return $http.put("/nodetododel", id);
        },
        getchat: function (id_user) {
            return $http.post("/getchat", id_user);
        },
        // token: function () {
        //     return $http.post("/token");
        // }

    };
}]);