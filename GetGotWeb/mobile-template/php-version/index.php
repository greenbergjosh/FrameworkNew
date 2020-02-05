<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GetGot</title>
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="getgot.css">
    <script src="fileupload.js"></script>
</head>
<body>

<div class="container">

    <form id="baseform" action="formsubmit.php" method="post">

        <!-- Product description -->
        <div class="row">
            <div class="col-xs-0 col-md-3"></div>
            <div id="productdescription" class="col-xs-12 col-md-6 maincol">
                Sephora<br/>
                Radiant Pink Lipgloss
            </div>
            <div class="col-xs-0 col-md-3"></div>
        </div>

        <!-- Influencer text -->
        <div class="row">
            <div class="col-xs-0 col-md-3"></div>
            <div class="col-xs-12 col-md-6 maincol">
                <textarea id="influencertext" name="influencertext" class="ggeditable" placeholder="Your text here!"></textarea>
            </div>
            <div class="col-xs-0 col-md-3"></div>
        </div>

        <!-- Retailer creative -->
        <div class="row">
            <div class="col-xs-0 col-md-3"></div>
            <div class="col-xs-12 col-md-6 maincol">
                <img id="productimage" src="https://picsum.photos/400/300?image=1027" alt="Placeholder" />
                <br/><br/>
                <span class="glyphicon glyphicon glyphicon-picture"></span> <a href="#" data-toggle="modal" data-target="#imageVidModal">Add your own image or video...</a>
            </div>
            <div class="col-xs-0 col-md-3"></div>
        </div>

        <!-- CTA -->
        <div class="row">
            <div class="col-xs-0 col-md-3"></div>
            <div class="col-xs-12 col-md-6 maincol">
                <button class="btn">Save</button>
            </div>
            <div class="col-xs-0 col-md-3"></div>
        </div>

        <input type="hidden" id="youtubeid" name="youtubeid" />
        <input type="hidden" id="imagefilename" name="imagefilename" />
    </form>
</div>


<div id="imageVidModal" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title">Add your own image or video!</h4>
            </div>
            <div class="modal-body">
                <p>I want to
                    <select id="mediauploadoption">
                        <option value="pic">Upload an existing image or take a picture&hellip;</option>
                        <option value="url">Link to an existing Youtube video&hellip;</option>
                    </select>
                </p>
                <div id="picuploaddiv" class="form-group">
                    <input type="file" name="fileToUpload" id="fileToUpload" onchange="fileSelected();" accept="image/*;capture=camera" class="form-control"/>
                    <div id="progress"></div>
                </div>
                <div id="youtubeurluploaddiv" class="form-group">
                    <input id="youtubeurl" type="text" placeholder="https://youtube.com/videourl" class="form-control"/>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" onclick="clearAndClose()">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="savePictureOrVideo()">Select</button>
            </div>
        </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<pre id="code-area">

</pre>
<script>
    var codeArea = document.getElementById("code-area")
    codeArea.innerText = "Android Interface:\n" + JSON.stringify(window.AndroidInterface, null, 2)
</script>
</body>
</html>
