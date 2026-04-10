# Mapeo: PDF V002-2026 → app web (`src/lib/kyb-steps.ts`)

**Documento fuente:** *FORMULARIO PERFIL DEL CLIENTE PJ – PUNTO PAGO PANAMÁ V2-2026* (4 páginas).

Orden de pasos **igual al flujo del impreso** (incluye intro legal + campo iniciales). Cada paso tiene `pdfPage` para ubicar la sección en el PDF.

| Orden | Paso (`step.id`) | Sección PDF | Notas |
|------:|-------------------|-------------|--------|
| 1 | `intro_formulario` | Encabezado pág. 1 | Textos legales + regla N/A + iniciales |
| 2 | `como_conocio` | INDIQUE COMO CONOCIÓ… | Checkboxes + Otro |
| 3 | `identificacion_cliente` | IDENTIFICACIÓN DEL CLIENTE | |
| 4 | `datos_generales` | DATOS GENERALES | |
| 5 | `junta_directiva` | GOBIERNO CORPORATIVO / JUNTA… | 5 filas |
| 6 | `representante_legal` | REPRESENTANTE LEGAL O APODERADO | Pregunta investigación texto largo |
| 7 | `beneficiarios_finales` | ACCIONISTAS O BENEFICIARIO FINAL | Párrafo definición + 3 filas |
| 8 | `perfil_financiero` | PERFIL FINANCIERO | |
| 9 | `referencias` | REFERENCIAS | |
| 10 | `producto_medios_pago` | DOCUMENTOS PARA ENTREGAR (pág. 3) | Medios de pago + préstamo |
| 11 | `pep` | PEP | Definición + pregunta + datos |
| 12 | `documentacion_entregar` | DOCUMENTOS PARA ENTREGAR (pág. 4) | Checklist anexos + observaciones |
| 13 | `declaracion` | FIRMA Y DECLARACIÓN DEL CLIENTE | Texto legal completo |

**No en app (uso interno PDF):** bloque *SOLO PARA USO DE GRUPO PUNTO PAGO*.

## Próximos pasos

- Generación de PDF rellenado a partir de los mismos `id` de campo.
- Subida de archivos por ítem de checklist.
- Firma electrónica.
