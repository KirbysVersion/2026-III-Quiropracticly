USE quiropracticly;
CREATE TABLE Usuario (
    id_usuario INT AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_usuario
        PRIMARY KEY (id_usuario),

    CONSTRAINT uq_usuario_correo
        UNIQUE (correo)
);
USE quiropracticly;
CREATE TABLE Paciente (
    id_paciente INT AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    fecha_nacimiento DATE NULL,
    telefono VARCHAR(20) NULL,
    direccion VARCHAR(200) NULL,
    antecedentes_medicos TEXT NOT NULL,

    CONSTRAINT pk_paciente
        PRIMARY KEY (id_paciente),

    CONSTRAINT uq_paciente_usuario
        UNIQUE (id_usuario),

    CONSTRAINT fk_paciente_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);
USE quiropracticly;
CREATE TABLE Cita (
    id_cita INT AUTO_INCREMENT,
    id_paciente INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    motivo VARCHAR(255) NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente',

    CONSTRAINT pk_cita
        PRIMARY KEY (id_cita),

    CONSTRAINT fk_cita_paciente
        FOREIGN KEY (id_paciente)
        REFERENCES Paciente(id_paciente)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_cita_estado
        CHECK (estado IN ('Pendiente', 'Confirmada', 'Atendida', 'Cancelada'))
);
USE quiropracticly;
CREATE TABLE Consulta (
    id_consulta INT AUTO_INCREMENT,
    id_cita INT NOT NULL,
    motivo_consulta VARCHAR(255) NOT NULL,
    diagnostico TEXT NULL,
    observaciones TEXT NULL,
    fecha_consulta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_consulta
        PRIMARY KEY (id_consulta),

    CONSTRAINT uq_consulta_cita
        UNIQUE (id_cita),

    CONSTRAINT fk_consulta_cita
        FOREIGN KEY (id_cita)
        REFERENCES Cita(id_cita)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);
USE quiropracticly;
CREATE TABLE Tratamiento (
    id_tratamiento INT AUTO_INCREMENT,
    id_consulta INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    numero_sesiones INT NULL,
    indicaciones TEXT NULL,

    CONSTRAINT pk_tratamiento
        PRIMARY KEY (id_tratamiento),

    CONSTRAINT fk_tratamiento_consulta
        FOREIGN KEY (id_consulta)
        REFERENCES Consulta(id_consulta)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_tratamiento_sesiones
        CHECK (numero_sesiones IS NULL OR numero_sesiones > 0)
);