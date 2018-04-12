/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
 var exe_cc;
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.chat', [])
      .config(routeConfig)
      .service('chatService', chatService)
      .controller('chatCtrl', chatCtrl)
      .directive('enterSubmit', enterSubmit);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('chat', {
          url: '/chat',
          templateUrl: 'app/pages/chat/chat.html',
          title: 'Chat',
          sidebarMeta: {
            icon: 'ion-chatbox-working',
            order: 300,
          },
        });
  }
  function enterSubmit(){
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        elem.bind('keydown', function(event) {
          var code = event.keyCode;
          if (code === 13) {
            if (event.shiftKey) {
              event.preventDefault();
              if( scope.msgTexts == "")return;
              scope.addMessage(scope.msgTexts);
              if( scope.chat_type == 1){
                scope.changeOrderInTime(0);
              }
              scope.msgTexts = "";
              scope.$apply();
              // $(".chatContents").scrollTop($(".messageBox").position().top);​
            }
          }
        });
      }
    }
  }
  function chatCtrl($scope, chatService, $window){
    exe_cc = $scope;
    $scope.panel1 = "Contact";
    $scope.panel2 = "Recent";
    $scope.chat_type = 0;
    $scope.service = chatService;
    $scope.contactList = [];
    $scope.contactIndex = 0;
    $scope.contactTimeIndex = 0;
    $scope.msgTexts = "";
    $scope.idxForName = 0;
    $scope.idxForTime = 0;
    $scope.addMessage = function(_text){
      console.log(_text);
      var message = {};
      message.name = '@me@';
      var lstBuff = _text.split('\n');
      message.message = _text;
      $scope.contactList[$scope.contactIndex].messages.push(message);
      $scope.contactList[$scope.contactIndex].time = new Date().getTime() / 1000;
    }
    $scope.setContactIndex = function(_index){
      $scope.contactIndex = _index;
      if( $scope.chat_type == 0)
        $scope.idxForName = _index;
      else
        $scope.idxForTime = _index;
    }
    $scope.changeOrderInTime = function(_index){
      $scope.contactList.sort(function(a, b){ if(a.time < b.time)return 1; return -1;});
      $scope.idxForTime = _index;
      $scope.contactIndex = _index;
    }
    $scope.chatTypeChange = function(_type){
      $scope.chat_type = _type;
      if( $scope.chat_type == 0){
        $scope.contactIndex = $scope.idxForName;
        $scope.contactList.sort(function(a, b){if(a.name > b.name)return 1; return -1;});
      }
      else{
        $scope.contactIndex = $scope.idxForTime;
        $scope.contactList.sort(function(a, b){ if(a.time < b.time)return 1; return -1;});
      }
    }
    setTimeout( function(){
      var w = angular.element($window);
      $('.chatList').height( w.height() - $('.chatList').offset().top - 80);
      $('.chatContents').height( w.height() - $('.chatList').offset().top - 180);
      $('.msgContents').height(100 + $('.chat_title').height() + 10);
      $('#msgText').height($('.msgContents').height() - 12);
    }, 100);
    $scope.$watch('service.getContacts()', function(_new){
      $scope.contactList = _new;
      if( $scope.chat_type == 0)
        $scope.contactList.sort(function(a, b){if(a.name > b.name)return 1; return -1;});
      else
        $scope.contactList.sort(function(a, b){ if(a.time > b.time)return 1; return -1;});
    });
  }
  function chatService($rootScope){
    this.rootScope = $rootScope;
    this.Contacts = [];
    this.getContacts = function(){
      return this.Contacts;
    }
    this.getContactList = function(_this){
      $.ajax({
          method: 'GET',
          data: {},
          url: "http://localhost/crypto/chat/",
          success: function(data){
            var contactList = JSON.parse(data);
            _this.Contacts = contactList;
          }
      });
    }
    this.getContactList(this);
  }

})();
