<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config/database.php';

try {
    $sql = "
        SELECT
            t.id_tratamiento AS id,
            t.id_paciente AS pacienteId,
            t.nombre,
            t.fecha_inicio AS fechaInicio,
            CASE
                WHEN t.sesiones_totales IS NULL
                THEN CAST(t.sesiones_completadas AS CHAR)
                ELSE CONCAT(t.sesiones_completadas, ' / ', t.sesiones_totales)
            END AS sesiones,
            t.estado
        FROM tratamientos t
        ORDER BY t.id_tratamiento DESC
    ";

    $consulta = $conexion->query($sql);
    $tratamientos = $consulta->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'tratamientos' => $tratamientos
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'mensaje' => 'Error al consultar los tratamientos.'
    ], JSON_UNESCAPED_UNICODE);
}