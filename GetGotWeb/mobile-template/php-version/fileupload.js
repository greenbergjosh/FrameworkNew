

$(document).ready(function() {
    $('select#mediauploadoption').on('change', function() {
        clear();
        if ("pic" === this.value) {
            $('div#picuploaddiv').show();
            $('div#youtubeurluploaddiv').hide();
        } else {
            $('div#picuploaddiv').hide();
            $('div#youtubeurluploaddiv').show();
        }
    });

    $('img#productimage').click(function() {
        $('#imageVidModal').modal('show');
    });
});

function savePictureOrVideo() {
    var which = $('select#mediauploadoption').val();
    if ("pic" === which) {
        uploadFile();
    } else {
        saveYoutubeUrl();
    }
}

function saveYoutubeUrl() {
    var youtubeInput = $("input#youtubeurl");
    var youtubeUrl = youtubeInput.val();
    var regex = /^(https?:\/\/)?((www\.)?(youtube(-nocookie)?|youtube.googleapis)\.com.*(v\/|v=|vi=|vi\/|e\/|embed\/|user\/.*\/u\/\d+\/)|youtu\.be\/)([_0-9a-z-]+)/i;
    var videoId = youtubeUrl.match(regex)[7];

    // Update base form
    $('input#youtubeid').val(videoId);
    $('img#productimage').attr("src", "https://img.youtube.com/vi/" + videoId + "/0.jpg");

    clearAndClose();
}

function clear() {
    $('input#fileToUpload').val(null);
    $("input#youtubeurl").val("");
    $('div#progress').text("");
}

function clearAndClose() {
    clear();
    $('div#picuploaddiv').show();
    $('div#youtubeurluploaddiv').hide();
    $("select#mediauploadoption").val("pic");
    $('#imageVidModal').modal('hide');
}

function fileSelected() {
    var count = document.getElementById('fileToUpload').files.length;
    //document.getElementById('details').innerHTML = "";

    for (var index = 0; index < count; index ++) {

        var file = document.getElementById('fileToUpload').files[index];
        var fileSize = 0;
        if (file.size > 1024 * 1024) {
            fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
        } else {
            fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
        }

        //document.getElementById('details').innerHTML += 'Name: ' + file.name + '<br>Size: ' + fileSize + '<br>Type: ' + file.type;
        //document.getElementById('details').innerHTML += '<p>';
    }
}

function uploadFile() {
    var fd = new FormData();
    var count = document.getElementById('fileToUpload').files.length;

    if (count === 0) {
        return;
    }

    for (var index = 0; index < count; index ++) {
        var file = document.getElementById('fileToUpload').files[index];
        fd.append('fileToUpload', file);
    }

    var xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", uploadProgress, false);
    xhr.addEventListener("load", uploadComplete, false);
    xhr.addEventListener("error", uploadFailed, false);
    xhr.addEventListener("abort", uploadCanceled, false);
    xhr.open("POST", "fileupload.php");
    xhr.send(fd);
}

function uploadProgress(evt) {
    if (evt.lengthComputable) {
        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
        $('div#progress').text("Please wait&hellip; " + percentComplete.toString() + '%');
    } else {
        $('div#progress').text('Please wait&hellip;');
    }
}

function uploadComplete(evt) {
    /* This event is raised when the server send back a response */
    //alert(evt.target.responseText);
    console.log(evt.target.responseText);
    $('img#productimage').attr("src", evt.target.responseText);
    $('input#imagefilename').val(evt.target.responseText);
    clearAndClose();
}

function uploadFailed(evt) {
    alert("There was an error attempting to upload the file.");
    clearAndClose();
}

function uploadCanceled(evt) {
    alert("The upload has been canceled by the user or the browser dropped the connection.");
    clearAndClose();
}
