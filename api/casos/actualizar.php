
<?php

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config/database.php';

try {
    $datos = json_decode(file_get_contents('php://input'), true);

    if (!is_array($datos)) {
        throw new InvalidArgumentException('Datos inválidos.');
    }

    $id = filter_var($datos['id'] ?? null, FILTER_VALIDATE_INT);
    $pacienteId = filter_var($datos['pacienteId'] ?? null, FILTER_VALIDATE_INT);
    $nombre = trim($datos['nombreCaso'] ?? '');
    $motivo = trim($datos['motivo'] ?? '');
    $estado = $datos['estado'] ?? '';

    if (!$id || !$pacienteId || $nombre === '' || $motivo === '') {
        throw new InvalidArgumentException('Faltan datos obligatorios.');
    }

    if (!in_array($estado, ['Abierto', 'En seguimiento', 'Cerrado'], true)) {
        throw new InvalidArgumentException('Estado no válido.');
    }

    $fecha = $datos['fechaCreacion'] ?? '';
    $fechaValida = DateTimeImmutable::createFromFormat('!Y-m-d', $fecha);

    if (!$fechaValida || $fechaValida->format('Y-m-d') !== $fecha) {
        throw new InvalidArgumentException('Fecha no válida.');
    }

    $sql = "UPDATE casos_clinicos SET
        id_paciente = :paciente,
        nombre = :nombre,
        motivo_consulta = :motivo,
        area = :area,
        diagnostico = :diagnostico,
        antecedentes = :antecedentes,
        datos_adicionales = :adicionales,
        fecha_registro = :fecha,
        estado = :estado
        WHERE id_caso = :id";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        ':paciente' => $pacienteId,
        ':nombre' => $nombre,
        ':motivo' => $motivo,
        ':area' => $datos['area'] ?? null,
        ':diagnostico' => $datos['diagnostico'] ?? null,
        ':antecedentes' => $datos['antecedentes'] ?? null,
        ':adicionales' => $datos['datosAdicionales'] ?? null,
        ':fecha' => $fecha,
        ':estado' => $estado,
        ':id' => $id
    ]);

    $verificar = $conexion->prepare(
        "SELECT id_caso FROM casos_clinicos WHERE id_caso = :id"
    );
    $verificar->execute([':id' => $id]);

    if (!$verificar->fetch()) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'mensaje' => 'Caso clínico no encontrado.'
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'mensaje' => 'Caso clínico actualizado.'
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
        'mensaje' => 'No se pudo actualizar el caso clínico.'
    ], JSON_UNESCAPED_UNICODE);
}
