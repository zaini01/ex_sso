const config = {
  keycloakHost: "http://keycloak:8080",
  serverHost: "",
  dataAdmin_cli: {
    client_secret: "2fcdafd8-b82e-4c12-8614-7a42b82c31a9",
    grant_type: "client_credentials",
    client_id: "admin-cli",
  },
  port: 8000,
  realms: "RSK-SSO",
};

module.exports = config;
