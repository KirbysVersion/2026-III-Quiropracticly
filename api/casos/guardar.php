
<?php

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config/database.php';

try {
    $datos = json_decode(file_get_contents('php://input'), true);

    if (!is_array($datos)) {
        throw new InvalidArgumentException('Datos inválidos.');
    }

    $pacienteId = filter_var($datos['pacienteId'] ?? null, FILTER_VALIDATE_INT);
    $nombre = trim($datos['nombreCaso'] ?? '');
    $motivo = trim($datos['motivo'] ?? '');
    $estado = $datos['estado'] ?? 'Abierto';
    $fecha = $datos['fechaCreacion'] ?? date('Y-m-d');

    if (!$pacienteId || $pacienteId < 1 || $nombre === '' || $motivo === '') {
        throw new InvalidArgumentException('Completa los campos obligatorios.');
    }

    if (!in_array($estado, ['Abierto', 'En seguimiento', 'Cerrado'], true)) {
        throw new InvalidArgumentException('Estado no válido.');
    }

    $folio = 'CC-' . strtoupper(bin2hex(random_bytes(6)));

    $sql = "INSERT INTO casos_clinicos
        (folio, id_paciente, nombre, motivo_consulta, area,
         diagnostico, antecedentes, datos_adicionales,
         fecha_registro, estado)
        VALUES
        (:folio, :paciente, :nombre, :motivo, :area,
         :diagnostico, :antecedentes, :adicionales,
         :fecha, :estado)";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        ':folio' => $folio,
        ':paciente' => $pacienteId,
        ':nombre' => $nombre,
        ':motivo' => $motivo,
        ':area' => $datos['area'] ?? null,
        ':diagnostico' => $datos['diagnostico'] ?? null,
        ':antecedentes' => $datos['antecedentes'] ?? null,
        ':adicionales' => $datos['datosAdicionales'] ?? null,
        ':fecha' => $fecha,
        ':estado' => $estado
    ]);

    echo json_encode([
        'success' => true,
        'id' => (int)$conexion->lastInsertId(),
        'folio' => $folio
    ], JSON_UNESCAPED_UNICODE);

} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'mensaje' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'mensaje' => 'No se pudo registrar el caso clínico.'
    ], JSON_UNESCAPED_UNICODE);
}
