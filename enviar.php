<?php
// Cargar librerías de PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

// ==========================================
// TUS DATOS DE CONFIGURACIÓN
// ==========================================

// 1. Tu email de GMAIL (El cartero/Remitente)
$mi_gmail = "mikelurtxegi@gmail.com"; 

// 2. Tu CONTRASEÑA DE APLICACIÓN de 16 letras
// (La que generaste en Google: abcd efgh ijkl mnop)
$mi_password_app = "secreta"; 

// 3. ¿Dónde quieres recibir los avisos? 
// (Puede ser el mismo gmail u otro, ej: info@tuempresa.com)
$destinatario_final = "mikelurtxegi@gmail.com"; 

// ==========================================

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Limpieza de datos
    $nombre = strip_tags(trim($_POST["nombre"]));
    $email_cliente = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $asunto = strip_tags(trim($_POST["asunto"]));
    $mensaje = strip_tags(trim($_POST["mensaje"]));

    // Validación básica
    if (empty($nombre) || empty($mensaje) || !filter_var($email_cliente, FILTER_VALIDATE_EMAIL)) {
        echo "error";
        exit;
    }

    $mail = new PHPMailer(true);

    try {
        // Configuración del Servidor SMTP de Gmail
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = $mi_gmail;
        $mail->Password   = $mi_password_app;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;

        // Configuración del Envío
        $mail->setFrom($mi_gmail, 'Web Carpintería'); // Quién envía (El sistema)
        $mail->addAddress($destinatario_final);       // Quién recibe el aviso (Tú)
        $mail->addReplyTo($email_cliente, $nombre);   // A quién responder (Al cliente)

        // Contenido del Email
        $mail->isHTML(false);
        $mail->Subject = "Nuevo contacto Web: $asunto";
        $mail->Body    = "Nombre: $nombre\nEmail: $email_cliente\n\nMensaje:\n$mensaje";
        $mail->CharSet = 'UTF-8';

        $mail->send();
        echo 'exito';

    } catch (Exception $e) {
        // Si hay error, puedes descomentar la línea de abajo para ver detalles
        // echo "Error: {$mail->ErrorInfo}";
        echo 'error';
    }
} else {
    echo "error";
}

?>
