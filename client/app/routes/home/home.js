'use strict';

angular.module('dreamCatcherApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/routes/home/home.html',
        controller: 'HomeCtrl',
        authenticate: true,
        resolve: {
        	navchainWait: function(navchain) {
        		return navchain.init();
        	}
        }
      });
  });