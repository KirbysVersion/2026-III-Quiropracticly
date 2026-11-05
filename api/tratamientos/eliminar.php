<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config/database.php';

try {
    $datos = json_decode(file_get_contents('php://input'), true);
    $id = filter_var($datos['id'] ?? null, FILTER_VALIDATE_INT);

    if (!$id || $id < 1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'mensaje' => 'ID inválido.']);
        exit;
    }

    $consulta = $conexion->prepare(
        'DELETE FROM tratamientos WHERE id_tratamiento = :id'
    );
    $consulta->execute([':id' => $id]);

    if (!$consulta->rowCount()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'mensaje' => 'Tratamiento no encontrado.']);
        exit;
    }

    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'mensaje' => 'Error al eliminar.']);
}