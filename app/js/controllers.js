'use strict';

/* Controllers */

var indexSegmentApp = angular.module('indexSegmentApp', []);

indexSegmentApp.controller('IndexCtrl', function ($scope) {
    //preselect index type
    $scope.indexType = 1;
});


//phonecatApp.controller('PhoneListCtrl', function ($scope) {
//    $scope.phones = [
//      {
//          'name': 'Nexus S',
//          'snippet': 'Fast just got faster with Nexus S.'
//      },
//      {
//          'name': 'Motorola XOOM™ with Wi-Fi',
//          'snippet': 'The Next, Next Generation tablet.'
//      },
//      {
//          'name': 'MOTOROLA XOOM™',
//          'snippet': 'The Next, Next Generation tablet.'
//      }
//    ];
//});