
<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config/database.php';

try {
    $sql = "
        SELECT
            c.id_caso AS id,
            c.folio,
            c.id_paciente AS pacienteId,
            c.nombre AS nombreCaso,
            c.motivo_consulta AS motivo,
            c.area,
            c.diagnostico,
            c.antecedentes,
            c.datos_adicionales AS datosAdicionales,
            c.fecha_registro AS fechaCreacion,
            c.estado
        FROM casos_clinicos c
        ORDER BY c.id_caso DESC
    ";

    $consulta = $conexion->query($sql);
    $casos = $consulta->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'casosClinicos' => $casos
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'mensaje' => 'Error al consultar los casos clínicos.'
    ], JSON_UNESCAPED_UNICODE);
}
