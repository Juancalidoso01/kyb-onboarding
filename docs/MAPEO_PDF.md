# Mapeo: PDF V002-2026 → app web (`kyb-steps.ts`)

**Documento fuente:** *FORMULARIO PERFIL DEL CLIENTE PJ – PUNTO PAGO PANAMÁ V2-2026* (4 páginas).

| Sección PDF | Paso en app (`step.id`) | Notas |
|-------------|-------------------------|--------|
| Cómo conoció a la empresa | `como_conocio` | Casillas → checkboxes + texto «Otro» |
| Identificación del cliente | `identificacion_cliente` | Razón social/comercial, PJ, operativa, sociedad, actividad, bolsa, capital, fechas, países, ID tributaria, doc. identidad, contacto |
| Datos generales | `datos_generales` | Dirección comercial, país/ciudad/provincia, auxiliar, teléfonos, email |
| Junta / consejo (hasta 5) | `junta_directiva` | Por fila: cargo, nombre, apellidos, nacionalidad, ID, dirección |
| Representante legal / apoderado | `representante_legal` | Incluye pregunta de investigaciones + explicación |
| Accionistas / beneficiario final (hasta 3) | `beneficiarios_finales` | Tipo N/J, fechas, participación, dirección |
| Perfil financiero | `perfil_financiero` | Declaración origen lícito + ingresos USD |
| Referencias | `referencias` | Tipo + datos de contacto + pregunta investigación |
| Medios de pago / préstamo | `producto_medios_pago` | Casillas ACH etc., motivo, frecuencia, monto anual, tipo préstamo |
| PEP | `pep` | Pregunta principal + bloque datos si aplica |
| Documentación a entregar | `documentacion_entregar` | Checklist + observaciones |
| Declaración del cliente | `declaracion` | Nombre y fecha (firma digital pendiente) |

**No incluido en el flujo del cliente (uso interno en el PDF):** bloque *Solo para uso de Grupo Punto Pago* — conclusiones de verificación, revisado por, enlace.

## Próximos pasos

- Subida de PDFs / imágenes por ítem del checklist.
- Firma electrónica o captura de aceptación de declaración.
- Validaciones por campo (formato fechas, RUC, etc.).
