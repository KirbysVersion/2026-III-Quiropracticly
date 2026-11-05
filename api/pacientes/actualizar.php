<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config/database.php';

try {
    $datos = json_decode(file_get_contents('php://input'), true);

    if (
        empty($datos['id']) ||
        empty(trim($datos['nombre'] ?? ''))
    ) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'mensaje' => 'Faltan datos obligatorios.'
        ]);
        exit;
    }

    $partes = preg_split('/\s+/', trim($datos['nombre']), 2);

    if (count($partes) < 2) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'mensaje' => 'Ingresa nombre y apellidos.'
        ]);
        exit;
    }

    $sql = "UPDATE pacientes SET
        nombre = :nombre,
        apellidos = :apellidos,
        fecha_nacimiento = :fecha_nacimiento,
        telefono = :telefono,
        notas = :notas,
        estado = :estado
        WHERE id_paciente = :id";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        ':nombre' => $partes[0],
        ':apellidos' => $partes[1],
        ':fecha_nacimiento' => $datos['fechaNacimiento'] ?: null,
        ':telefono' => $datos['telefono'] ?? null,
        ':notas' => $datos['notas'] ?? null,
        ':estado' => $datos['estado'] ?? 'Activo',
        ':id' => $datos['id']
    ]);

    echo json_encode([
        'success' => true,
        'mensaje' => 'Paciente actualizado correctamente.'
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'mensaje' => 'No se pudo actualizar el paciente.'
    ], JSON_UNESCAPED_UNICODE);
}