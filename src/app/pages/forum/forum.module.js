/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.forum', [])
      .config(routeConfig)
      .service('forumService', forumService)
      .controller('forumCtrl', forumCtrl);

  /** @ngInject */
  function routeConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('forum', {
          url: '/forum',
          templateUrl: 'app/pages/forum/forum.html',
          title: 'Forum',
          sidebarMeta: {
            icon: 'ion-android-chat',
            order: 200,
          },
        }).state('forum.questions.answers', {
          url: '/:answerId',
          templateUrl: 'app/pages/forum/answers/answers.html',
          title: 'Forum',
          controller: 'answersCtrl'
        }).state('forum.questions', {
          url: '/:questionId',
          templateUrl: 'app/pages/forum/questions/questions.html',
          title: 'Forum',
          controller: 'questionsCtrl'
        });
    $urlRouterProvider.when('/forum', '/forum/questions');
  }
  function forumCtrl($scope, forumService){
    $scope.service = forumService;
    $scope.ForumList = [];
    $scope.$watch('service.getForums()', function(_new){
      $scope.ForumList = _new;
    });
  }
  function forumService($rootScope){
    this.rootScope = $rootScope;
    this.Forums = [];
    this.getForumsFromServer = function(_this){
      $.ajax({
          method: 'GET',
          data: {},
          url: "http://localhost/crypto/forum/",
          success: function(data){
            var Forums = JSON.parse(data);
            _this.Forums = Forums;
          }
      });
    }
    this.getForumsFromServer(this);
    this.getForums = function(){
      return this.Forums;
    }
  }

})();
