<?php


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    // 405 Method Not Allowed
    http_response_code(405);
    $retVal = array("error" => "Method not allowed", "errorcode" => 405);
    echo json_encode($retVal);
    return;
}


$data = json_decode(file_get_contents( 'php://input' ), true);

$name = $data['name'];
$email = $data['email'];
$phone = preg_replace('/[^0-9.]+/', '', $data['phone']);


if (!validInput($name) || !(validInput($email) || validInput($phone))) {
    $retVal = array("error" => "Missing data", "errorcode" => 400);
    echo json_encode($retVal);
    return;
}

$isEmail = validInput($email);


$servername = "localhost";
$username = "totogolcr_getgotuser";
$password = "1bho.We35Kjs,cIA!T";
$dbname = "totogolcr_getgot";
$table = "users";
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    $retVal = array("error" => "DB error", "errorcode" => 500);
    echo json_encode($retVal);
    return;
}

$conn->select_db($dbname);



$sql = "";

// sql to create table
if ($isEmail) {
    $sql = "select * from $table where email = '$email'";
} else {
    $sql = "select * from $table where phone = '$phone'";
}


$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $retVal = array("error" => "Already registered", "errorcode" => 400);
    echo json_encode($retVal);
    return;
}

// Create new
$token = randomString(30);
$code = randomString(5, false, "123456789");
$sql = "insert into $table (name, email, phone, token, code) values ('$name', '$email', '$phone', '$token', '$code')";



if ($conn->query($sql) !== TRUE) {
    $retVal = array("error" => "DB error", "errorcode" => 500);
    echo json_encode($retVal);
    return;
}

$retVal = array("token" => $token);


// Send code via SMS or email
if ($isEmail) {
    sendEmail($email, $code);
} else {
    $smsProviderUrl = "http://api.trumpia.com/rest/v1/DirectMarket/sms";
    $smsVals = array("mobile_number" => $phone, "message" => "Hey, thanks for registering for Getgot! Your code is " . $code,
        "org_name_id" => "136052", "country_code" => "1");
    $jsonSmsData = json_encode($smsVals);

    //Initiate cURL
    $ch = curl_init($smsProviderUrl);

    //Is a PUT request
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");

    //We want the result / output returned.
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'Content-Length: ' . strlen($jsonSmsData),
        'X-Apikey: 2501ef1e7f9bd81c9bb9bc4425ef19b9'
    ));


    //Our fields.
    curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonSmsData);

    //Execute the request.
    $response = curl_exec($ch);

    echo $response;

    echo "aa";
    die();

}

echo json_encode($retVal);



/**
 *
 */
function sendEmail($email, $code) {
    $msg = "Hey, thanks for registering for Getgot! Your code is " . $code;
    mail($email, "Thanks for registering! Here is your code", $msg);
}


/**
 * Returns a random string.
 */
function randomString($length, $allCaps = false, $keyspace = '0123456789abcdefghijklmnopqrstuvwxyz') {
    if ($allCaps) {
        $keyspace = strtoupper($keyspace);
    }
    $str = '';
    $max = mb_strlen($keyspace, '8bit') - 1;
    for ($i = 0; $i < $length; ++$i) {
        $str .= $keyspace[rand(0, $max)];
    }
    return $str;
}



function testsms() {

    $phone = "2132601640";
    $code = "1234";


    $smsProviderUrl = "http://api.trumpia.com/rest/v1/DirectMarket/sms";
    $smsVals = array("mobile_number" => $phone, "message" => "Hey, thanks for registering for Getgot! Your code is " . $code,
        "org_name_id" => "136052", "country_code" => "1");
    $jsonSmsData = json_encode($smsVals);

    //Initiate cURL
    $ch = curl_init($smsProviderUrl);

    //Is a PUT request
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");

    //We want the result / output returned.
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type:application/json',
        'Content-Length:' . strlen($jsonSmsData),
        'X-Apikey:2501ef1e7f9bd81c9bb9bc4425ef19b9'
    ));


    //Our fields.
    curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonSmsData);

    //Execute the request.
    $response = curl_exec($ch);

    echo $response;
}


function validInput($i) {
    return isset($i) && strlen($i) > 0;
}
