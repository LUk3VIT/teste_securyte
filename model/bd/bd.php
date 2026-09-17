<?php

use PDO;
use PDOException;


$host = "localhost";
$database = "teste_securyt";
$user = "root";
$senha = "";
$charset = "utf8mb4";

$dsn = "mysql:host=$host; dbname=$database; charset=$charset";



try{
    $pdo = new PDO($dsn, $user, $senha, $options);
} catch (PDOException $e) {
    error_log($e->getMessage());
    exit('Falha ao conecter com o banco de dados');
}

class Database {
    private ?PDO $instance = null;

    public function __construct() {
        global $pdo;
        $this->instance = $pdo;
    }

    public static function getInstace(): PDO {
        $host = "localhost";
        $database = "teste_securyt";
        $user = "root";
        $senha = "";
        $charset = "utf8mb4";

        $dsn = "mysql:host=$host; dbname=$database; charset=$charset";

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
    }



}

?>