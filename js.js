window.fbAsyncInit = function() {
    FB.init({
        appId      : '376653362490669',
        xfbml      : true,
        version    : 'v2.2'
    });
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// This is called with the results from from FB.getLoginStatus()
function statusChangeCallback(response) {
    //console.log(response);
    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        //testAPI();
        //loadPage('STARMoviesAsia');
        var page_name=document.getElementById("page_name").value;
        console.log(page_name);
        document.getElementById("status").innerHTML="Loading...";
        loadPage(page_name);
    } else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
        document.getElementById('status').innerHTML = 'Please log ' + 'into this app.';
    } else {
        document.getElementById('status').innerHTML = 'Please log ' +
            'into Facebook.';
    }
}


// This is called with the results from from FB.getLoginStatus()
function statusChangeCallback2(response) {
    //console.log(response);
    if (response.status === 'connected') {
        var post_id=document.getElementById("post_id").value;
        var regex=/https?:\/\/(www.)?facebook\.com\/([a-zA-Z0-9_\- ]*)\/([a-zA-Z0-9_\- ]*)\/([a-zA-Z0-9_\.\-]*)\/([a-zA-Z0-9_\-]*)(\/\?type=1&theater\/)?/i;
        post_id=post_id.match(regex)[5];
        console.log(post_id);
        loadComment('/'+post_id,[]);
    } else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
        document.getElementById('status').innerHTML = 'Please log ' + 'into this app.';
    } else {
        document.getElementById('status').innerHTML = 'Please log ' +
            'into Facebook.';
    }
}

function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

function checkLoginState2() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback2(response);
    });
}

FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
});

function testAPI() {
    //console.log('Welcome!  Fetching your information.... ');
    FB.api('/sinhvienthangbinh', function(response) {
        console.log(response);
        document.getElementById('status').innerHTML =
            'Thanks for logging in, ' + response + '!';
    });
}

function loadPage(page_name) {
    console.log("loading page "+page_name);
    var page_id;
    var page_name;
    FB.api('/'+page_name, function(response) {
        //console.log(response);
        page_id=response.id;
        //console.log(page_id);

        FB.api("/"+page_id+"/posts", function(response) {
            //console.log(response);
            var html="";
            response.data.forEach(function(post){
                if(typeof(post.message) !='undefined') {
                    html+="<p><span>"+post.message+"</span> "+
                        "<a href='#' id='"+post.id+"' onClick='loadStat()'>Statistic</a>"+
                        "</p>";
                    var comments = post.comments;
                }
            });
            document.getElementById('posts').innerHTML=html;
            document.getElementById("status").innerHTML="";
        });
    });

}

function writeToCSV_onlyComment(comment_array) {
    var csvContent = "data:text/csv;charset=utf-8,";
    //var csvContent = "data:text/csv;";
    comment_array.forEach(function(comment, index) {
        var number=comment.message.split('\ ');
        number=number[number.length-1];
        dataString = ["\""+comment.from.name+"\"", "\"https://www.facebook.com/app_scoped_user_id/"+comment.from.id+"\"", "", "", "", "", 
                        "\""+comment.message+"\"", "\""+number+"\"", comment.created_time].join(",");
        csvContent += index < comment_array.length ? dataString+"\n" : dataString;
    });
    //console.log(csvContent);

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_data.csv");

    link.click(); // This will download the data file named "my_data.csv"."
    document.getElementById("status").innerHTML="";
}

function writeToCSV(comment_array, commenters) {
    console.log("write");
    if(comment_array.length > commenters.length) {
        setTimeout(function() {writeToCSV(comment_array, commenters); }, 2*1000);
        console.log(commenters);
    } else {
        console.log("start write");
        //console.log(commenters);

        var csvContent = "data:text/csv;charset=utf-8,";
        //var csvContent = "data:text/csv;";
        comment_array.forEach(function(comment, index) {
            var number=comment.message.split('\ ');
            number=number[number.length-1];
            dataString = ["\""+comment.from.name+"\"", "\""+commenters[comment.from.id]+"\"", "", "", "", "", 
                            "\""+comment.message.replace("\n","")+"\"", "\""+number+"\"", comment.created_time].join(",");
            csvContent += index < comment_array.length ? dataString+"\n" : dataString;
        });
        //console.log(csvContent);

        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "my_data.csv");

        link.click(); // This will download the data file named "my_data.csv"."
        document.getElementById("status").innerHTML="";
    }
}


function loadCommentFrom(comment_array) {
    console.log('from');
    console.log(comment_array); 

    var commenters={};
    for(var i=0;i<comment_array.length;i++) {
        //console.log(comment_array[i]);
        FB.api('/'+comment_array[i].from.id, function(response){
            if(typeof(response.link)=='undefined') {
                console.log(response);
            }
            commenters[response.id]=response.link;
        });
    } 
    setTimeout(function() { writeToCSV(comment_array, commenters); }, 2*1000);
};

function loadComment(api_url, comment_array) {
    FB.api(api_url, function(response) {
        comments=response.comments || response;

        comment_array=comment_array.concat(comments.data);
        console.log(comments);
        if (comments.data.length > 0) {
            // if has next page
            //console.log(comments);
            if( typeof(comments.paging.next) != 'undefined' 
                    && comments.paging.next.match(/http.*/)) {
                console.log('+1');
                loadComment(comments.paging.next, comment_array);
            } else {
                console.log('done loading comments!');
                //loadCommentFrom(comment_array);
                writeToCSV_onlyComment(comment_array);
            }
        }
    });
}

function loadStat(e) {
    e=e||window.event;
    var post = e.target || e.srcElement;
    var post_id = post.id;
    console.log(post_id);

    document.getElementById("status").innerHTML="Loading...";
    loadComment('/'+post_id,[]);
}

function loadStatFromPost() {
}
