
<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config/database.php';

try {
    $datos = json_decode(file_get_contents('php://input'), true);

    if (!$datos || empty(trim($datos['nombre'] ?? ''))) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'mensaje' => 'El nombre es obligatorio.'
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

    $folio = 'PAC-' . strtoupper(bin2hex(random_bytes(5)));

    $sql = "INSERT INTO pacientes
        (folio, nombre, apellidos, fecha_nacimiento, telefono, notas, estado)
        VALUES
        (:folio, :nombre, :apellidos, :fecha_nacimiento, :telefono, :notas, :estado)";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        ':folio' => $folio,
        ':nombre' => $partes[0],
        ':apellidos' => $partes[1],
        ':fecha_nacimiento' => !empty($datos['fechaNacimiento'])
            ? $datos['fechaNacimiento']
            : null,
        ':telefono' => $datos['telefono'] ?? null,
        ':notas' => $datos['notas'] ?? null,
        ':estado' => $datos['estado'] ?? 'Activo'
    ]);

    echo json_encode([
        'success' => true,
        'mensaje' => 'Paciente registrado correctamente.',
        'id' => $conexion->lastInsertId(),
        'folio' => $folio
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'mensaje' => 'No se pudo registrar el paciente.'
    ], JSON_UNESCAPED_UNICODE);
}