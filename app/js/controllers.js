'use strict';

/* Controllers */

var indexSegmentApp = angular.module('indexSegmentApp', []);

indexSegmentApp.controller('IndexCtrl', function ($scope) {

    //define type enum
    var IndexEnum = Object.freeze({
        TRIANGULAR: "1",
        TRAPEZOID: "2",
    })


    var resolution = 100;
    var EPSILON = 0.0000000000001; 

    //preselect index type
    $scope.indexType = IndexEnum.TRAPEZOID;

    //save typing for testing
    $scope.v0 = '5';
    $scope.vf = '10';
    $scope.s0 = '0';
    $scope.sf = '27.5';
    $scope.t0 = '0';
    $scope.tf = '2';
    $scope.a0 = '2';
    $scope.af = '1';




    //Calclate [time, position, velocity] array for the specified segment
    $scope.calculate = function () {

        switch ($scope.indexType) {
            case IndexEnum.TRIANGULAR:
                return CalculateTriangularSegment();
            case IndexEnum.TRAPEZOID:
                if($scope.a0=='0' && $scope.af=='0')
                    return CalculateTrapezoidalSegment();
                return CalculateTrapezoidalSegmentWithAcceleration();
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

        if (!withinEpsilon(distance, sf - s0, EPSILON))
            throw new Error("calculation did not pass distance check");



        var duration = tf - t0;

        var increment = duration / resolution;

        //initalize array
        var result = new Array();

        //calculate acceleration 
        var a0 = (vm-v0) / (halfTime - t0);
        var t = t0;

        //doing first half
        while (lessThan(t,halfTime,EPSILON)) {

            var s = s0 + v0 * t + 0.5 * a0 * Math.pow(t, 2);      // s = s0 + v0t + 1/2 at^2
            var v = v0 + a0 * t;

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

        a0 = (vf - vm) / (tf - halfTime);

        while (lessThan(t,tf,EPSILON)) {

            var time = t - halfTime;        //account for time correctly

            var s = sInit + vInit * time + 0.5 * a0 * Math.pow(time, 2);      // s = s0 + v0t + 1/2 at^2
            var v = vInit + a0 * time;

            //create time, velocity, distance point
            var point = [t, v, s];

            //add point to result
            result.push(point);

            //increment time
            t += increment;
        }

        return result;

    }


    //calculates data for trapezoidal segment
    var CalculateTrapezoidalSegment = function() {


        //parse input fields as floats
        var tf = parseFloat($scope.tf, 10);     //final time
        var t0 = parseFloat($scope.t0, 10);     //initial time
        var v0 = parseFloat($scope.v0, 10);     //initial velocity
        var vf = parseFloat($scope.vf, 10);     //final velocity
        var s0 = parseFloat($scope.s0, 10);     //initial position
        var sf = parseFloat($scope.sf, 10);     //final position


        var t1 = (tf + 2 * t0) / 3;
        var t2 = (2 * tf + t0) / 3;

        var a = (t1 - t0) / 2;
        var b = (t2 - t1);
        var c = (tf - t2) / 2;

        var A1 = (t1 - t0) * v0;
        var A5 = (tf - t2) * vf;

        var A3 = (sf - s0 - A1 + a * v0 + c * vf - A5) / ((a + b + c) / b);
        var vm = A3 / b;

        var A2 = a * vm - a * v0;
        var A4 = c * vm - c * vf;

        var distance = A1 + A2 + A3 + A4 + A5;
        if (!withinEpsilon(distance,sf-s0,EPSILON))
            throw new Error("calculation did not pass distance check");

        //calculation will be done in thirds

        var duration = tf - t0;

        var increment = duration / resolution;

        //initalize array
        var result = new Array();

        //calculate acceleration 
        var a0 = (vm-v0) / (t1 - t0);
        var t = t0;

        //doing first third
        while (lessThan(t, t1, EPSILON)) {

            var s = s0 + v0 * (t-t0) + 0.5 * a0 * Math.pow(t-t0, 2);      // s = s0 + v0t + 1/2 at^2
            var v = v0 + a0 * (t - t0);

            //create time, velocity, distance point
            var point = [t, v, s];

            //add point to result
            result.push(point);

            //increment time
            t += increment;
        }

        //doing second third, recalculating initial
        t = t1;

        //initial values in the middle of the triangle
        var sInit = s0 + v0 * (t-t0) + 0.5 * a0 * Math.pow(t-t0, 2);
        var vInit = vm;

        a0 = 0; //this is  a trap

        while (lessThan(t, t2, EPSILON)) {

            var time = t - t1;        //account for time correctly

            var s = sInit + vInit * time + 0.5 * a0 * Math.pow(time, 2);      // s = s0 + v0t + 1/2 at^2
            var v = vInit + a0 * time;

            //create time, velocity, distance point
            var point = [t, v, s];

            //add point to result
            result.push(point);

            //increment time
            t += increment;
        }


        //doing last third, recalculating initial
        t = t2;

        //initial values in the middle of the triangle
        var sInit2 = sInit + vInit * (t-t1) + 0.5 * a0 * Math.pow(t-t1, 2);
        var vInit2 = vm;

        a0 = (vf - vm) / (tf - t2);

        while (lessThan(t, tf, EPSILON)) {

            var time = t - t2;        //account for time correctly

            var s = sInit2 + vInit2 * time + 0.5 * a0 * Math.pow(time, 2);      // s = s0 + v0t + 1/2 at^2
            var v = vInit2 + a0 * time;

            //create time, velocity, distance point
            var point = [t, v, s];

            //add point to result
            result.push(point);

            //increment time
            t += increment;
        }

        return result;

    }


    //calculates data for trapezoidal segment
    var CalculateTrapezoidalSegmentWithAcceleration = function () {


        //parse input fields as floats
        var tf = parseFloat($scope.tf, 10);     //final time
        var t0 = parseFloat($scope.t0, 10);     //initial time
        var v0 = parseFloat($scope.v0, 10);     //initial velocity
        var vf = parseFloat($scope.vf, 10);     //final velocity
        var s0 = parseFloat($scope.s0, 10);     //initial position
        var sf = parseFloat($scope.sf, 10);     //final position
        var a0 = parseFloat($scope.a0, 10);     //initial position
        var af = parseFloat($scope.af, 10);     //final position

        var t1 = (tf + 2 * t0) / 3;
        var t2 = (2 * tf + t0) / 3;

        var a = (t1 - t0) / 2;
        var b = (t2 - t1);
        var c = (tf - t2) / 2;

        var A1 = (t1 - t0) * a0;
        var A5 = (tf - t2) * af;

        var A3 = (vf - v0 - A1 + a * a0 + c * af - A5) / ((a + b + c) / b);
        var am = A3 / b;

        var A2 = a * am - a * a0;
        var A4 = c * am - c * af;

        var velocity = A1 + A2 + A3 + A4 + A5;
        if (!withinEpsilon(velocity, vf - v0, EPSILON))
            throw new Error("calculation did not pass distance check");

        //calculation will be done in thirds

        var duration = tf - t0;

        var increment = duration / resolution;

        //initalize array
        var result = new Array();

        //calculate jerk 
        var j = (am - a0) / (t1 - t0);
        var t = t0;

        //doing first third
        while (lessThan(t, t1, EPSILON)) {
            
            var s = s0 + v0 * (t - t0) + 0.5 * a0 * Math.pow(t - t0, 2) + j*Math.pow(t-t0,3)/6;      // s = s0 + v0t + 1/2 at^2 + 1/6jt^3
            var v = v0 + a0 * (t - t0) + 0.5 * j * Math.pow(t - t0, 2);
            var a = a0 + j * (t - t0);

            //create time, velocity, distance point
            var point = [t, a, v, s];

            //add point to result
            result.push(point);

            //increment time
            t += increment;
        }

        //doing second third, recalculating initial
        t = t1;


        //jerk is zero in the middle section
        //initial values in the middle of the triangle
        var sInit = s0 + v0 * (t - t0) + 0.5 * a0 * Math.pow(t - t0, 2) + j * Math.pow(t - t0, 3) / 6;
        var vInit = v0 + a0 * (t - t0) + 0.5 * j * Math.pow(t - t0, 2);
        var aInit = am;

        j = 0;

        while (lessThan(t, t2, EPSILON)) {

            var time = t - t1;        //account for time correctly

            var s = sInit + vInit * time + 0.5 * aInit * Math.pow(time, 2) + j * Math.pow(time, 3) / 6;      // s = s0 + v0t + 1/2 at^2
            var v = vInit + aInit * time;
            var a = aInit + j * (t - t0);      //middle section, acceleration doesn't change

            //create time, velocity, distance point
            var point = [t, a, v, s];

            //add point to result
            result.push(point);

            //increment time
            t += increment;
        }


        //doing last third, recalculating initial
        t = t2;
        
        //initial values in the middle of the triangle
        var sInit2 = sInit + vInit * (t - t1) + 0.5 * aInit * Math.pow(t - t1, 2) + j * Math.pow(t - t1, 3) / 6;
        var vInit2 = vInit + aInit * (t - t1) + 0.5 * j * Math.pow(t - t1, 2);
        var aInit2 = aInit;

        j = (af - am) / (tf - t2);

        while (lessThan(t, tf, EPSILON)) {

            var time = t - t2;        //account for time correctly

            var s = sInit2 + vInit2 * time + 0.5 * aInit2 * Math.pow(time, 2) + j * Math.pow(time, 3) / 6;      // s = s0 + v0t + 1/2 at^2
            var v = vInit2 + aInit2 * time + 0.5 * j * Math.pow(time, 2);
            var a = aInit2 + j * time;

            //create time, velocity, distance point
            var point = [t,a, v, s];

            //add point to result
            result.push(point);

            //increment time
            t += increment;
        }

        return result;

    }




    //compare floats
    function lessThan(numb1, numb2, epsilon) {

        if (numb1 <= numb2)
            return true;

        return numb1 <= numb2 + epsilon;

    }

    //
    function withinEpsilon(numb1, numb2, epsilon) {
        if (numb1 == numb2)
            return true;
        return numb2 < numb1 ? numb2 > (numb1 - epsilon) : numb2 < (numb1 + epsilon);
    }


});


