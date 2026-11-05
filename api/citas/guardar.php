<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config/database.php';

try {
    $datos = json_decode(file_get_contents('php://input'), true);

    if (
        empty($datos['pacienteId']) ||
        empty($datos['fecha']) ||
        empty($datos['hora']) ||
        empty(trim($datos['tipo'] ?? ''))
    ) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'mensaje' => 'Completa todos los campos obligatorios.'
        ]);
        exit;
    }

    $fechaHora = $datos['fecha'] . ' ' . $datos['hora'] . ':00';
    $folio = 'CIT-' . strtoupper(bin2hex(random_bytes(4)));

    $sql = "INSERT INTO citas
        (folio, id_paciente, fecha_hora, duracion_minutos, motivo, estado)
        VALUES
        (:folio, :paciente, :fecha, 30, :motivo, :estado)";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        ':folio' => $folio,
        ':paciente' => $datos['pacienteId'],
        ':fecha' => $fechaHora,
        ':motivo' => trim($datos['tipo']),
        ':estado' => $datos['estado'] ?? 'Pendiente'
    ]);

    echo json_encode([
        'success' => true,
        'mensaje' => 'Cita registrada correctamente.',
        'id' => $conexion->lastInsertId()
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'mensaje' => 'No se pudo registrar la cita.'
    ], JSON_UNESCAPED_UNICODE);
}