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

var url = 'http://localhost/smartunimobile/';

var formatTime = function(time){
    time=time.substring(0,5);
    return time+" "+(parseInt(time.charAt(0)+time.charAt(1))>12?"PM":"AM")
};

var getToday = function(){
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var d = new Date();
    var dayName = days[d.getDay()];
    return dayName;
};



var formatYS= function(n){
    n=parseInt(n);
    if(n==1) return (n+'<sup>st</sup>');
    if(n==2) return (n+'<sup>nd</sup>');
    if(n==3) return (n+'<sup>rd</sup>');
    if(n==4) return (n+'<sup>th</sup>');
};


var freeHours= function(st,en){
   return (parseInt(en)-parseInt(st));
};

var addExtraLecture = function(){
    var course= $('#jleccourse').find(':selected').data('course');
    var hall= $('#jlechall').val();
    var start= $('#jlecstarttime').val();
    var end= $('#jlecendtime').val();
    var day= $('#jday').val();

    console.log(new Date(start));
    if(new Date(start)>=new Date(end)){
        $('#e2').show();
        $('#e1').hide();
        $('#e3').hide();
    }
    else{
        $('#e1').hide();
        $('#e2').hide();
        $('#e3').hide();
        $.ajax({
            url : url + 'timetable.php',
            type : 'get',
            dataType : 'json',
            data : {
                'token' : 'dev20',
                'addextralecture' : '1',
                'lecturer' : lecturerId,
                'course' : course,
                'start' : start,
                'end' : end,
                'hall' : hall,
                'day' : day
            },
            success : function(r){
                if(typeof r.error != "undefined" ){
                    if(r.error=="notime"){
                        $('#e1').hide();
                        $('#e3').show();
                        $('#e2').hide();
                    }
                    else if(r.error=="hallbusy"){
                        $('#e1').show();
                        $('#e2').hide();
                        $('#e3').hide();
                    }
                }
                else{
                    $('#newextralecture').modal('hide');
                    $('#jcourse,#jlechall,#jlecstarttime,#jlecendtime').prop('selectedIndex',0);
                    loadTimeTable();
                }
            }
        });
    }

};


var removeExtraLecture=function(id){
    bootbox.confirm({
        message: "Are you sure you want remove?",
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
                    url : url + 'timetable.php',
                    type : 'get',
                    dataType : 'json',
                    data :{
                        'token' : 'dev20',
                        'removeextralecture' : id
                    },
                    success : function(r){
                        loadTimeTable();
                    }
                });
            }
        }
    });
};


var loadTimeTable= function(){
    $('#timetabledata').html('<div id="preloader"></div>');
    var str='';
    var day=$('#jday').val();
    $.ajax({
        url : url+'timetable.php',
        type : 'get',
        dataType : 'json',
        data :{
            'token' : 'dev20',
            'gettimetable' : '1',
            'lecturer' : lecturerId,
            'day' : day
        },
        success : function(r){

            for(i=0; i<r.length;i++){
                el=r[i];



                elabel=el.is_extra=="1"?'<span class="label label-info">EXTRA</span>':'';

                buttons='';
                if(el.is_extra=="1"){
                    buttons+='<div class="btn btn-default" onclick="removeExtraLecture('+el.id+')"><span class="glyphicon glyphicon-remove"></span> Remove</div>';
                }

                str+=('<div class="slot">'+
                        '<div class="panel panel-default">'+
                            '<div class="panel-body">'+
                                '<div class="code">'+el.course_id+' '+elabel+'</div>'+
                                '<div class="name">'+el.coursename+'</div>'+
                                '<ul>'+
                                    '<li><span class="glyphicon glyphicon-time"></span> '+formatTime(el.start_time)+'-'+formatTime(el.end_time)+'</li>'+
                                    '<li><span class="glyphicon glyphicon-user"></span> '+formatYS(el.cyear)+' year '+formatYS(el.csemester)+' sem.</li>'+
                                    '<li><span class="glyphicon glyphicon-map-marker"></span> '+el.hallname+'</li>'+
                                '</ul>'+
                                '<div>' +
                                    buttons +
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>');

                if(i+1<r.length){
                    freehours=freeHours(el.end_time,r[i+1].start_time);
                    if(freehours>0) {
                        str += ('<div class="slot-free">' +
                            '<div class="panel panel-default">' +
                                '<div class="panel-body"><span class="label label-primary">' + freehours +'</span> hours FREE' +
                                '</div>' +
                            '</div>' +
                        '</div>');
                    }
                }



            }


            if(r.error=="nodata"){
                str+='<div class="alert alert-danger"> No lectures on this day.</div>';
            }



            $('#timetabledata').html(str);
        }
    });
};


var loader=function(){
    loadTimeTable();



};


var getAvailableSlots = function(){
    var hall= $('#jlechall').val();
    var day= $('#jday').val();
    $.ajax({
        url : url+'timetable.php',
        type : 'get',
        dataType : 'json',
        data : {
            'gethallfreeslots' : 1,
            'token' : 'dev20',
            'hall' : hall,
            'day' : day
        },
        success : function(r){
            str='';
            if(r.freeslots.length==0){
                str='<div class="alert alert-danger">Hall is not available whole day!</div>';
            }
            else{
                str+='<ul class="list-group">';
                for(i=0; i<r.freeslots.length; i++){
                    str+='<li class="list-group-item">'+(r.freeslots[i][0])+' - '+(r.freeslots[i][1])+' <span class="label label-primary">Available</span></li>';
                }
                str+='</ul>';
            }
            $('#hallavail').html(str);
        }
    });
};

$(document).ready(function(){
    $('#jday').change(function(){
        loadTimeTable();
    });

    $('#jback').click(function(){
        window.location='home.html';
    });

    $('#jlechall').change(function(){
        getAvailableSlots();
    });

    $('#newbutton').click(function(){
        $('#newextralecture').modal('show');
    });

    $('#addextralecturebutton').click(function(){
        addExtraLecture();
    });

    $('#jday').change(function(){
        getAvailableSlots();
    });

    $.ajax({
        url : url +'timetable.php',
        type : 'get',
        dataType : 'json',
        data : {
            'token' : 'dev20',
            'getextralectureinfo' : '1',
            'lecturer' : lecturerId
        },
        success : function(r){
            var course=document.getElementById('jleccourse');
            var hall=document.getElementById('jlechall');
            r.courses.forEach(function(el){
                var elm=document.createElement('option');
                elm.setAttribute('data-year',el.cyear);
                elm.setAttribute('data-semester',el.csemester);
                elm.setAttribute('data-degree',el.deg_id);
                elm.setAttribute('data-course',el.id);
                elm.textContent=el.id+' '+el.name;

                course.appendChild(elm);

                getAvailableSlots();

            });
            r.halls.forEach(function(el){
                var elm=document.createElement('option');
                elm.value=el.id;
                elm.textContent=el.name;

                hall.appendChild(elm);

            });
        }
    });
    $('#jday').val(getToday());
    loader();
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