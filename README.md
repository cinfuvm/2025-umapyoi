# Plantilla para Proyectos en TIC-80  

Este repositorio contiene una plantilla diseñada para desarrollar juegos en TIC-80 de manera modular y organizada. Permite integrar recursos gráficos, sonidos, y lógica del juego de forma sencilla, utilizando un Makefile para automatizar la construcción del archivo final.  

## Características  
- **Código Modular**: Archivos organizados para facilitar la legibilidad y la escalabilidad del proyecto.  
- **Automatización**: El Makefile combina todos los recursos y el código en un único archivo (`main_build.js`) listo para TIC-80.  
- **Compatibilidad**: Incluye soporte para tiles, sonidos, paletas y otros recursos nativos de TIC-80.  

## Estructura del Proyecto  

```plaintext
proyecto_tic80/
├── header.js        # Archivo inicial con configuraciones globales
├── main.js          # Lógica principal del juego
├── footer.js        # Configuraciones finales y recursos multimedia
├── classes/         # Módulos del juego
│   ├── jugador.js   # Lógica del jugador
│   ├── escena.js    # Manejo de escenas
│   └── entorno.js   # Configuración del entorno
└── Makefile         # Script para construir y ejecutar el proyecto
```  

## Uso  
1. Escribe o modifica el código en los archivos y módulos existentes.  
2. Ejecuta `make` en la terminal para generar el archivo `main_build.js`.  
3. El archivo generado se ejecutará automáticamente en TIC-80.  
