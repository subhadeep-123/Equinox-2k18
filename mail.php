<?php
  if(!isset($_POST['submit']))
{
	//This page should not be accessed directly. Need to submit the form.
	echo "error; you need to submit the form!";
}
  $name = $_POST['name'];
  $no = $_POST['no'];
  $college = $_POST['college'];
  $email = $_POST['email'];
  $city = $_POST['city'];
  $email_subject = $city." ".$college." ".$name.
 
if(empty($name)||empty($email)||empty($no)||empty($college)) 
{
    echo "Please fill all fields";
    exit;
}

if(IsInjected($email))
{
    echo "Bad email value!";
    exit;
}

$email_from = 'f2015357@goa.bits-pilani.ac.in';//<== update the email address
$email_subject = "New Form submission";
$email_body = "You have received a new message from the user $name.\n".
    "Here is the message:".
    
$to = "sebastinssanty@gmail.com";//<== update the email address
$headers = "From: $email_from \r\n";
$headers .= "Reply-To: $email \r\n";
//Send the email!
mail($to,$email_subject,$email_body,$headers);
//done. redirect to thank-you page.



// Function to validate against any email injection attempts
function IsInjected($str)
{
  $injections = array('(\n+)',
              '(\r+)',
              '(\t+)',
              '(%0A+)',
              '(%0D+)',
              '(%08+)',
              '(%09+)'
              );
  $inject = join('|', $injections);
  $inject = "/$inject/i";
  if(preg_match($inject,$str))
    {
    return true;
  }
  else
    {
    return false;
  }
}
   
?> 