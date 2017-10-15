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
(function($){
var lecturerId=localStorage.getItem ("userId");
var recentnoti=localStorage.getItem ("latestNotification");
//var recentnoti=null;
var messageCount=0;
var notificationLatest=recentnoti==null?getNow():recentnoti;
var url = 'http://localhost/smartunimobile/';
var notiID=1;

var loader=function(){

};
function  getNow() {
    now = new Date();
    year = "" + now.getFullYear();
    month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
    day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
    return year + "-" + month + "-" + day ;
}


$(document).ready(function(){
    //autoThread();
    window.setInterval(function(){
        autoThread();
    },10000);
    //loader();
});


var autoThread = function(){

    $.ajax({
        url : url + 'automatic.php',
        type : 'get',
        dataType : 'json',
        data : {
            'token' : 'dev20',
            'lecturer' : lecturerId,
            'notif' : notificationLatest
        },
        success : function(r){
            var unread=parseInt(r.messagecount);
            var unreadnotif=parseInt(r.notificationcount);

            if(messageCount<unread){
                messageCount=unread;
                $('#msgcount').html('<span class="badge badge-default badge-pill">'+messageCount+'</span>');
                cordova.plugins.notification.local.schedule({
                    text : 'You have new messages',
                    title : 'SmartUni Lecturer',
                    at: new Date(),
                    led: 'FF0000',
                    sound: null,
                    data : 'messages'

                });
            }

            if(unreadnotif>0){
                /* take first as latest */
                notificationLatest=r.notifications[0].id;
                localStorage.setItem ("latestNotification",notificationLatest);

                for(i=0;i<r.notifications.length;i++){
                    cordova.plugins.notification.local.schedule({
                        text : r.notifications[i].content,
                        title : 'SmartUni Lecturer',
                        at: new Date(),
                        led: 'FF0000',
                        sound: null,
                        data : 'notification'

                    });
                }
            }


        }
    });


};


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
        cordova.plugins.backgroundMode.enable();
        cordova.plugins.backgroundMode.overrideBackButton();
        cordova.plugins.notification.local.on("click", function (notification, state) {
            console.log(notification);
            if(notification.data=='messages'){
                window.location='messages.html';
            }
            else if(notification.data=='notification'){
                navigator.notification.alert(
                    notification.text,
                    function(){},
                    notification.title,
                    'Okay'
                );
            }
        }, this)
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {

    }
};

//document.addEventListener("pause", onPause, false);
document.addEventListener("resume", onResume, false);

//window.setInterval(function(){
    //if(cordova.plugins.backgroundMode.isActive()) {
        //window.setTimeout(function(){
        // },4000);
    //}
//},5000);


window.onunload=function(){
    cordova.plugins.backgroundMode.moveToBackground();
};

function onResume() {

}

app.initialize();

})($);