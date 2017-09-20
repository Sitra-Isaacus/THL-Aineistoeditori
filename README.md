# Development

Development instructions are written mainly for macOS but are applicable to
other environments as well.

## Starting API module

Install Oracle JDK 8 (if not already installed). You can download it on Oracle's
website.

Install Maven 3.3 or newer (if not already installed): `brew install maven`

Configure server properties:

    <nano/vim/emacs> server/application.properties
    Enter the correct values for the following properties:
    - termed.apiUrl=http://qa-wwwapp6a.thl.fi:8580/termed/api
    - termed.username=<termed-username-for-api-calls>
    - termed.password=<termed-password-for-api-calls>
    - termed.graphId=<current-termed-dtkk-graph-id>
    - server.port=8680
    - users.properties.resource=<users-file-location-as-spring-resource>
    - sso.url=<THL SSO api url>
    - sso.application=aineistoeditori<-qa>
    - sso.secretKey=<secret key, obtainable from THL SSO admin user interfce>
    Save the file and exit the editor.

Add users to user properties file you configured above. See
`src/main/resources/users.properties` for example. Note 1: The application
will start without any configured users but credentials are required if you
want to access the editor. Note 2: Users file must be UTF-8 encoded.

Run dev server:

    cd server
    mvn spring-boot:run -Dskip.npm=true

Omit the `-Dskip.npm=true` on first start so that Node and npm packages get
installed by frontend-maven-plugin.

API can be accessed via `http://localhost:8680/api/v2/datasets/`.

## Starting UI module

Note. API module must be started before starting UI module.

Install NodeJS (if not already installed): `brew install node`

Install Angular CLI (if not already installed): `npm install -g @angular/cli`

Run dev server:

    cd client
    npm start

UI can be accessed via `http://localhost:8082/`. Changes to source files will
cause an automatic reload in your browser.

## Transforming XML files from outside schemas to internal schema

Transformation requires a specific XSLT file for the inbound format. Also, a working xalan installation is needed for the task. You can download it from: http://www.apache.org/dyn/closer.cgi/xml/xalan-j

Usage:

    java -jar <path-to-xalan-jar>/xalan.jar -IN <inbound file> -XSL <xsl template file> -OUT <resulting xml file>

Implemented transformations:

    Tilastokeskus format: TilastokeskusToAineistokatalogi.xsl
