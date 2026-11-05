<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config/database.php';

try {
    $datos = json_decode(file_get_contents('php://input'), true);

    if (empty($datos['id'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'mensaje' => 'ID de paciente no válido.'
        ]);
        exit;
    }

    $consulta = $conexion->prepare(
        "DELETE FROM pacientes WHERE id_paciente = :id"
    );

    $consulta->execute([
        ':id' => $datos['id']
    ]);

    if ($consulta->rowCount() === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'mensaje' => 'No se encontró el paciente.'
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'mensaje' => 'Paciente eliminado correctamente.'
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'mensaje' => 'No se pudo eliminar el paciente. Puede tener citas, casos o tratamientos relacionados.'
    ], JSON_UNESCAPED_UNICODE);
}