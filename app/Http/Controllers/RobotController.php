<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Facebook\WebDriver\Remote\RemoteWebDriver;
use Facebook\WebDriver\Remote\DesiredCapabilities;
use Illuminate\Support\Facades\Log;
use Facebook\WebDriver\WebDriverBy;

class RobotController extends Controller
{
    public function startRobot(Request $request)
    {
        try {
            $data = $request->all();

            // Convertir los datos a formato JSON
            $jsonData = json_encode($data);
            // Ruta al script de Python
            $scriptPath = base_path('app/scripts/selenium_script.py');

            // Ejecutar el script de Python con los datos como parámetro
            $command = "python3 $scriptPath --data " . escapeshellarg($jsonData);
            $output = shell_exec($command);

            return response()->json([
                'success' => true,
                'message' => 'Script ejecutado correctamente',
                'output' => $output,
            ]);
        } catch (\Exception $e) {
            // Manejar errores
            Log::error("Error al ejecutar el script de Selenium: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al ejecutar el script de Selenium',
                'error' => $e->getMessage(),
            ]);
        }
    }
}
