<?php
error_reporting(E_ALL);
 
if(isset($_POST['submit'])) {
 
    // EDIT THE 2 LINES BELOW AS REQUIRED
 
    $email_to = "shubhamrathi@icloud.com";
    $email2 = "shubhamgsoc@gmail.com";
 
    $email_subject = "constructivity-form submission";
 
     //$corporate = "ASDf\n\n";
 
     
 
    function died($error) {
 
        // your error code can go here
 
        echo "We are very sorry, but there were error(s) found with the form you submitted. ";
 
        echo "These errors appear below.<br /><br />";
 
        echo $error."<br /><br />";
 
        echo "Please go back and fix these errors.<br /><br />";
 
        die();
 
    }
 
     
 
    // validation expected data exists
 
    if(!isset($_POST['name']) || !isset($_POST['email'])   ) {
 
        died('We are sorry, but there appears to be a problem with the form you submitted.');       
 
    }
 
     
 
    $name = $_POST['name']; // required
    $email_from = $_POST['email']; // required
    
    // if(!empty($_POST['corporate']))
    // {
    // foreach($_POST['corporate'] as $check) 
    //     {
    //         // $corporate .= "a".clean_string($check)."\n";
    //     }
    // }
 
 
     
 
    $error_message = "";
 
    $email_exp = '/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/';
 

    $email_message = "Form details below.\n\n";
 
     
 
    function clean_string($string) {
 
      $bad = array("content-type","bcc:","to:","cc:","href");
 
      return str_replace($bad,"",$string);
 
    }
 

 
    $email_message .= "First Name: ".clean_string($name)."\n";
 
    $email_message .= "Email: ".clean_string($email_from)."\n";
 
    // $email_message .= "Message: ".clean_string($no)."\n";
        
    // $email_message .= "Corporate: ".clean_string($corporate)."\n";
 
    
 
// create email headers
 
// $headers = 'From: '.$email_from."\r\n".

 
@mail($email_to, $email_subject, $email_message, $headers);
//@mail($email2, $email_subject, $email_message, $headers);

echo "done";
 
?>
 
 