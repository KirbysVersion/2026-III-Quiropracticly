<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config/database.php';

try {
    $datos = json_decode(file_get_contents('php://input'), true);
    $id = filter_var($datos['id'] ?? null, FILTER_VALIDATE_INT);
    $estado = $datos['estado'] ?? '';

    if (!$id || !in_array($estado, ['Activo', 'Completado', 'Suspendido'], true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'mensaje' => 'Datos inválidos.']);
        exit;
    }

    $consulta = $conexion->prepare(
        'UPDATE tratamientos SET estado = :estado WHERE id_tratamiento = :id'
    );
    $consulta->execute([':estado' => $estado, ':id' => $id]);

    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'mensaje' => 'Error al actualizar.']);
}