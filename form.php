<?
$hostname="localhost";
$username="quark2016";
$password="abhinavsetia";
$dbname="event_regsitration";
$connection = mysql_connect($hostname, $username, $password);
mysql_select_db('event_registration', $connection);
date_default_timezone_set('Asia/Calcutta');
$date = date('m/d/Y h:i:s a', time());
file_put_contents('abcd.txt', "Log Starting at: " , FILE_APPEND);
file_put_contents('abcd.txt', $date.PHP_EOL , FILE_APPEND);
if($connection){
file_put_contents('abcd.txt', "DB Connection Successful".PHP_EOL , FILE_APPEND);
}
else{
file_put_contents('abcd.txt', "DB Connection Failed".PHP_EOL , FILE_APPEND);
}

// If the values are posted, insert them into the database.
$name = $_POST['name'];
$email = $_POST['email'];
$mobile = $_POST['mobile'];
$college = $_POST['college'];
$city = $_POST['city'];
$event = $_POST['event'];
$query = "INSERT INTO `registrations` (name, mobile, email, college, city, event) VALUES ('$name', '$mobile', '$email', '$college', '$city', '$event')";
file_put_contents('abcd.txt', $name.", ", FILE_APPEND);
file_put_contents('abcd.txt', $email.", " , FILE_APPEND);
file_put_contents('abcd.txt', $mobile.", " , FILE_APPEND);
file_put_contents('abcd.txt', $college.", " , FILE_APPEND);
file_put_contents('abcd.txt', $city.", " , FILE_APPEND);
file_put_contents('abcd.txt', $event.PHP_EOL , FILE_APPEND);
file_put_contents('abcd.txt', $query.PHP_EOL , FILE_APPEND);

$result = mysql_query($query);
file_put_contents('abcd.txt', "Query result: " , FILE_APPEND);
file_put_contents('abcd.txt', $result.PHP_EOL , FILE_APPEND);
file_put_contents('abcd.txt', "----------------------------------------------------------------------------------------------------".PHP_EOL , FILE_APPEND);
?>