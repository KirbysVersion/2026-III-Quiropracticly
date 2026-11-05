const STORAGE_KEY = "quiropracticly-datos-v1";

const vacio = {
    pacientes: [],
    citas: [],
    tratamientos: [],
    casosClinicos: []
};

let datos = cargarDatos();
let pacienteSeleccionado = null;

function cargarDatos() {
    try {
        const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (guardados && Array.isArray(guardados.pacientes)) {
            return {
                pacientes: guardados.pacientes || [],
                citas: guardados.citas || [],
                tratamientos: guardados.tratamientos || [],
                casosClinicos: guardados.casosClinicos || []
            };
        }

        return structuredClone(vacio);
    } catch {
        return structuredClone(vacio);
    }
}

function guardarDatos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
}
async function cargarPacientesBD() {
    try {
        const respuesta = await fetch("api/pacientes/listar.php");
        const resultado = await respuesta.json();

        if (!resultado.success) {
            throw new Error(resultado.mensaje);
        }

        if (resultado.pacientes.length > 0) {
            datos.pacientes = resultado.pacientes.map(p => ({
                ...p,
                id: Number(p.id),
                edad: p.edad ? `${p.edad} años` : ""
            }));

            actualizarTodo();
        }

        console.log("Pacientes consultados desde MySQL.");

    } catch (error) {
        console.error("Error al cargar pacientes:", error);
        alert("No se pudieron cargar los pacientes desde MySQL.");
    }
}
async function cargarCitasBD() {
    try {
        const respuesta = await fetch("api/citas/listar.php");
        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.success) {
            throw new Error(resultado.mensaje);
        }

        datos.citas = resultado.citas.map(c => ({
            ...c,
            id: Number(c.id),
            pacienteId: Number(c.pacienteId)
        }));

        actualizarTodo();

        console.log("Citas consultadas desde MySQL.");

    } catch (error) {
        console.error("Error al cargar citas:", error);
        alert("No se pudieron cargar las citas desde MySQL.");
    }
}

function hoyISO() {
    const fecha = new Date();
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
}

function fechaBonita(fecha) {
    if (!fecha) return "—";
    const [y, m, d] = fecha.split("-");
    return y && m && d ? `${d}/${m}/${y}` : fecha;
}

function escapar(texto = "") {
    return String(texto).replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[caracter]));
}

function pacientePorId(id) {
    return datos.pacientes.find(p => p.id === Number(id));
}

function siguienteId() {
    return Math.max(
        0,
        ...datos.pacientes.map(x => x.id),
        ...datos.citas.map(x => x.id),
        ...datos.tratamientos.map(x => x.id),
        ...datos.casosClinicos.map(x => x.id)
    ) + 1;
}

function siguienteFolioCaso() {
    const numeros = datos.casosClinicos.map(c => {
        const coincidencia = String(c.folio || "").match(/CC-(\d+)/);
        return coincidencia ? Number(coincidencia[1]) : 0;
    });

    const siguiente = Math.max(0, ...numeros) + 1;
    return `CC-${String(siguiente).padStart(4, "0")}`;
}

function campo(label, name, type = "text", options = {}) {
    const required = options.required ? " required" : "";
    const min = options.min !== undefined ? ` min="${options.min}"` : "";
    const value = options.value ? ` value="${escapar(options.value)}"` : "";
    const placeholder = options.placeholder ? ` placeholder="${escapar(options.placeholder)}"` : "";

    return `<label>${label}<input name="${name}" type="${type}"${required}${min}${value}${placeholder}></label>`;
}

function campoDiagnostico() {
    return `<div class="diagnostico-field">
        <label>Diagnóstico
            <input name="diagnostico" type="text" placeholder="Escribe o selecciona zonas de dolor">
        </label>
        <button type="button" class="map-toggle" aria-expanded="false">⌖ Elegir zonas en el mapa</button>
        <div class="pain-map hidden">
            <div class="pain-map-heading">
                <strong>Selecciona las zonas con dolor</strong>
                <span>Puedes elegir más de una.</span>
            </div>
            <svg class="body-map" viewBox="0 0 520 350" role="group" aria-label="Mapa corporal interactivo de zonas de dolor">
                <g class="body-figure" aria-hidden="true">
                    <circle cx="130" cy="45" r="19"/>
                    <path d="M119 68h22v15l22 11-8 83-10 28h-30l-10-28-8-83 22-11z"/>
                    <path d="M99 96 78 105 61 155l-12 57M163 96l21 9 17 50 12 57M105 185l-8 70 4 69M155 185l8 70-4 69"/>
                    <circle cx="390" cy="45" r="19"/>
                    <path d="M379 68h22v15l22 11-8 83-10 28h-30l-10-28-8-83 22-11z"/>
                    <path d="M359 96 338 105l-17 50-12 57M423 96l21 9 17 50 12 57M365 185l-8 70 4 69M415 185l8 70-4 69"/>
                </g>

                <text class="figure-label" x="130" y="344" text-anchor="middle">FRENTE</text>
                <text class="figure-label" x="390" y="344" text-anchor="middle">ESPALDA</text>

                <g class="pain-point" role="button" tabindex="0" data-pain="Dolor cervical" aria-label="Dolor cervical"><circle cx="130" cy="78" r="9"/></g>
                <g class="pain-point" role="button" tabindex="0" data-pain="Dolor de hombro" aria-label="Dolor de hombro"><circle cx="107" cy="101" r="9"/></g>
                <g class="pain-point" role="button" tabindex="0" data-pain="Dolor de hombro" aria-label="Dolor de hombro"><circle cx="153" cy="101" r="9"/></g>
                <g class="pain-point" role="button" tabindex="0" data-pain="Dolor de codo" aria-label="Dolor de codo"><circle cx="66" cy="158" r="9"/></g>
                <g class="pain-point" role="button" tabindex="0" data-pain="Dolor de codo" aria-label="Dolor de codo"><circle cx="194" cy="158" r="9"/></g>
                <g class="pain-point" role="button" tabindex="0" data-pain="Dolor de muñeca" aria-label="Dolor de muñeca"><circle cx="50" cy="211" r="9"/></g>
                <g class="pain-point" role="button" tabindex="0" data-pain="Dolor de muñeca" aria-label="Dolor de muñeca"><circle cx="210" cy="211" r="9"/></g>
                <g class="pain-point" role="button" tabindex="0" data-pain="Dolor dorsal" aria-label="Dolor dorsal"><circle cx="390" cy="132" r="9"/></g>
                <g class="pain-point" role="button" tabindex="0" data-pain="Dolor lumbar" aria-label="Dolor lumbar"><circle cx="390" cy="178" r="9"/></g>
                <g class="pain-point" role="button" tabindex="0" data-pain="Dolor de cadera" aria-label="Dolor de cadera"><circle cx="376" cy="200" r="9"/></g>
                <g class="pain-point" role="button" tabindex="0" data-pain="Dolor de cadera" aria-label="Dolor de cadera"><circle cx="404" cy="200" r="9"/></g>
                <g class="pain-point" role="button" tabindex="0" data-pain="Dolor de rodilla" aria-label="Dolor de rodilla"><circle cx="115" cy="255" r="9"/></g>
                <g class="pain-point" role="button" tabindex="0" data-pain="Dolor de rodilla" aria-label="Dolor de rodilla"><circle cx="165" cy="255" r="9"/></g>
                <g class="pain-point" role="button" tabindex="0" data-pain="Dolor de tobillo" aria-label="Dolor de tobillo"><circle cx="101" cy="322" r="9"/></g>
                <g class="pain-point" role="button" tabindex="0" data-pain="Dolor de tobillo" aria-label="Dolor de tobillo"><circle cx="159" cy="322" r="9"/></g>
            </svg>
            <p class="pain-map-help">Toca un punto del cuerpo para agregar o quitar esa zona del diagnóstico.</p>
        </div>
    </div>`;
}

function selector(label, name, choices, required = true) {
    return `<label>${label}
        <select name="${name}"${required ? " required" : ""}>
            ${choices.map(([v, t]) => `<option value="${escapar(v)}">${escapar(t)}</option>`).join("")}
        </select>
    </label>`;
}

function bloqueFormulario(campos) {
    return `${campos}<button class="btn" type="submit">Guardar</button>`;
}

/* ESTADÍSTICAS */

function actualizarEstadisticas() {
    const ahora = new Date();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const anio = String(ahora.getFullYear());

    const registrosMes = datos.pacientes.filter(p =>
        (p.fechaRegistro || "").startsWith(`${anio}-${mes}`)
    ).length;

    const citasHoy = datos.citas.filter(c =>
        c.fecha === hoyISO() && !["Cancelada", "Completada"].includes(c.estado)
    ).length;

    document.getElementById("totalPacientes").textContent = datos.pacientes.length;
    document.getElementById("pacientesEsteMes").textContent = `+${registrosMes} este mes`;

    document.getElementById("totalCitas").textContent =
        datos.citas.filter(c => !["Cancelada", "Completada"].includes(c.estado)).length;

    document.getElementById("citasRestantes").textContent = `${citasHoy} restantes hoy`;

    document.getElementById("totalTratamientos").textContent =
        datos.tratamientos.filter(t => t.estado === "Activo").length;
}

function filaVacia(tbody, columnas, mensaje) {
    tbody.innerHTML = `<tr><td class="empty" colspan="${columnas}">${mensaje}</td></tr>`;
}

/* PACIENTES */

function renderPacientes(filtro = "") {
    const tbody = document.getElementById("tablaPacientes");

    const lista = datos.pacientes.filter(p =>
        p.nombre.toLowerCase().includes(filtro.toLowerCase())
    );

    if (!lista.length) {
        return filaVacia(
            tbody,
            7,
            filtro ? "No se encontraron pacientes." : "Aún no hay pacientes registrados."
        );
    }

    tbody.innerHTML = lista.map(p => `
        <tr class="patient-row" data-id="${p.id}">
            <td>${escapar(p.folio)}</td>
            <td>${escapar(p.nombre)}</td>
            <td>${p.edad || "—"}</td>
            <td>${escapar(p.telefono || "—")}</td>
            <td>${escapar(p.diagnostico || "—")}</td>
            <td><span class="status ${p.estado === "Activo" ? "active" : "pending"}">${escapar(p.estado)}</span></td>
            <td class="row-actions">
                <button class="schedule-btn" data-cita-paciente="${p.id}">Agendar cita</button>
                <button class="edit-btn" data-edit-paciente="${p.id}">Editar</button>
                <button class="delete-btn" data-delete-paciente="${p.id}">Eliminar</button>
            </td>
        </tr>
    `).join("");

    tbody.querySelectorAll(".patient-row").forEach(row => {
        row.addEventListener("click", e => {
            if (!e.target.closest("button")) {
                mostrarFicha(Number(row.dataset.id));
            }
        });
    });

    tbody.querySelectorAll("[data-delete-paciente]").forEach(btn =>
        btn.addEventListener("click", () => eliminarPaciente(Number(btn.dataset.deletePaciente)))
    );

    tbody.querySelectorAll("[data-edit-paciente]").forEach(btn =>
        btn.addEventListener("click", () => editarPaciente(Number(btn.dataset.editPaciente)))
    );

    tbody.querySelectorAll("[data-cita-paciente]").forEach(btn =>
        btn.addEventListener("click", () => abrirFormularioCita(Number(btn.dataset.citaPaciente)))
    );
}

/* CITAS */

function renderCitas() {
    const tbody = document.getElementById("tablaCitas");

    if (!datos.citas.length) {
        return filaVacia(tbody, 6, "Aún no hay citas registradas.");
    }

    tbody.innerHTML = [...datos.citas]
        .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`))
        .map(c => `
            <tr>
                <td>${fechaBonita(c.fecha)}</td>
                <td>${escapar(c.hora)}</td>
                <td>${escapar(pacientePorId(c.pacienteId)?.nombre || "—")}</td>
                <td>${escapar(c.tipo)}</td>
                <td>
                    <span class="status ${["Confirmada", "Completada"].includes(c.estado) ? "active" : "pending"}">
                        ${escapar(c.estado)}
                    </span>
                </td>
                <td class="row-actions">
                    ${["Cancelada", "Completada"].includes(c.estado)
                ? `<button class="edit-btn" data-restaurar-cita="${c.id}">Restaurar</button>`
                : `<button class="delete-btn" data-cancelar-cita="${c.id}">Cancelar</button>
                           <button class="edit-btn" data-completar-cita="${c.id}">Completar</button>`
            }
                    <button class="delete-btn" data-delete-cita="${c.id}">Eliminar</button>
                </td>
            </tr>
        `).join("");

    tbody.querySelectorAll("[data-delete-cita]").forEach(b =>
        b.addEventListener("click", async () => {
            const id = Number(b.dataset.deleteCita);

            if (!confirm("¿Deseas eliminar esta cita?")) return;

            try {
                const respuesta = await fetch("api/citas/eliminar.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ id })
                });

                const resultado = await respuesta.json();

                if (!respuesta.ok || !resultado.success) {
                    throw new Error(resultado.mensaje);
                }

                datos.citas = datos.citas.filter(c => Number(c.id) !== id);
                actualizarTodo();

                alert("Cita eliminada correctamente.");

            } catch (error) {
                console.error(error);
                alert(error.message || "No se pudo eliminar la cita.");
            }
        })
    );

    tbody.querySelectorAll("[data-cancelar-cita]").forEach(b =>
        b.addEventListener("click", () => cambiarEstadoCita(Number(b.dataset.cancelarCita), "Cancelada"))
    );

    tbody.querySelectorAll("[data-completar-cita]").forEach(b =>
        b.addEventListener("click", () => cambiarEstadoCita(Number(b.dataset.completarCita), "Completada"))
    );

    tbody.querySelectorAll("[data-restaurar-cita]").forEach(b =>
        b.addEventListener("click", () => restaurarCita(Number(b.dataset.restaurarCita)))
    );
}

/* TRATAMIENTOS */

function renderTratamientos() {
    const tbody = document.getElementById("tablaTratamientos");

    if (!datos.tratamientos.length) {
        return filaVacia(tbody, 6, "Aún no hay tratamientos registrados.");
    }

    tbody.innerHTML = datos.tratamientos.map(t => `
        <tr>
            <td>${escapar(pacientePorId(t.pacienteId)?.nombre || "—")}</td>
            <td>${escapar(t.nombre)}</td>
            <td>${fechaBonita(t.fechaInicio)}</td>
            <td>${escapar(t.sesiones || "—")}</td>
            <td>
                <span class="status ${["Activo", "Completado"].includes(t.estado) ? "active" : "pending"}">
                    ${escapar(t.estado)}
                </span>
            </td>
            <td class="row-actions">
                ${t.estado === "Activo" ? `<button class="edit-btn" data-completar-tratamiento="${t.id}">Marcar completado</button>` : ""}
                <button class="delete-btn" data-delete-tratamiento="${t.id}">Eliminar</button>
            </td>
        </tr>
    `).join("");

    tbody.querySelectorAll("[data-delete-tratamiento]").forEach(b =>
        b.addEventListener("click", () => {
            datos.tratamientos = datos.tratamientos.filter(t => t.id !== Number(b.dataset.deleteTratamiento));
            actualizarTodo();
        })
    );

    tbody.querySelectorAll("[data-completar-tratamiento]").forEach(b =>
        b.addEventListener("click", () => {
            const tratamiento = datos.tratamientos.find(t => t.id === Number(b.dataset.completarTratamiento));
            if (tratamiento) {
                tratamiento.estado = "Completado";
                actualizarTodo();
            }
        })
    );
}

/* CASOS CLÍNICOS */

function renderCasos(filtro = "") {
    const tbody = document.getElementById("tablaCasos");

    const busqueda = filtro.toLowerCase().trim();

    const lista = datos.casosClinicos.filter(c => {
        const paciente = pacientePorId(c.pacienteId);
        const texto = [
            c.folio,
            c.nombreCaso,
            c.motivo,
            c.area,
            paciente?.nombre
        ].join(" ").toLowerCase();

        return texto.includes(busqueda);
    });

    if (!lista.length) {
        return filaVacia(
            tbody,
            7,
            busqueda ? "No se encontraron casos clínicos." : "Aún no hay casos clínicos registrados."
        );
    }

    tbody.innerHTML = [...lista]
        .sort((a, b) => (b.fechaCreacion || "").localeCompare(a.fechaCreacion || ""))
        .map(c => `
            <tr>
                <td class="case-folio">${escapar(c.folio)}</td>
                <td>${escapar(pacientePorId(c.pacienteId)?.nombre || "Paciente no disponible")}</td>
                <td>${escapar(c.nombreCaso)}</td>
                <td>${escapar(c.area || "—")}</td>
                <td>${fechaBonita(c.fechaCreacion)}</td>
                <td>
                    <span class="status ${c.estado === "Activo" ? "active" : "pending"}">
                        ${escapar(c.estado)}
                    </span>
                </td>
                <td class="row-actions case-actions">
                    <button class="view-btn" data-ver-caso="${c.id}">Ver</button>
                    <button class="edit-btn" data-editar-caso="${c.id}">Editar</button>
                    <button class="delete-btn" data-eliminar-caso="${c.id}">Eliminar</button>
                </td>
            </tr>
        `).join("");

    tbody.querySelectorAll("[data-ver-caso]").forEach(btn =>
        btn.addEventListener("click", () => verCaso(Number(btn.dataset.verCaso)))
    );

    tbody.querySelectorAll("[data-editar-caso]").forEach(btn =>
        btn.addEventListener("click", () => editarCaso(Number(btn.dataset.editarCaso)))
    );

    tbody.querySelectorAll("[data-eliminar-caso]").forEach(btn =>
        btn.addEventListener("click", () => eliminarCaso(Number(btn.dataset.eliminarCaso)))
    );
}

function camposCaso() {
    const pacientes = listaPacientes();

    return `
        <div class="form-grid">
            ${campo("Nombre del caso clínico", "nombreCaso", "text", {
        required: true,
        placeholder: "Ej. Dolor lumbar crónico"
    })}

            ${selector("Paciente asociado", "pacienteId", pacientes)}

            ${campo("Motivo de consulta", "motivo", "text", {
        required: true,
        placeholder: "Motivo principal de atención"
    })}

            ${campo("Área o especialidad", "area", "text", {
        required: true,
        placeholder: "Ej. Quiropráctica, columna vertebral..."
    })}

            ${campo("Fecha de nacimiento", "fechaNacimiento", "date")}

            ${campo("Fecha de creación", "fechaCreacion", "date", {
        required: true,
        value: hoyISO()
    })}

            <div class="wide">
                <label>Fotografía del paciente
                    <input type="file" name="fotografia" accept="image/*">
                </label>
                <div id="previewFotografia" class="case-photo-placeholder">Sin foto</div>
            </div>

            <label class="wide">Diagnóstico
                <textarea name="diagnostico" rows="3" placeholder="Diagnóstico clínico del paciente"></textarea>
            </label>

            <label class="wide">Antecedentes y datos adicionales
                <textarea name="antecedentes" rows="4" placeholder="Antecedentes médicos, observaciones y datos relevantes"></textarea>
            </label>

            <label class="wide">Plan de atención u observaciones
                <textarea name="datosAdicionales" rows="3" placeholder="Información complementaria del caso"></textarea>
            </label>

            ${selector("Estado del caso", "estado", [
        ["Activo", "Activo"],
        ["En seguimiento", "En seguimiento"],
        ["Finalizado", "Finalizado"],
        ["Suspendido", "Suspendido"]
    ])}
        </div>
    `;
}

function configurarPreviewFoto(fotoActual = "") {
    const inputFoto = form.querySelector('[name="fotografia"]');
    const preview = form.querySelector("#previewFotografia");

    if (!inputFoto || !preview) return;

    if (fotoActual) {
        preview.outerHTML = `<img id="previewFotografia" class="case-photo-preview" src="${fotoActual}" alt="Fotografía del paciente">`;
    }

    inputFoto.addEventListener("change", () => {
        const archivo = inputFoto.files[0];
        if (!archivo) return;

        if (!archivo.type.startsWith("image/")) {
            alert("Selecciona un archivo de imagen válido.");
            inputFoto.value = "";
            return;
        }

        const lector = new FileReader();

        lector.onload = () => {
            const imagen = form.querySelector("#previewFotografia");
            if (imagen) {
                imagen.outerHTML = `<img id="previewFotografia" class="case-photo-preview" src="${lector.result}" alt="Vista previa de la fotografía">`;
            }
        };

        lector.readAsDataURL(archivo);
    });
}

function leerFotografia(archivo) {
    return new Promise((resolve, reject) => {
        if (!archivo) {
            resolve("");
            return;
        }

        const lector = new FileReader();
        lector.onload = () => resolve(lector.result);
        lector.onerror = () => reject(new Error("No se pudo leer la fotografía."));
        lector.readAsDataURL(archivo);
    });
}

function nuevoCaso() {
    if (!datos.pacientes.length) {
        return alert("Primero debes registrar un paciente para crear un caso clínico.");
    }

    abrirModal(
        "Nuevo caso clínico",
        "Completa la información para crear un nuevo expediente clínico.",
        camposCaso(),
        async valores => {
            const archivo = form.elements.namedItem("fotografia").files[0];
            const fotografia = await leerFotografia(archivo);

            const pacienteId = Number(valores.pacienteId);
            const paciente = pacientePorId(pacienteId);

            if (!paciente) {
                alert("No se encontró el paciente seleccionado.");
                return;
            }

            const caso = {
                id: siguienteId(),
                folio: siguienteFolioCaso(),
                pacienteId,
                nombreCaso: valores.nombreCaso.trim(),
                motivo: valores.motivo.trim(),
                area: valores.area.trim(),
                fechaNacimiento: valores.fechaNacimiento,
                fotografia,
                diagnostico: valores.diagnostico.trim(),
                antecedentes: valores.antecedentes.trim(),
                datosAdicionales: valores.datosAdicionales.trim(),
                fechaCreacion: valores.fechaCreacion || hoyISO(),
                estado: valores.estado
            };

            datos.casosClinicos.push(caso);

            // Vincula la información personal al expediente del paciente.
            if (caso.fechaNacimiento) {
                paciente.fechaNacimiento = caso.fechaNacimiento;
            }

            if (fotografia) {
                paciente.fotografia = fotografia;
            }

            paciente.historial = paciente.historial || [];
            paciente.historial.unshift({
                fecha: caso.fechaCreacion,
                descripcion: `Caso clínico creado: ${caso.nombreCaso} (${caso.folio})`
            });

            pacienteSeleccionado = pacienteId;
            actualizarTodo();
        }
    );

    configurarPreviewFoto();
}

function editarCaso(id) {
    const caso = datos.casosClinicos.find(c => c.id === id);
    if (!caso) return;

    abrirModal(
        "Editar caso clínico",
        `Actualiza la información del expediente ${caso.folio}.`,
        camposCaso(),
        async valores => {
            const archivo = form.elements.namedItem("fotografia").files[0];
            const fotografiaNueva = await leerFotografia(archivo);

            const pacienteAnterior = pacientePorId(caso.pacienteId);
            const nuevoPacienteId = Number(valores.pacienteId);
            const nuevoPaciente = pacientePorId(nuevoPacienteId);

            if (!nuevoPaciente) {
                alert("No se encontró el paciente seleccionado.");
                return;
            }

            const pacienteCambio = caso.pacienteId !== nuevoPacienteId;

            Object.assign(caso, {
                pacienteId: nuevoPacienteId,
                nombreCaso: valores.nombreCaso.trim(),
                motivo: valores.motivo.trim(),
                area: valores.area.trim(),
                fechaNacimiento: valores.fechaNacimiento,
                fotografia: fotografiaNueva || caso.fotografia || "",
                diagnostico: valores.diagnostico.trim(),
                antecedentes: valores.antecedentes.trim(),
                datosAdicionales: valores.datosAdicionales.trim(),
                fechaCreacion: valores.fechaCreacion,
                estado: valores.estado
            });

            if (pacienteCambio && pacienteAnterior) {
                pacienteAnterior.historial = (pacienteAnterior.historial || []).filter(
                    h => h.descripcion !== `Caso clínico creado: ${caso.nombreCaso} (${caso.folio})`
                );
            }

            nuevoPaciente.fechaNacimiento = caso.fechaNacimiento || nuevoPaciente.fechaNacimiento;
            nuevoPaciente.fotografia = caso.fotografia || nuevoPaciente.fotografia;
            nuevoPaciente.historial = nuevoPaciente.historial || [];

            nuevoPaciente.historial.unshift({
                fecha: hoyISO(),
                descripcion: `Caso clínico actualizado: ${caso.nombreCaso} (${caso.folio})`
            });

            pacienteSeleccionado = nuevoPacienteId;
            actualizarTodo();
        },
        {
            nombreCaso: caso.nombreCaso,
            pacienteId: String(caso.pacienteId),
            motivo: caso.motivo,
            area: caso.area,
            fechaNacimiento: caso.fechaNacimiento,
            fechaCreacion: caso.fechaCreacion,
            diagnostico: caso.diagnostico,
            antecedentes: caso.antecedentes,
            datosAdicionales: caso.datosAdicionales,
            estado: caso.estado
        }
    );

    configurarPreviewFoto(caso.fotografia || "");
}

function verCaso(id) {
    const caso = datos.casosClinicos.find(c => c.id === id);
    if (!caso) return;

    const paciente = pacientePorId(caso.pacienteId);

    document.getElementById("modalTitulo").textContent = "Expediente clínico";
    document.getElementById("modalDescripcion").textContent = `Folio ${caso.folio}`;

    form.innerHTML = `
        <div class="case-detail">
            <div class="case-detail-heading">
                ${caso.fotografia
            ? `<img src="${caso.fotografia}" alt="Fotografía del paciente">`
            : `<div class="case-photo-placeholder">Sin foto</div>`
        }
                <div>
                    <strong>${escapar(caso.nombreCaso)}</strong>
                    <span>${escapar(paciente?.nombre || "Paciente no disponible")}</span>
                    <span class="case-folio">${escapar(caso.folio)}</span>
                </div>
            </div>

            <div class="form-grid">
                <div class="case-detail-block">
                    <h3>Motivo de consulta</h3>
                    <p>${escapar(caso.motivo || "Sin información")}</p>
                </div>
                <div class="case-detail-block">
                    <h3>Área o especialidad</h3>
                    <p>${escapar(caso.area || "Sin información")}</p>
                </div>
                <div class="case-detail-block">
                    <h3>Fecha de nacimiento</h3>
                    <p>${fechaBonita(caso.fechaNacimiento)}</p>
                </div>
                <div class="case-detail-block">
                    <h3>Fecha de creación</h3>
                    <p>${fechaBonita(caso.fechaCreacion)}</p>
                </div>
            </div>

            <div class="case-detail-block">
                <h3>Diagnóstico</h3>
                <p>${escapar(caso.diagnostico || "Sin información")}</p>
            </div>

            <div class="case-detail-block">
                <h3>Antecedentes y datos adicionales</h3>
                <p>${escapar(caso.antecedentes || "Sin información")}</p>
            </div>

            <div class="case-detail-block">
                <h3>Plan de atención u observaciones</h3>
                <p>${escapar(caso.datosAdicionales || "Sin información")}</p>
            </div>

            <div class="case-detail-block">
                <h3>Estado del caso</h3>
                <p>${escapar(caso.estado)}</p>
            </div>

            <button type="button" class="btn" id="btnEditarDesdeVista">Editar caso</button>
        </div>
    `;

    form.onsubmit = null;

    form.querySelector("#btnEditarDesdeVista").addEventListener("click", () => {
        editarCaso(id);
    });

    modal.classList.remove("hidden");
}

function eliminarCaso(id) {
    const caso = datos.casosClinicos.find(c => c.id === id);
    if (!caso) return;

    if (!confirm(`¿Eliminar el caso clínico ${caso.folio}? Esta acción no se puede deshacer.`)) {
        return;
    }

    datos.casosClinicos = datos.casosClinicos.filter(c => c.id !== id);

    const paciente = pacientePorId(caso.pacienteId);

    if (paciente) {
        paciente.historial = (paciente.historial || []).filter(
            h => !h.descripcion.includes(`(${caso.folio})`)
        );
    }

    actualizarTodo();
}

/* FICHA DEL PACIENTE */

function mostrarFicha(id) {
    const p = pacientePorId(id);
    if (!p) return;

    pacienteSeleccionado = id;

    document.getElementById("btnCitaPaciente").disabled = false;
    document.getElementById("nombrePaciente").textContent = p.nombre;
    document.getElementById("folioPaciente").textContent = `Folio ${p.folio}`;

    const avatar = document.getElementById("avatarPaciente");

    if (p.fotografia) {
        avatar.innerHTML = `<img src="${p.fotografia}" alt="Foto de ${escapar(p.nombre)}">`;
        avatar.style.background = "transparent";
        avatar.style.overflow = "hidden";
        avatar.querySelector("img").style.cssText = "width:100%;height:100%;object-fit:cover;border-radius:50%;";
    } else {
        avatar.textContent = p.nombre.trim().charAt(0).toUpperCase();
        avatar.style.background = "#555b4f";
    }

    document.getElementById("edadPaciente").textContent =
        p.edad || calcularEdad(p.fechaNacimiento) || "—";

    document.getElementById("telefonoPaciente").textContent = p.telefono || "—";
    document.getElementById("diagnosticoPaciente").textContent = p.diagnostico || "—";
    document.getElementById("inicioPaciente").textContent = fechaBonita(p.fechaInicio);
    document.getElementById("estadoPaciente").textContent = p.estado;
    document.getElementById("notasPaciente").textContent = p.notas || "—";

    const registros = [
        ...(p.historial || []),

        ...datos.citas
            .filter(c => c.pacienteId === id)
            .map(c => ({
                fecha: c.fecha,
                descripcion: `Cita: ${c.tipo} (${c.estado})`
            })),

        ...datos.tratamientos
            .filter(t => t.pacienteId === id)
            .map(t => ({
                fecha: t.fechaInicio,
                descripcion: `Tratamiento: ${t.nombre} (${t.estado})`
            })),

        ...datos.casosClinicos
            .filter(c => c.pacienteId === id)
            .map(c => ({
                fecha: c.fechaCreacion,
                descripcion: `Caso clínico: ${c.nombreCaso} (${c.folio})`
            }))
    ].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

    const historial = document.getElementById("historialPaciente");

    historial.innerHTML = registros.length
        ? registros.map(r => `
            <div class="historial-item">
                <strong>${escapar(r.descripcion)}</strong>
                <span>${fechaBonita(r.fecha)}</span>
            </div>
        `).join("")
        : "<p>No hay historial registrado.</p>";
}

function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return "";

    const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
    if (Number.isNaN(nacimiento.getTime())) return "";

    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();

    const diferenciaMes = hoy.getMonth() - nacimiento.getMonth();

    if (
        diferenciaMes < 0 ||
        (diferenciaMes === 0 && hoy.getDate() < nacimiento.getDate())
    ) {
        edad--;
    }

    return edad >= 0 ? `${edad} años` : "";
}

function actualizarTodo() {
    guardarDatos();
    actualizarEstadisticas();

    renderPacientes(document.getElementById("buscarPaciente").value);
    renderCitas();
    renderTratamientos();
    renderCasos(document.getElementById("buscarCaso").value);

    if (pacienteSeleccionado && pacientePorId(pacienteSeleccionado)) {
        mostrarFicha(pacienteSeleccionado);
    }
}

/* MODAL */

const modal = document.getElementById("modal");
const form = document.getElementById("formModal");

function abrirModal(titulo, descripcion, campos, guardar, iniciales = {}) {
    document.getElementById("modalTitulo").textContent = titulo;
    document.getElementById("modalDescripcion").textContent = descripcion;

    form.innerHTML = bloqueFormulario(campos);

    Object.entries(iniciales).forEach(([nombre, valor]) => {
        const control = form.elements.namedItem(nombre);
        if (control) control.value = valor ?? "";
    });

    activarMapaDiagnostico();

    form.onsubmit = async event => {
        event.preventDefault();

        const valores = Object.fromEntries(new FormData(form));

        try {
            await guardar(valores);
            cerrarModal();
        } catch (error) {
            console.error(error);
            alert("Ocurrió un error al guardar la información. Comprueba el archivo de imagen e inténtalo de nuevo.");
        }
    };

    modal.classList.remove("hidden");
    form.querySelector("input,select")?.focus();
}

function activarMapaDiagnostico() {
    const input = form.elements.namedItem("diagnostico");
    const toggle = form.querySelector(".map-toggle");
    const panel = form.querySelector(".pain-map");

    if (!input || !toggle || !panel) return;

    const puntos = [...panel.querySelectorAll(".pain-point")];

    const actualizarPuntos = () => {
        const valores = input.value.split(/[,;]/).map(x => x.trim()).filter(Boolean);

        puntos.forEach(p => {
            const activo = valores.includes(p.dataset.pain);
            p.classList.toggle("selected", activo);
            p.setAttribute("aria-pressed", String(activo));
        });
    };

    const alternarPunto = p => {
        const valores = input.value.split(/[,;]/).map(x => x.trim()).filter(Boolean);
        const texto = p.dataset.pain;

        const nuevos = valores.includes(texto)
            ? valores.filter(x => x !== texto)
            : [...valores, texto];

        input.value = nuevos.join(", ");
        actualizarPuntos();
        input.dispatchEvent(new Event("input", { bubbles: true }));
    };

    toggle.addEventListener("click", () => {
        const abierto = panel.classList.toggle("hidden");

        toggle.setAttribute("aria-expanded", String(!abierto));
        toggle.textContent = abierto ? "⌖ Elegir zonas en el mapa" : "Cerrar mapa de dolor";

        if (!abierto) actualizarPuntos();
    });

    puntos.forEach(p => {
        p.addEventListener("click", () => alternarPunto(p));

        p.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                alternarPunto(p);
            }
        });
    });

    input.addEventListener("input", actualizarPuntos);
    actualizarPuntos();
}

function cerrarModal() {
    modal.classList.add("hidden");
    form.reset();
    form.onsubmit = null;
}

document.getElementById("cerrarModal").addEventListener("click", cerrarModal);

modal.addEventListener("click", e => {
    if (e.target === modal) cerrarModal();
});

document.addEventListener("keydown", e => {
    if (e.key === "Escape") cerrarModal();
});



function listaPacientes() {
    return datos.pacientes.length
        ? datos.pacientes
            .map(p => [String(p.id), p.nombre])
            .sort((a, b) => a[1].localeCompare(b[1], "es"))
        : [];
}

function editarPaciente(id) {
    const p = pacientePorId(id);
    if (!p) return;

    const campos = `
        <div class="form-grid">
            ${campo("Nombre completo", "nombre", "text", { required: true })}
            ${campo("Fecha de nacimiento", "fechaNacimiento", "date")}
            ${campo("Teléfono", "telefono", "tel")}
            ${campoDiagnostico()}
            ${campo("Fecha de inicio", "fechaInicio", "date")}
            ${selector("Estado del paciente", "estado", [
        ["Activo", "Activo"],
        ["Inactivo", "Inactivo"]
    ])}
            <label class="wide">Notas clínicas
                <textarea name="notas" rows="3" placeholder="Antecedentes, observaciones u otra información"></textarea>
            </label>
        </div>
    `;

    abrirModal(
        "Editar paciente",
        "Actualiza los datos de su ficha.",
        campos,
        async v => {
            const respuesta = await fetch("api/pacientes/actualizar.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id,
                    nombre: v.nombre.trim(),
                    fechaNacimiento: v.fechaNacimiento,
                    telefono: v.telefono.trim(),
                    notas: v.notas.trim(),
                    estado: v.estado
                })
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok || !resultado.success) {
                throw new Error(resultado.mensaje || "No se pudo actualizar el paciente.");
            }

            Object.assign(p, {
                nombre: v.nombre.trim(),
                fechaNacimiento: v.fechaNacimiento,
                telefono: v.telefono.trim(),
                edad: v.fechaNacimiento
                    ? Math.floor((new Date() - new Date(v.fechaNacimiento)) / 31557600000) + " años"
                    : "",
                diagnostico: v.diagnostico.trim(),
                fechaInicio: v.fechaInicio,
                estado: v.estado,
                notas: v.notas.trim()
            });

            pacienteSeleccionado = id;
            actualizarTodo();

            alert("Paciente actualizado correctamente.");
        },
        {
            nombre: p.nombre,
            fechaNacimiento: p.fechaNacimiento,
            telefono: p.telefono,
            diagnostico: p.diagnostico,
            fechaInicio: p.fechaInicio,
            estado: p.estado,
            notas: p.notas
        }
    );
}

async function eliminarPaciente(id) {
    const p = pacientePorId(id);

    if (!p || !confirm(`¿Eliminar la ficha de ${p.nombre}?`)) {
        return;
    }

    try {
        const respuesta = await fetch("api/pacientes/eliminar.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: id })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.success) {
            throw new Error(resultado.mensaje || "No se pudo eliminar el paciente.");
        }

        datos.pacientes = datos.pacientes.filter(x => Number(x.id) !== Number(id));
        datos.citas = datos.citas.filter(x => Number(x.pacienteId) !== Number(id));
        datos.tratamientos = datos.tratamientos.filter(x => Number(x.pacienteId) !== Number(id));
        datos.casosClinicos = datos.casosClinicos.filter(x => Number(x.pacienteId) !== Number(id));

        if (Number(pacienteSeleccionado) === Number(id)) {
            pacienteSeleccionado = null;
        }

        actualizarTodo();

        if (!pacienteSeleccionado) {
            document.getElementById("nombrePaciente").textContent = "Selecciona un paciente";
            document.getElementById("folioPaciente").textContent = "Folio —";

            const avatar = document.getElementById("avatarPaciente");
            avatar.textContent = "?";
            avatar.style.background = "#555b4f";

            document.getElementById("btnCitaPaciente").disabled = true;

            [
                "edadPaciente",
                "telefonoPaciente",
                "diagnosticoPaciente",
                "inicioPaciente",
                "estadoPaciente",
                "notasPaciente"
            ].forEach(id => {
                document.getElementById(id).textContent = "—";
            });

            document.getElementById("historialPaciente").innerHTML =
                "<p>Selecciona un paciente para consultar su historial.</p>";
        }

        alert("Paciente eliminado correctamente.");

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}



document.getElementById("btnNuevoPaciente").addEventListener("click", () => {
    const campos = `
        <div class="form-grid">
            ${campo("Nombre completo", "nombre", "text", { required: true })}
            ${campo("Fecha de nacimiento", "fechaNacimiento", "date")}
            ${campo("Teléfono", "telefono", "tel")}
            ${campoDiagnostico()}
            ${campo("Fecha de inicio", "fechaInicio", "date")}
            ${selector("Estado del paciente", "estado", [
        ["Activo", "Activo"],
        ["Inactivo", "Inactivo"]
    ])}
            <label class="wide">Notas clínicas
                <textarea name="notas" rows="3" placeholder="Antecedentes, observaciones u otra información"></textarea>
            </label>
        </div>

        <fieldset>
            <legend>Cita inicial (opcional)</legend>
            <div class="form-grid">
                ${campo("Fecha", "citaFecha", "date")}
                ${campo("Hora", "citaHora", "time")}
                ${campo("Tipo de cita", "citaTipo", "text", { placeholder: "Evaluación inicial" })}
            </div>
        </fieldset>

        <fieldset>
            <legend>Tratamiento (opcional)</legend>
            <div class="form-grid">
                ${campo("Nombre del tratamiento", "tratamiento")}
                ${campo("Sesiones", "sesiones", "text", { placeholder: "0 / 10" })}
            </div>
        </fieldset>
    `;

    abrirModal(
        "Nuevo paciente",
        "Completa la ficha; puedes incluir su cita inicial y tratamiento.",
        campos,
        async v => {
            const respuesta = await fetch("api/pacientes/guardar.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(v)
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok || !resultado.success) {
                throw new Error(resultado.mensaje || "No se pudo guardar el paciente.");
            }

            const id = Number(resultado.id);

            const paciente = {
                id,
                folio: `P-${String(id).padStart(4, "0")}`,
                nombre: v.nombre.trim(),
                fechaNacimiento: v.fechaNacimiento,
                edad: v.fechaNacimiento
                    ? Math.floor((new Date() - new Date(v.fechaNacimiento)) / 31557600000) + " años"
                    : "",
                telefono: v.telefono.trim(),
                diagnostico: v.diagnostico.trim(),
                fechaInicio: v.fechaInicio || hoyISO(),
                fechaRegistro: hoyISO(),
                estado: v.estado,
                notas: v.notas.trim(),
                historial: []
            };

            datos.pacientes.push(paciente);

            if (v.citaFecha && v.citaHora) {
                datos.citas.push({
                    id: siguienteId(),
                    pacienteId: id,
                    fecha: v.citaFecha,
                    hora: v.citaHora,
                    tipo: v.citaTipo.trim() || "Consulta",
                    estado: "Pendiente"
                });
            }

            if (v.tratamiento.trim()) {
                datos.tratamientos.push({
                    id: siguienteId(),
                    pacienteId: id,
                    nombre: v.tratamiento.trim(),
                    fechaInicio: hoyISO(),
                    sesiones: v.sesiones.trim(),
                    estado: "Activo"
                });
            }

            pacienteSeleccionado = id;
            actualizarTodo();
            mostrarFicha(id);
        }
    );
});



async function cambiarEstadoCita(id, estado) {
    const cita = datos.citas.find(c => Number(c.id) === Number(id));
    if (!cita) return;

    try {
        const respuesta = await fetch("api/citas/actualizar.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id, estado })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.success) {
            throw new Error(resultado.mensaje);
        }

        cita.estadoAnterior = cita.estado;
        cita.estado = estado;

        actualizarTodo();

    } catch (error) {
        console.error(error);
        alert(error.message || "No se pudo actualizar la cita.");
    }
}

async function restaurarCita(id) {
    const cita = datos.citas.find(c => Number(c.id) === Number(id));

    if (!cita || !["Cancelada", "Completada"].includes(cita.estado)) return;

    const estado = cita.estadoAnterior || "Pendiente";

    try {
        const respuesta = await fetch("api/citas/actualizar.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id, estado })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.success) {
            throw new Error(resultado.mensaje);
        }

        cita.estado = estado;
        delete cita.estadoAnterior;

        actualizarTodo();

    } catch (error) {
        console.error(error);
        alert(error.message || "No se pudo restaurar la cita.");
    }
}

function abrirFormularioCita(pacienteId = null) {
    const pacientes = listaPacientes();

    if (!pacientes.length) {
        return alert("Registra primero un paciente para poder asignar una cita.");
    }

    const iniciales = {
        fecha: hoyISO(),
        estado: "Pendiente"
    };

    if (pacienteId) {
        iniciales.pacienteId = String(pacienteId);
    }

    abrirModal(
        "Nueva cita",
        "Programa una cita para un paciente.",
        `
            <div class="form-grid">
                ${selector("Paciente", "pacienteId", pacientes)}
                ${campo("Fecha", "fecha", "date", { required: true, value: hoyISO() })}
                ${campo("Hora", "hora", "time", { required: true })}
                ${campo("Tipo de cita", "tipo", "text", {
            required: true,
            placeholder: "Consulta, seguimiento..."
        })}
                ${selector("Estado", "estado", [
            ["Pendiente", "Pendiente"],
            ["Confirmada", "Confirmada"],
            ["Completada", "Completada"],
            ["Cancelada", "Cancelada"]
        ])}
            </div>
        `,
        async v => {
            const respuesta = await fetch("api/citas/guardar.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(v)
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok || !resultado.success) {
                throw new Error(resultado.mensaje || "No se pudo registrar la cita.");
            }

            datos.citas.push({
                id: Number(resultado.id),
                pacienteId: Number(v.pacienteId),
                fecha: v.fecha,
                hora: v.hora,
                tipo: v.tipo.trim(),
                estado: v.estado
            });

            actualizarTodo();
        },
        iniciales
    );
}

document.getElementById("btnNuevaCita").addEventListener("click", () => abrirFormularioCita());

document.getElementById("btnCitaPaciente").addEventListener("click", () => {
    if (pacienteSeleccionado) {
        abrirFormularioCita(pacienteSeleccionado);
    }
});

/* TRATAMIENTOS */

document.getElementById("btnNuevoTratamiento").addEventListener("click", () => {
    const pacientes = listaPacientes();

    if (!pacientes.length) {
        return alert("Registra primero un paciente para poder asignar un tratamiento.");
    }

    abrirModal(
        "Nuevo tratamiento",
        "Agrega un tratamiento al expediente del paciente.",
        `
            <div class="form-grid">
                ${selector("Paciente", "pacienteId", pacientes)}
                ${campo("Tratamiento", "nombre", "text", { required: true })}
                ${campo("Fecha de inicio", "fechaInicio", "date", {
            required: true,
            value: hoyISO()
        })}
                ${campo("Sesiones realizadas / totales", "sesiones", "text", {
            placeholder: "0 / 10"
        })}
                ${selector("Estado", "estado", [
            ["Activo", "Activo"],
            ["Finalizado", "Finalizado"],
            ["Pausado", "Pausado"]
        ])}
            </div>
        `,
        v => {
            datos.tratamientos.push({
                id: siguienteId(),
                pacienteId: Number(v.pacienteId),
                nombre: v.nombre.trim(),
                fechaInicio: v.fechaInicio,
                sesiones: v.sesiones.trim(),
                estado: v.estado
            });

            actualizarTodo();
        }
    );
});



document.getElementById("btnNuevoCaso").addEventListener("click", nuevoCaso);

document.getElementById("buscarCaso").addEventListener("input", e => {
    renderCasos(e.target.value);
});



document.getElementById("buscarPaciente").addEventListener("input", e => {
    renderPacientes(e.target.value);
});

document.querySelectorAll(".menu-item").forEach(b => {
    b.addEventListener("click", () => {
        document.querySelectorAll(".menu-item").forEach(x => {
            x.classList.toggle("active", x === b);
        });

        document.querySelectorAll(".section").forEach(s => {
            s.classList.toggle("active", s.id === b.dataset.section);
        });

        document.querySelector(".app").classList.toggle(
            "home-view",
            b.dataset.section === "inicio"
        );
    });
});



actualizarTodo();

cargarPacientesBD().then(() => {
    cargarCitasBD();
});