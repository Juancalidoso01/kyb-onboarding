# Mapeo: PDF V002-2026 → app web (`src/lib/kyb-steps.ts`)

**Documento fuente:** *FORMULARIO PERFIL DEL CLIENTE PJ – PUNTO PAGO PANAMÁ V2-2026* (4 páginas).

Orden de pasos **alineado al impreso**; el paso `bienvenida` es solo web (textos legales + PEP) y no existe como página aparte en el PDF. Cada paso tiene `pdfPage` cuando aplica.

| Orden | Paso (`step.id`) | Sección PDF | Notas |
|------:|-------------------|-------------|--------|
| 1 | `bienvenida` | — | Solo UI: objetivo, marco legal, N/A, definición PEP (`variant: welcome`) |
| 2 | `intro_formulario` | Encabezado pág. 1 | Iniciales (textos legales en bienvenida) |
| 3 | `como_conocio` | INDIQUE COMO CONOCIÓ… | Checkboxes + Otro |
| 4 | `identificacion_cliente` | IDENTIFICACIÓN DEL CLIENTE | |
| 5 | `datos_generales` | DATOS GENERALES | |
| 6 | `junta_directiva` | GOBIERNO CORPORATIVO / JUNTA… | 5 filas |
| 7 | `representante_legal` | REPRESENTANTE LEGAL O APODERADO | Pregunta investigación texto largo |
| 8 | `beneficiarios_finales` | ACCIONISTAS O BENEFICIARIO FINAL | Párrafo definición + 3 filas |
| 9 | `perfil_financiero` | PERFIL FINANCIERO | |
| 10 | `referencias` | REFERENCIAS | |
| 11 | `producto_medios_pago` | DOCUMENTOS PARA ENTREGAR (pág. 3) | Medios de pago + préstamo |
| 12 | `pep` | PEP | Definición + pregunta + datos |
| 13 | `documentacion_entregar` | DOCUMENTOS PARA ENTREGAR (pág. 4) | Checklist anexos + observaciones |
| 14 | `declaracion` | FIRMA Y DECLARACIÓN DEL CLIENTE | Texto legal completo |

**No en app (uso interno PDF):** bloque *SOLO PARA USO DE GRUPO PUNTO PAGO*.

## Próximos pasos

- Generación de PDF rellenado a partir de los mismos `id` de campo.
- Subida de archivos por ítem de checklist.
- Firma electrónica.
