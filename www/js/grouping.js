/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var lecturerId=localStorage.getItem ("userId");;
var members=3;
var url = 'http://localhost/smartunimobile/';
var loader=function(){

};



var randomGrouping = function(){
    $('#groupsdata').html('<div id="preloader"></div>');
    var elm=$('#jdegree');
    var year=$(elm).find(':selected').data('year');
    var semester=$(elm).find(':selected').data('semester');
    var degree=$(elm).find(':selected').data('degree');
    $.ajax({
        url : url + 'grouping.php',
        type : 'get',
        dataType : 'json',
        data : {
            'token' : 'dev20',
            'grouping' : '1',
            'degree' : degree,
            'year' : year,
            'semester' : semester,
            'members' : members

        },
        success : function(r){
            if(r.error=='notfound'){
                $('#groupsdata').html('<hr/><div class="alert alert-danger">No data found to display!</div>');
            }
            else {
                str = '<hr/>';
                var groupno = 1;

                str+='<button class="btn btn-default form-control" onclick="window.location=\''+url+r.pdf+'\'"><span class="glyphicon glyphicon-download"></span> Download PDF</button><br/><br/>';


                r.groups.forEach(function (el) {

                    subg = '<ul class="list-group">';
                    el.forEach(function (subl) {
                        subg += '<li class="list-group-item">' + subl.id + '</li>';
                    });
                    subg += '</ul>';

                    str += '<div class="panel panel-primary">' +
                        '<div class="panel-heading">Group ' + (groupno++) + '</div>' +
                        '<div class="panel-body">' +
                        subg +
                        '</div>' +
                        '</div>';
                });

                $('#groupsdata').html(str);
            }
        }
    });
};

$(document).ready(function(){
    loader();
    $('#jback').click(function(){
        window.location='home.html';
    });

    $('#nofmembers li').click(function(){
        members= parseInt($(this).text());
        $('#nofmembers li').removeClass('active');
        $(this).addClass('active');
    });



    $.ajax({
        url : url +'grouping.php',
        type : 'get',
        dataType : 'json',
        data : {
            'token' : 'dev20',
            'getdegrees' : '1',
            'lecturer' : lecturerId
        },
        success : function(r){
            var degree=document.getElementById('jdegree');
            r.forEach(function(el){
                var elm=document.createElement('option');
                elm.setAttribute('data-year',el.cyear);
                elm.setAttribute('data-semester',el.csemester);
                elm.setAttribute('data-degree',el.id);
                elm.textContent=el.name + '( Y:'+el.cyear+')';

                degree.appendChild(elm);
            });
        }
    });

    $('#jgrouping').click(function(){
        randomGrouping();
    });

});



var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
		
        this.receivedEvent('deviceready');

    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {

    }
};

app.initialize();