/**
 * @author a.demeshko
 * created on 28.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.forum')
    .controller('questionsCtrl', questionsCtrl);

  /** @ngInject */
  function questionsCtrl($scope, $state, $stateParams) {
  	console.log("This is questionsCtrl.");
  	console.log($stateParams);
  	$scope.questionId = $stateParams.questionId;
  }

})();
