
<?php

require_once __DIR__ . '/config/database.php';

try {
    $consulta = $conexion->query("SHOW TABLES");
    $tablas = $consulta->fetchAll(PDO::FETCH_COLUMN);

} catch (PDOException $e) {
    die('Error al consultar la base de datos.');
}

?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiropracticly - Prueba de conexión</title>
</head>
<body>
    <h1>Quiropracticly</h1>
    <p>Conexión con MySQL exitosa.</p>

    <h2>Tablas encontradas:</h2>

    <ul>
        <?php foreach ($tablas as $tabla): ?>
            <li><?= htmlspecialchars($tabla) ?></li>
        <?php endforeach; ?>
    </ul>
</body>
</html>
