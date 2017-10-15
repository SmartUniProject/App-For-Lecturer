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
var studentId=location.hash.replace('#','');
var offset=0;
var runonce=false;
var latestMessage=new Date("1999-01-01 00:00:00");
var latestMessageTimeText="1999-01-01 00:00:00";


var url = 'http://localhost/smartunimobile/';
var loader=function(){
    $('#chatname').html(studentId);
    loadMessages();
};


var scrollChat= function(){
    $("html, body").animate({ scrollTop: $(document).height() }, 1000);
};

var scrollChatPrepend= function(){
    $("html, body").animate({ scrollTop: $(document).height()/50 }, 0);
};



var loadDownloadFresh = function(){
    offset=0;
    $('#downloadsdata').html('');
    loadDownloads();
};

window.onscroll = function(ev) {
    if (window.scrollY==0) {
        loadMessages();
    }
};

$(window).resize(function(){
    scrollChat();
});



var addMessage = function(message){
    console.log(message);
    if(message==''){

    }
    else{
        $.ajax({
            url : url + 'messages.php',
            type : 'get',
            dataType : 'json',
            data : {
                'token' : 'dev20',
                'addmessage' : '1',
                'lecturer' : lecturerId,
                'student' : studentId,
                'message' : message
            },
            success : function(){

            }
        });
    }

};


var loadMessages = function(){
    $('#preloader').show();
    $.ajax({
        url : url + 'messages.php',
        type : 'get',
        dataType : 'json',
        data : {
            'token' : 'dev20',
            'getmessagethread' : '1',
            'lecturer' : lecturerId,
            'student' : studentId,
            'offset'  :  offset

        },
        success : function(r){
            if(r.error=='notfound'){
                if(!runonce) {
                    if (offset > 0) {
                        $('#downloadsdata').append('<hr/><div class="alert alert-info">No more resources.</div>');
                    }
                    else {
                        $('#downloadsdata').html('<hr/><div class="alert alert-danger">No data found to display!</div>');
                    }
                    runonce=true;
                }
            }
            else {
                str='';
                r.reverse();
                r.forEach(function (el) {
                    if(el.from_user!=lecturerId) {
                        str += '<div class="row fromthread thread">' +
                                    '<div class="col-xs-10">' +
                                        '<div class="inner">' +
                                            el.content +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="col-xs-2"></div>' +
                            '</div>';
                    }
                    else{
                        str += '<div class="row tothread thread">' +
                                '<div class="col-xs-2"></div>' +
                                '<div class="col-xs-10">' +
                                    '<div class="inner">' +
                                        el.content +
                                    '</div>' +
                                '</div>' +
                            '</div>';
                    }


                    if(new Date(el.id)>latestMessage){
                        latestMessage=new Date(el.id);
                        latestMessageTimeText=el.id;
                    }
                });
                if(offset==0) {
                    $('#threaddata').append(str);
                    scrollChat();
                }
                else{
                    $('#threaddata').prepend(str);
                    scrollChatPrepend();
                }

                offset+=r.length;



                /* add timer to get incoming messages */
                window.setInterval(function(){
                    loadMessagesIncoming();
                },5000)






            }
            $('#preloader').hide();
        }
    });
};



var loadMessagesIncoming = function(){

    $.ajax({
        url : url + 'messages.php',
        type : 'get',
        dataType : 'json',
        data : {
            'token' : 'dev20',
            'getmessagethreadincoming' : '1',
            'lecturer' : lecturerId,
            'student' : studentId,
            'timestamp' : latestMessageTimeText

        },
        success : function(r){
            if(r.error=='notfound'){

            }
            else {
                str='';
                r.reverse();
                r.forEach(function (el) {
                    str += '<div class="row fromthread thread">' +
                        '<div class="col-xs-10">' +
                        '<div class="inner">' +
                        el.content +
                        '</div>' +
                        '</div>' +
                        '<div class="col-xs-2"></div>' +
                        '</div>';

                    if(new Date(el.id)>latestMessage && el.from_user!=lecturerId){
                        latestMessage=new Date(el.id);
                        latestMessageTimeText=el.id;
                    }
                });

                $('#threaddata').append(str);

                scrollChat();




            }
            $('#preloader').hide();
        }
    });
};

$(document).ready(function(){
    loader();
    $('#jback').click(function(){
        window.location='messages.html';
    });

    $('#newbutton').click(function(){
        $('#newdownload').modal('show');
    });

    $('#adddownloadbutton').click(function(){
        addDownload();
    });

    $('#jfilter').click(function(){
        loadDownloadFresh();
    });

    $('#jmsg').keyup(function(e){
        if(e.which == 13) {
            var message=$('#jmsg').val();
            $(this).val('');
            str='<div class="row tothread thread">'+
                    '<div class="col-xs-2"></div>'+
                    '<div class="col-xs-10">'+
                        '<div class="inner">'+
                            message +
                        '</div>'+
                    '</div>'+
                '</div>';

            $('#threaddata').append(str);
            addMessage(message);
            scrollChat();
        }
    });



    /*$.ajax({
        url : url +'downloads.php',
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
                loadDownloads();
            });
        }
    });*/


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