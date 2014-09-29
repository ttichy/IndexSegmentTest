'use strict';

/* Controllers */

var indexSegmentApp = angular.module('indexSegmentApp', []);

indexSegmentApp.controller('IndexCtrl', function ($scope) {
    //preselect index type
    $scope.indexType = 1;

    //calculate velocity position at specified tim
    $scope.calculate = function (time) {


        debugger;

        var tf = parseFloat($scope.tf, 10);
        var t0 = parseFloat($scope.t0, 10);
        var v0 = parseFloat($scope.v0, 10);
        var vf = parseFloat($scope.vf, 10);
        var s0 = parseFloat($scope.s0, 10);
        var sf = parseFloat($scope.sf, 10);

        var halfTime = (tf - t0) / 2;

        var A1 = (halfTime - t0) * v0;
        var A3 = (tf - halfTime) * vf;
        var A4 = (sf - s0 - A1 - vf * halfTime / 2 + v0 * halfTime / 2 - A3)/2;

        var vm = 2 * A4 / halfTime + vf;

        var A2 = A4 + vf*halfTime/2 -v0*halfTime/2;


        var distance = A1 + A2 + A3 + A4;

    }


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