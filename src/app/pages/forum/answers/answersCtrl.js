/**
 * @author a.demeshko
 * created on 28.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.forum')
    .controller('answersCtrl', answersCtrl);

  /** @ngInject */
  function answersCtrl($scope, $state, $stateParams) {
  	console.log("This is answers Ctrl.");
  	console.log($stateParams);
  	$scope.answers = $stateParams.answers;
    // var vm = this;
    // vm.mail = mailMessages.getMessageById($stateParams.id);
    // vm.label = $stateParams.label;
  }

})();
