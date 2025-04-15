<?php
return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    */

    'paths' => ['*'],

    'allowed_methods' => ['*'], // Permitir todos los métodos (GET, POST, etc.)

    'allowed_origins' => ['*'], // Permitir todas las URLs de origen

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'], // Permitir todos los encabezados

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
