<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config/database.php';

try {
    $sql = "
        SELECT
            c.id_cita AS id,
            c.id_paciente AS pacienteId,
            DATE_FORMAT(c.fecha_hora, '%Y-%m-%d') AS fecha,
            TIME_FORMAT(c.fecha_hora, '%H:%i') AS hora,
            c.motivo AS tipo,
            c.estado
        FROM citas c
        ORDER BY c.fecha_hora ASC
    ";

    $consulta = $conexion->query($sql);
    $citas = $consulta->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'citas' => $citas
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'mensaje' => 'Error al consultar las citas.'
    ], JSON_UNESCAPED_UNICODE);
}