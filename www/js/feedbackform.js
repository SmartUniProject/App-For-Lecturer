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

var lecturerId=localStorage.getItem ("userId");
//var lecturerId=2;
var intervalTimer;
var activeFound=false;
var activeMinutes=2;


var url = 'http://localhost/smartunimobile/';
var loader=function(){
    loadCoursesList();
    //$('#myProgressbar').progressbar(50);
    //alert(5);
    getActiveFeedbackForm();
    window.setInterval(function(){
        getActiveFeedbackForm(true);
    },5000);
};


var downloadLastFeedbackResults = function(){
    $.ajax({
        url : url+'feedback.php',
        type : 'get',
        dataType : 'json',
        data : {
            'token' : 'dev20',
            'getlastfeedbackformdoc' : '1',
            'lecturer' : lecturerId,
            'course' : $('#jcourse').find(':selected').data('course')
        },
        success : function(r){
            if(r.error=='notfound'){
                navigator.notification.alert(
                    'Unable to find last inactive feedback form.',
                    function(){},
                    'Last Feedback form',
                    'Okay'
                );
            }
            else{
                window.location=url+r.file;
            }
        }
    });
};


var loadCoursesList = function(){
    $.ajax({
        url : url +'feedback.php',
        type : 'get',
        dataType : 'json',
        data : {
            'token' : 'dev20',
            'getcourses' : '1',
            'lecturer' : lecturerId
        },
        success : function(r){
            var degree=document.getElementById('jcourse');
            r.forEach(function(el){
                var elm=document.createElement('option');
                elm.setAttribute('data-year',el.cyear);
                elm.setAttribute('data-semester',el.csemester);
                elm.setAttribute('data-degree',el.deg_id);
                elm.setAttribute('data-course',el.id);
                elm.textContent=el.id+' '+el.name;

                degree.appendChild(elm);
            });
        }
    });
};


var loadFeedbackResults = function(id){
    $.ajax({
        url : url +'feedback.php',
        type : 'get',
        dataType : 'json',
        data : {
            'token' : 'dev20',
            'getfeedbackresults' : '1',
            'lecturer' : lecturerId,
            'id' : id
        },
        success : function(r){
            if(r.result[0].seconds>0) {
                str = '<h3 id="ftitle"></h3><h4 id="ftitle2"></h4><br/><div class="list-group">';
                for (i = 1; i <= Object.keys(r.questions).length; i++) {

                    str += '<div class="list-group-item">' +
                        '<div>' + r.questions['q' + i] + '</div><br/>' +
                        '<div class="progress">' +
                        '<div class="progress-bar progress-bar-success active" role="progressbar" aria-valuenow="' + r.result[0]['q' + i] + '" aria-valuemin="0" aria-valuemax="100" style="width:' + r.result[0]['q' + i] + '%">' + +r.result[0]['q' + i] + '%' +
                        '</div>' +
                        '</div>' +

                        '</div>';
                }
                str += '</div>';
                $('#feedback').html(str);

                $('#ftitle').html('Feedback form for '+r.result[0].course_id);
                var remMin=(Math.round(r.result[0].seconds/60));
                if(remMin==0)
                    $('#ftitle2').html('finishing soon!!');
                else
                    $('#ftitle2').html(remMin+' minutes remaining');

            }
            else{
                clearInterval(intervalTimer);
                navigator.notification.alert(
                    'Feedback form submissions are closed. download last form report.',
                    function(){},
                    'Login',
                    'Okay'
                );
                activeFound=false;
                getActiveFeedbackForm();
            }



        }
    });
};

var getActiveFeedbackForm = function(hideLoader){
    if(!hideLoader) $('#feedback').html('<div id="preloader"></div>');
    if(!activeFound) {
        $.ajax({
            url: url + 'feedback.php',
            type: 'get',
            dataType: 'json',
            data: {
                'token': 'dev20',
                'getactivefeedback': '1',
                'lecturer': lecturerId
            },
            success: function (r) {
                if (r.error == 'notfound') {
                    /* ------- no active feedbacks --------- */
                    $('#startnew').fadeIn(1000);
                    $('#feedback').hide();
                }
                else {
                    $('#feedback').fadeIn(1000);
                    $('#startnew').hide();
                    activeFound=true;
                    loadFeedbackResults(r[0].id);
                    intervalTimer = window.setInterval(function () {
                        loadFeedbackResults(r[0].id);
                    }, 10000);
                }
            }
        });
    }
};


var loadDownloadFresh = function(){
    runonce=false;
    offset=0;
    $('#downloadsdata').html('');
    loadDownloads();
};




var startFeedbackForm=function(){
    bootbox.confirm({
        message: "Are you sure you want to start feedback form for "+activeMinutes+" minutes?",
        buttons: {
            confirm: {
                label: 'Yes',
                className: 'btn-primary'
            },
            cancel: {
                label: 'No',
                className: 'btn-default'
            }
        },
        callback: function (result) {
            if(result){
                $.ajax({
                    url : url + 'feedback.php',
                    type : 'get',
                    dataType : 'json',
                    data :{
                        'token' : 'dev20',
                        'addfeedbackform' : '1',
                        'activeminutes' : activeMinutes,
                        'course' : $('#jcourse').find(':selected').data('course')
                    },
                    success : function(r){
                        getActiveFeedbackForm();
                    }
                });
            }
        }
    });
};

var addDownload = function(){
    var note= $('#newdescription').val();
    var link= $('#newlink').val();
    var course=$('#jcourse').find(':selected').data('course');

    if(note==""){
        $('#e1').show();
        $('#e2').hide();
    }
    else if(link==""){
        $('#e2').show();
        $('#e1').hide();
    }
    else{
        $('#e1').hide();
        $('#e2').hide();
        $.ajax({
            url : url + 'downloads.php',
            type : 'get',
            dataType : 'json',
            data : {
                'token' : 'dev20',
                'adddownload' : '1',
                'note' : note,
                'link' : link,
                'course' : course
            },
            success : function(){
                $('#newdownload').modal('hide');
                $('#newdescription').val('');
                $('#newlink').val('');
                loadDownloadFresh();
            }
        });
    }

};




$(document).ready(function(){
    loader();
    $('#jback').click(function(){
        window.location='home.html';
    });

    $('#jstartnew').click(function(){
        startFeedbackForm();
    });

    $('#jdownload').click(function(){
        downloadLastFeedbackResults();
    });

    $('#activeminutes li').click(function(){
        activeMinutes= parseInt($(this).text());
        $('#activeminutes li').removeClass('active');
        $(this).addClass('active');
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