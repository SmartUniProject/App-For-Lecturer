<?php
/**
 * Created by PhpStorm.
 * User: Shalitha Suranga
 * Date: 4/19/2017
 * Time: 8:38 PM
 */


 define("DB_HOST","localhost");
 define("DB_USER","root");
 define("DB_PASSWORD","");
 define("DB_NAME","smartuni");


require(__DIR__."/classes/MySQLConnection.php");
$db=MySQLConnection::getConnection(DB_HOST,DB_USER,DB_PASSWORD,DB_NAME);