<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config/database.php';

try {
    $datos = json_decode(file_get_contents('php://input'), true);

    if (
        empty($datos['pacienteId']) ||
        empty($datos['nombre']) ||
        empty($datos['fechaInicio'])
    ) {
        http_response_code(400);
        throw new Exception('Completa los campos obligatorios.');
    }

    $estadosPermitidos = ['Activo', 'Completado', 'Suspendido'];
    $estado = $datos['estado'] ?? 'Activo';

    if (!in_array($estado, $estadosPermitidos, true)) {
        http_response_code(400);
        throw new Exception('El estado seleccionado no es válido.');
    }

    $folio = 'TRA-' . strtoupper(bin2hex(random_bytes(4)));

    $sesionesCompletadas = max(0, (int)($datos['sesionesCompletadas'] ?? 0));

    $sesionesTotales = isset($datos['sesionesTotales']) && $datos['sesionesTotales'] !== ''
        ? (int)$datos['sesionesTotales']
        : null;

    if ($sesionesTotales !== null && ($sesionesTotales < 1 || $sesionesCompletadas > $sesionesTotales)) {
        http_response_code(400);
        throw new Exception('Revisa las sesiones realizadas y totales.');
    }

    $sql = "
        INSERT INTO tratamientos (
            folio,
            id_paciente,
            nombre,
            fecha_inicio,
            sesiones_completadas,
            sesiones_totales,
            estado
        ) VALUES (
            :folio,
            :pacienteId,
            :nombre,
            :fechaInicio,
            :sesionesCompletadas,
            :sesionesTotales,
            :estado
        )
    ";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        ':folio' => $folio,
        ':pacienteId' => (int)$datos['pacienteId'],
        ':nombre' => trim($datos['nombre']),
        ':fechaInicio' => $datos['fechaInicio'],
        ':sesionesCompletadas' => $sesionesCompletadas,
        ':sesionesTotales' => $sesionesTotales,
        ':estado' => $estado
    ]);

    echo json_encode([
        'success' => true,
        'id' => $conexion->lastInsertId(),
        'folio' => $folio
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if (http_response_code() < 400) {
        http_response_code(400);
    }

    echo json_encode([
        'success' => false,
        'mensaje' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}