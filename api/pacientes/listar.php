
<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config/database.php';

try {
    $sql = "
        SELECT
            p.id_paciente AS id,
            p.folio,
            CONCAT_WS(' ', p.nombre, p.apellidos) AS nombre,
            TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad,
            p.fecha_nacimiento AS fechaNacimiento,
            p.telefono,
            p.estado,
            p.notas,
            p.correo,
            p.direccion,
            p.fotografia,
            (
                SELECT cc.diagnostico
                FROM casos_clinicos cc
                WHERE cc.id_paciente = p.id_paciente
                ORDER BY cc.fecha_creacion DESC
                LIMIT 1
            ) AS diagnostico
        FROM pacientes p
        ORDER BY p.id_paciente DESC
    ";

    $consulta = $conexion->query($sql);
    $pacientes = $consulta->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'pacientes' => $pacientes
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'mensaje' => 'Error al consultar los pacientes.'
    ], JSON_UNESCAPED_UNICODE);
}
