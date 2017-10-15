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
   // window.location='chatthread.html#UWU/CST/140043';
    loadMessageThreads(false);
    window.setInterval(function(){
        loadMessageThreads(true);
    },5000);

};




var loadMessageThreads = function(forceHideLoader){
    if(!forceHideLoader)
        $('#threadsdata').html('<div id="preloader"></div>');
    $.ajax({
        url : url + 'messages.php',
        type : 'get',
        dataType : 'json',
        data : {
            'token' : 'dev20',
            'getmessagethreads' : '1',
            'lecturer' : lecturerId

        },
        success : function(r){
            if(r.total.length==0){
                $('#threadsdata').html('<div class="alert alert-danger">No chat threads!</div>');
            }
            else {
                threads = '<ul class="list-group">';

                r.total.forEach(function (el) {
                    unreadCount=r.unread[el.id];
                    badge='';
                    if(unreadCount>0){
                        badge='<span class="badge">'+unreadCount+'</span>'
                    }
                    threads += '<button class="list-group-item" onclick="window.location=\'chatthread.html#'+el.id+'\'">' +
                        '<h4><b>'+el.id+'</b></h4>' +
                        '' + el.studentname + badge +'</button>';
                });
                threads += '</ul>';
                $('#threadsdata').html(threads);



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



    /*$.ajax({
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
*/
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