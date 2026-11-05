<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config/database.php';

try {
    $datos = json_decode(file_get_contents('php://input'), true);

    $estadosPermitidos = [
        'Pendiente',
        'Confirmada',
        'Completada',
        'Cancelada'
    ];

    if (
        empty($datos['id']) ||
        !in_array($datos['estado'] ?? '', $estadosPermitidos, true)
    ) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'mensaje' => 'Datos de cita no válidos.'
        ]);
        exit;
    }

    $consulta = $conexion->prepare(
        "UPDATE citas SET estado = :estado WHERE id_cita = :id"
    );

    $consulta->execute([
        ':estado' => $datos['estado'],
        ':id' => $datos['id']
    ]);

    if ($consulta->rowCount() === 0) {
        $verificar = $conexion->prepare(
            "SELECT id_cita FROM citas WHERE id_cita = :id"
        );
        $verificar->execute([':id' => $datos['id']]);

        if (!$verificar->fetch()) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'mensaje' => 'No se encontró la cita.'
            ]);
            exit;
        }
    }

    echo json_encode([
        'success' => true,
        'mensaje' => 'Estado de la cita actualizado.'
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'mensaje' => 'No se pudo actualizar la cita.'
    ], JSON_UNESCAPED_UNICODE);
}