'use strict';

/* Controllers */

var indexSegmentApp = angular.module('indexSegmentApp', []);

indexSegmentApp.controller('IndexCtrl', function ($scope) {

    //define type enum
    var IndexEnum = Object.freeze({
        TRIANGULAR: 1,
        TRAPEZOID: 2,
    })


    var resolution = 100;


    //preselect index type
    $scope.indexType = IndexEnum.TRIANGULAR;



    //Calclate [time, position, velocity] array for the specified segment
    $scope.calculate = function () {

        switch ($scope.indexType) {
            case IndexEnum.TRIANGULAR:
                return CalculateTriangularSegment();
            case IndexEnum.TRAPEZOID:
                return CalculateTrapezoidSegment();
            default:
                return null;
        }
    }


    // Calculates data for triangular segment
    var CalculateTriangularSegment = function() {

        var tf = parseFloat($scope.tf, 10);
        var t0 = parseFloat($scope.t0, 10);
        var v0 = parseFloat($scope.v0, 10);
        var vf = parseFloat($scope.vf, 10);
        var s0 = parseFloat($scope.s0, 10);
        var sf = parseFloat($scope.sf, 10);

        var halfTime = (tf + t0) / 2;

        //dividing area under velocity curve into 4 sections - A1, A2, A3, A4
        //A1 and A3 are easy to calculate - only depend on given conditions v0, vf, t, tf
        var A1 = (halfTime - t0) * v0;
        var A3 = (tf - halfTime) * vf;

        //re-arranging area formulas and solving set of 3 equations of 3 unknowns gets us the following formulas
        //for A4, vm and A2
        var A4 = (sf - s0 - A1 - vf * halfTime / 2 + v0 * halfTime / 2 - A3) / 2;

        //vm - velocity in the middle of the segment
        var vm = 2 * A4 / halfTime + vf;
        var A2 = A4 + vf * halfTime / 2 - v0 * halfTime / 2;

        //distance travelled is all the areas added up
        var distance = A1 + A2 + A3 + A4;

        if (distance != (sf - s0))
            throw new Error("calculation did not pass distance check");


        debugger;

        var duration = tf - t0;

        var increment = duration / resolution;

        //initalize array
        var result = new Array();

        //calculate acceleration 
        var a0 = (vm-v0) / (halfTime - t0);
        var t = t0;

        //doing first half
        while (t <= halfTime) {

            var s = s0 + v0 * t + 0.5 * a0 * Math.pow(t, 2);      // s = s0 + v0t + 1/2 at^2
            var v = v0 * t + a0 * t;

            //create time, velocity, distance point
            var point = [t, v, s];
            
            //add point to result
            result.push(point);

            //increment time
            t += increment;
        }

        //doing second half, recalculating initial
        t = halfTime;

        //initial values in the middle of the triangle
        var sInit = s0 + v0 * t + 0.5 * a0 * Math.pow(t, 2); 
        var vInit = vm;

        a0 = (vm - vf) / (tf - halfTime);

        

        while (t <= tf) {

            var s = sInit + vInit * t + 0.5 * a0 * Math.pow(t, 2);      // s = s0 + v0t + 1/2 at^2
            var v = vInit * t + a0 * t;

            //create time, velocity, distance point
            var point = [t, v, s];

            //add point to result
            result.push(point);

            //increment time
            t += increment;
        }

        return result;

    }


});

