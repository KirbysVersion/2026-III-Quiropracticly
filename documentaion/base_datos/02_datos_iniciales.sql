USE quiropracticly;

-- =========================================
-- 1. USUARIOS
-- =========================================

INSERT INTO Usuario (nombre, correo, contrasena, rol)
VALUES
('Fisioterapeuta Demo', 'terapeuta@quiropracticly.com',
 'password123', 'Fisioterapeuta'),

('Desarrollador Demo', 'developer@quiropracticly.com',
 'developer123', 'Desarrollador');


-- =========================================
-- 2. PACIENTES
-- =========================================

INSERT INTO Paciente (
    id_usuario,
    fecha_nacimiento,
    telefono,
    direccion,
    antecedentes_medicos
)
VALUES
(1, '1998-05-14', '5551234567',
 'Calle Ejemplo 123',
 'Sin antecedentes médicos relevantes.'),

(1, '2001-09-22', '5559876543',
 'Avenida Ejemplo 456',
 'Antecedente de lesión muscular en la pierna.');


-- =========================================
-- 3. CITAS
-- =========================================

INSERT INTO Cita (
    id_paciente,
    fecha,
    hora,
    motivo,
    estado
)
VALUES
(1, '2026-10-01', '10:00:00',
 'Dolor de espalda', 'Confirmada'),

(2, '2026-10-02', '12:00:00',
 'Molestia muscular', 'Pendiente');


-- =========================================
-- 4. CONSULTAS
-- =========================================

INSERT INTO Consulta (
    id_cita,
    motivo_consulta,
    diagnostico,
    observaciones
)
VALUES
(1,
 'Dolor en la zona lumbar',
 'Diagnóstico de prueba: dolor lumbar.',
 'Se recomienda evaluación y seguimiento.');


-- =========================================
-- 5. TRATAMIENTOS
-- =========================================

INSERT INTO Tratamiento (
    id_consulta,
    nombre,
    descripcion,
    numero_sesiones,
    indicaciones
)
VALUES
(1,
 'Terapia de movilidad',
 'Tratamiento de prueba para movilidad lumbar.',
 5,
 'Realizar ejercicios según indicaciones del fisioterapeuta.');