<?php

if (isset($_FILES['fileToUpload'])) {
    move_uploaded_file($_FILES['fileToUpload']['tmp_name'], "uploads/" . $_FILES['fileToUpload']['name']);
    echo "uploads/" . $_FILES['fileToUpload']['name'];
    return;
}
