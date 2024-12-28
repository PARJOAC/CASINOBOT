# Casino Bot - Guía de Configuración

## Descripción del Bot

Este bot de casino para Discord permite a los usuarios participar en diversos juegos de azar dentro de un servidor de Discord. Está desarrollado en JavaScript utilizando la librería `discord.js` y se conecta a una base de datos MongoDB para almacenar información relevante.

## Requisitos Previos

Antes de configurar el bot, asegúrate de tener instalados los siguientes componentes:

- **Node.js**: Versión 14 o superior.
- **npm**: Administrador de paquetes de Node.js.
- **MongoDB**: Una instancia de MongoDB en funcionamiento para almacenar los datos del bot.

## Instalación

Sigue estos pasos para instalar y configurar el bot:

### 1. Clona el repositorio

```bash
git clone https://github.com/PARJOAC/CASINOBOT.git
```

### 2. Navega al directorio del bot

```bash
cd CASINOBOT
```

### 3. Instala las dependencias

```bash
npm install
```

### 4. Configura las variables de entorno

Crea un archivo `.env` en la raíz del proyecto y define las siguientes variables:

```env
BOT_ID=tu_bot_id
BOT_TOKEN=tu_bot_token
GUILD_ID=tu_guild_id
MONGODB=tu_uri_de_mongodb
LOG_CHANNEL_GUILD_ADD=id_canal_log_guild_add
LOG_CHANNEL_GUILD_DELETE=id_canal_log_guild_delete
LOG_CHANNEL_SUGGESTIONS=id_canal_log_sugerencias
GAMES_LOG_CHANNEL_ID=id_canal_log_juegos
VOTES_LOG_CHANNEL_ID=id_canal_log_votos
COMMANDS_LOG_CHANNEL_ID=id_canal_log_comandos
VOICE_CHANNEL_MUSIC=id_canal_voz_musica
TOPGG_API_TOKEN=tu_topgg_api_token
```

#### **Cómo obtener los valores necesarios:**

- **BOT_ID**: Ve al [portal de desarrolladores de Discord](https://discord.com/developers/applications), selecciona tu aplicación y copia el ID.
- **BOT_TOKEN**: En el mismo portal, dirígete a la sección "Bot" de tu aplicación, crea un bot (si no lo has hecho) y copia el token de acceso.
- **GUILD_ID**: Abre Discord, haz clic derecho sobre el nombre de tu servidor y selecciona "Copiar ID" (necesitas habilitar el "Modo de desarrollador" en la configuración de Discord si no ves esta opción).
- **MONGODB**: Crea una base de datos en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) o usa una instancia local. Copia el URI de conexión que proporciona MongoDB.
- **LOG_CHANNEL_GUILD_ADD**, **LOG_CHANNEL_GUILD_DELETE**, **LOG_CHANNEL_SUGGESTIONS**, **GAMES_LOG_CHANNEL_ID**, **VOTES_LOG_CHANNEL_ID**, **COMMANDS_LOG_CHANNEL_ID**, **VOICE_CHANNEL_MUSIC**: En Discord, haz clic derecho sobre el canal deseado y selecciona "Copiar ID".
- **TOPGG_API_TOKEN**: Si planeas usar integraciones con [top.gg](https://top.gg/), regístrate y genera un token de API en tu panel de usuario.

Asegúrte de reemplazar cada valor con la información correspondiente a tu configuración.

### 5. Inicia el bot

```bash
node index.js
```

## Uso

Una vez que el bot esté en funcionamiento y agregado a tu servidor de Discord, los usuarios podrán interactuar con él mediante comandos específicos para participar en los juegos de casino disponibles.

## Notas Adicionales

- Mantén tus tokens y URI de MongoDB seguros y no los compartas públicamente.
- Revisa la documentación oficial de `discord.js` para comprender mejor cómo funciona la interacción con la API de Discord.
- Si encuentras problemas o errores, verifica los registros en los canales de log configurados para obtener más información.

Para más detalles y actualizaciones, visita el repositorio oficial del proyecto: [https://github.com/PARJOAC/CASINOBOT](https://github.com/PARJOAC/CASINOBOT).