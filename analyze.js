const fs = require("fs");
const path = require("path");

// Funciones a analizar del filesHelper
const functionsToAnalyze = [
  "filePathToPublicUrl",
  "esperarDescargaArchivo",
  "moverYRenombrarArchivo",
  "createNewPath",
  "currentPath",
  "getPath",
  "getPathFolderCotizaciones",
  "obtenerPathArchivo",
  "descomprimirArchivoPoliza",
  "obtenerArchivosEnCarpeta",
  "eliminarArchivo",
  "mergePDFConPortada",
  "archivoExiste",
];

// Función para buscar recursivamente en archivos
function searchInDirectory(dirPath, results = {}) {
  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      // Ignorar directorios específicos
      if (stats.isDirectory()) {
        if (["node_modules", ".git", ".next", "dist", "build"].includes(item)) {
          continue;
        }
        searchInDirectory(itemPath, results);
      }
      // Solo buscar en archivos JavaScript/TypeScript
      else if (stats.isFile() && /\.(js|jsx|ts|tsx|mjs)$/.test(item)) {
        analyzeFile(itemPath, results);
      }
    }
  } catch (error) {
    // Ignorar errores de permisos
  }

  return results;
}

// Función para analizar un archivo específico
function analyzeFile(filePath, results) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const relativePath = path.relative(process.cwd(), filePath);

    // ✅ FILTROS MEJORADOS - Ignorar archivos filesHelper
    if (relativePath.includes("filesHelper")) {
      return;
    }

    functionsToAnalyze.forEach((funcName) => {
      if (!results[funcName]) {
        results[funcName] = [];
      }

      // ✅ BUSCAR LÍNEAS ÚNICAS - Evitar duplicados
      const lines = content.split("\n");
      const matchedLines = new Set(); // Usar Set para evitar duplicados
      const matchDetails = [];

      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const trimmedLine = line.trim();

        // ✅ PATRONES MÁS ESPECÍFICOS - Solo llamadas a función
        const patterns = [
          // Llamada directa: functionName(
          new RegExp(`\\b${funcName}\\s*\\(`),
          // Llamada con await: await functionName(
          new RegExp(`await\\s+${funcName}\\s*\\(`),
          // Asignación: = functionName(
          new RegExp(`=\\s*${funcName}\\s*\\(`),
        ];

        const isMatch = patterns.some((pattern) => pattern.test(line));

        if (isMatch) {
          // ✅ NO incluir definiciones de funciones (function functionName)
          if (
            !line.includes(`function ${funcName}`) &&
            !line.includes(`async function ${funcName}`)
          ) {
            matchedLines.add(lineNumber);
            matchDetails.push({
              line: lineNumber,
              context:
                trimmedLine.substring(0, 80) +
                (trimmedLine.length > 80 ? "..." : ""),
            });
          }
        }
      });

      if (matchedLines.size > 0) {
        const existingFile = results[funcName].find(
          (f) => f.file === relativePath
        );
        if (existingFile) {
          // Combinar líneas únicas
          existingFile.lines = [
            ...new Set([...existingFile.lines, ...Array.from(matchedLines)]),
          ];
          existingFile.count = existingFile.lines.length;
          existingFile.details.push(...matchDetails);
        } else {
          results[funcName].push({
            file: relativePath,
            count: matchedLines.size,
            lines: Array.from(matchedLines).sort((a, b) => a - b),
            details: matchDetails,
          });
        }
      }
    });
  } catch (error) {
    // Ignorar errores de lectura
  }
}

// Función para generar reporte
function generateReport(results) {
  console.log("🔍 ANÁLISIS DE LLAMADAS A FUNCIONES FILESHELPER");
  console.log("(Excluyendo archivos filesHelper y definiciones de función)");
  console.log("=".repeat(70));

  const usedFunctions = [];
  const unusedFunctions = [];
  let totalUsages = 0;

  functionsToAnalyze.forEach((funcName) => {
    console.log(`\n📍 ${funcName}:`);

    if (results[funcName] && results[funcName].length > 0) {
      let funcTotalUsages = 0;

      results[funcName].forEach((usage) => {
        console.log(`   📁 ${usage.file} (${usage.count} llamadas)`);

        // Mostrar líneas donde se usa
        if (usage.lines && usage.lines.length > 0) {
          console.log(`      📍 Líneas: ${usage.lines.join(", ")}`);
        }

        // Mostrar contexto de cada línea
        if (usage.details && usage.details.length > 0) {
          // Mostrar máximo 3 ejemplos para no saturar
          usage.details.slice(0, 3).forEach((detail) => {
            console.log(`      💡 L${detail.line}: ${detail.context}`);
          });

          if (usage.details.length > 3) {
            console.log(`      ... y ${usage.details.length - 3} más`);
          }
        }

        funcTotalUsages += usage.count;
      });

      console.log(
        `   ✅ Total: ${funcTotalUsages} llamadas en ${results[funcName].length} archivos`
      );
      usedFunctions.push({
        name: funcName,
        totalUsages: funcTotalUsages,
        filesCount: results[funcName].length,
        files: results[funcName],
      });
      totalUsages += funcTotalUsages;
    } else {
      console.log(`   ❌ No se encontraron llamadas a esta función`);
      unusedFunctions.push(funcName);
    }
  });

  // Resumen final
  console.log("\n" + "=".repeat(70));
  console.log("📊 RESUMEN EJECUTIVO:");
  console.log(
    `✅ Funciones llamadas: ${usedFunctions.length}/${functionsToAnalyze.length}`
  );
  console.log(
    `❌ Funciones nunca llamadas: ${unusedFunctions.length}/${functionsToAnalyze.length}`
  );
  console.log(`📈 Total de llamadas encontradas: ${totalUsages}`);

  // Ranking de funciones más usadas
  if (usedFunctions.length > 0) {
    console.log("\n🏆 FUNCIONES MÁS LLAMADAS:");
    usedFunctions
      .sort((a, b) => b.totalUsages - a.totalUsages)
      .forEach((func, index) => {
        console.log(
          `   ${index + 1}. ${func.name}: ${func.totalUsages} llamadas en ${
            func.filesCount
          } archivos`
        );
      });
  }

  // Funciones candidatas a eliminar
  if (unusedFunctions.length > 0) {
    console.log("\n🗑️  FUNCIONES SIN USAR (candidatas a eliminar):");
    unusedFunctions.forEach((func) => {
      console.log(`   ❌ ${func}`);
    });

    console.log("\n💡 FUNCIONES A ELIMINAR DEL module.exports:");
    unusedFunctions.forEach((func) => {
      console.log(`  ${func},`);
    });
  }

  return {
    usedFunctions,
    unusedFunctions,
    totalUsages,
    totalFunctions: functionsToAnalyze.length,
  };
}

// Función principal
function main() {
  console.log("🚀 Analizando SOLO llamadas a funciones (sin duplicados)...\n");

  const startTime = Date.now();
  const results = searchInDirectory(process.cwd());
  const endTime = Date.now();

  const report = generateReport(results);

  console.log(`\n⏱️  Análisis completado en ${endTime - startTime}ms`);

  // Guardar reporte en archivo
  const reportData = {
    timestamp: new Date().toISOString(),
    duration: endTime - startTime,
    analysisType: "function_calls_only_no_duplicates",
    summary: report,
    details: results,
  };

  try {
    fs.writeFileSync(
      "function-calls-clean-report.json",
      JSON.stringify(reportData, null, 2)
    );
    console.log(
      "💾 Reporte detallado guardado en: function-calls-clean-report.json"
    );
  } catch (error) {
    console.log("⚠️  No se pudo guardar el reporte:", error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { main, searchInDirectory, generateReport };
