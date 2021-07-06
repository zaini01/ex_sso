const qs = require("qs");
const axios = require("axios");
const Cryptr = require("cryptr");
const cryptr = new Cryptr("meinDreckigesKleinesGeheimnis");
const { keycloakHost, dataAdmin_cli, realms } = require("../../src/config");

class Controller {
  static async getTokenMaster(req) {
    try {
      let { data } = await axios({
        method: "post",
        url: `${keycloakHost}/auth/realms/master/protocol/openid-connect/token`,
        data: qs.stringify(dataAdmin_cli),
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      });

      return data.access_token;
    } catch (err) {
      return { error: err };
    }
  }

  static async getUserKeycloak(req, res, next, tokenMaster) {
    const email = req.body.username;

    if (email == "")
      return {
        error: {
          response: {
            status: 400,
            data: {
              error: "bad_request",
              error_description: "Invalid email format",
            },
          },
        },
      };

    try {
      const { data } = await axios({
        method: "get",
        url: `${keycloakHost}/auth/admin/realms/${realms}/users?email=${email}`,
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${tokenMaster}`,
        },
      });

      return data;
    } catch (err) {
      return { error: err };
    }
  }

  static async getUserRsk(req) {
    let body = {
      username: req.body.username,
      password: req.body.password,
    };

    try {
      let { data } = await axios.post(
        "https://app.rumahsiapkerja.com/rsk-backend/v1/auth/login",
        body
      );

      return data;
    } catch (err) {
      return { error: err };
    }
  }

  static async getClientSecret(req, res, next, client_id, tokenMaster) {
    try {
      let { data } = await axios({
        method: "get",
        url: `${keycloakHost}/auth/admin/realms/${realms}/clients?clientId=${client_id}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenMaster}`,
        },
      });

      let id;
      if (data.length > 0) {
        id = data[0].id;
      } else {
        return {
          response: {
            status: 404,
            data: {
              error: "not_found",
              error_description: "client id not found",
            },
          },
        };
      }

      let client_secret = await axios({
        method: "get",
        url: `${keycloakHost}/auth/admin/realms/${realms}/clients/${id}/client-secret`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenMaster}`,
        },
      });

      return client_secret.data.value;
    } catch (err) {
      return { error: err };
    }
  }

  static async signIn(req, res, next) {
    const tokenMaster = await Controller.getTokenMaster(req, res, next);
    if (tokenMaster.error) return next(tokenMaster.error);

    const userKeycloak = await Controller.getUserKeycloak(
      req,
      res,
      next,
      tokenMaster
    );

    if (userKeycloak.error) return next(userKeycloak.error);

    if (!userKeycloak[0]) {
      const userRsk = await Controller.getUserRsk(req, res, next);
      if (userRsk.error) return next(userRsk.error);

      if (userRsk) {
        const dataUser = {
          client_id: req.body.client_id,
          firstName: userRsk.data.firstName,
          lastName: userRsk.data.lastName,
          username: userRsk.data.username,
          email: userRsk.data.email,
          password: req.body.password,
          phoneNumber: userRsk.data.mobilePhone,
          client_id: req.body.client_id,
        };
        req.body = dataUser;

        return Controller.register(req, res, next);
      }
    }

    let client_id = req.body.client_id;

    if (!client_id)
      return next({
        response: {
          status: 404,
          data: {
            error: "not_found",
            error_description: "client id not found",
          },
        },
      });

    let client_secret = await Controller.getClientSecret(
      req,
      res,
      next,
      client_id,
      tokenMaster
    );
    if (client_secret.error) return next(client_secret.error);

    let dataLogin = {
      grant_type: "password",
      client_id: client_id,
      client_secret: client_secret,
      username: req.body.username,
      password: req.body.password,
    };

    try {
      let { data } = await axios({
        method: "post",
        url: `${keycloakHost}/auth/realms/${realms}/protocol/openid-connect/token`,
        data: qs.stringify(dataLogin),
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      });

      let encrypt = cryptr.encrypt(data.refresh_token);

      return res.status(200).json({ code: encrypt });
    } catch (err) {
      return next(err);
    }
  }

  static async register(req, res, next) {
    let client_id = req.body.client_id;

    if (!client_id)
      return next({
        response: {
          status: 404,
          data: {
            error: "not_found",
            error_description: "client id not found",
          },
        },
      });

    let tokenMaster = await Controller.getTokenMaster(req, res, next);
    if (tokenMaster.error) return next(tokenMaster.error);

    let client_secret = await Controller.getClientSecret(
      req,
      res,
      next,
      client_id,
      tokenMaster
    );
    if (client_secret.error) return next(client_secret.error);

    let dataUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      email: req.body.email,
      enabled: "true",
      credentials: [
        {
          type: "password",
          value: req.body.password,
          temporary: false,
        },
      ],
      attributes: { phoneNumber: req.body.phoneNumber },
    };

    let dataLogin = {
      grant_type: "password",
      client_id: client_id,
      client_secret: client_secret,
      username: req.body.email,
      password: req.body.password,
    };

    try {
      await axios({
        method: "post",
        url: `${keycloakHost}/auth/admin/realms/${realms}/users`,
        data: JSON.stringify(dataUser),
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${tokenMaster}`,
        },
      });

      let { data } = await axios({
        method: "post",
        url: `${keycloakHost}/auth/realms/${realms}/protocol/openid-connect/token`,
        data: qs.stringify(dataLogin),
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      });

      let encrypt = cryptr.encrypt(data.refresh_token);

      return res.status(200).json({ code: encrypt });
    } catch (err) {
      return next(err);
    }
  }

  static async exchangeToken(req, res, next) {
    let client_id = req.body.client_id;

    if (!client_id)
      return next({
        response: {
          status: 404,
          data: {
            error: "not_found",
            error_description: "client id not found",
          },
        },
      });

    let tokenMaster = await Controller.getTokenMaster(req, res, next);
    if (tokenMaster.error) return next(tokenMaster.error);

    let client_secret = await Controller.getClientSecret(
      req,
      res,
      next,
      client_id,
      tokenMaster
    );

    if (client_secret.error) return next(client_secret.error);

    let body = {
      client_id: client_id,
      client_secret: client_secret,
      grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
      subject_token_type: "urn:ietf:params:oauth:token-type:access_token",
      requested_token_type: "urn:ietf:params:oauth:token-type:refresh_token",
      subject_token: req.body.access_token,
      subject_issuer: "google",
    };

    try {
      let { data } = await axios({
        method: "post",
        url: `${keycloakHost}/auth/realms/${realms}/protocol/openid-connect/token`,
        data: qs.stringify(body),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      let encrypt = cryptr.encrypt(data.refresh_token);

      return res.status(200).json({ code: encrypt });
    } catch (err) {
      return next(err);
    }
  }

  static async forgotPassword(req, res, next) {
    const email = req.body.username;

    if (email == "")
      return {
        error: {
          response: {
            status: 400,
            data: {
              error: "bad_request",
              error_description: "Invalid email format",
            },
          },
        },
      };

    let tokenMaster = await Controller.getTokenMaster(req, res, next);
    if (tokenMaster.error) return next(tokenMaster.error);

    try {
      let { data } = await axios({
        method: "get",
        url: `${keycloakHost}/auth/admin/realms/${realms}/users?email=${email}`,
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${tokenMaster}`,
        },
      });

      let id;
      if (data.length > 0) {
        id = data[0].id;
      } else {
        return {
          response: {
            status: 404,
            data: { error: "not_found", error_description: "email not found" },
          },
        };
      }

      await axios({
        method: "put",
        url: `${keycloakHost}/auth/admin/realms/${realms}/users/${id}/execute-actions-email`,
        data: '["UPDATE_PASSWORD"]',
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${tokenMaster}`,
        },
      });

      return res.status(200).json({ message: "email sent" });
    } catch (err) {
      return next(err);
    }
  }

  static async checkSession(req, res, next) {
    try {
      const { data } = await axios({
        method: "get",
        url: `${keycloakHost}/auth/realms/${realms}/protocol/openid-connect/userinfo`,
        headers: {
          Authorization: `Bearer ${req.body.access_token}`,
        },
      });

      return res.status(200).json(data);
    } catch (err) {
      return next(err);
    }
  }

  static async exchangeCode(req, res, next) {
    let client_id = req.body.client_id;

    if (!client_id)
      return next({
        response: {
          status: 404,
          data: {
            error: "not_found",
            error_description: "client id not found",
          },
        },
      });

    let tokenMaster = await Controller.getTokenMaster(req, res, next);
    if (tokenMaster.error) return next(tokenMaster.error);

    let client_secret = await Controller.getClientSecret(
      req,
      res,
      next,
      client_id,
      tokenMaster
    );

    if (client_secret.error) return next(client_secret.error);

    try {
      let decrypt = cryptr.decrypt(req.body.code);

      let payload = {
        client_id: client_id,
        client_secret: client_secret,
        grant_type: "refresh_token",
        refresh_token: decrypt,
      };

      let { data } = await axios({
        method: "post",
        url: `${keycloakHost}/auth/realms/${realms}/protocol/openid-connect/token`,
        data: qs.stringify(payload),
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      });

      return res.status(200).json(data);
    } catch (err) {
      return next(err);
    }
  }

  static async refreshToken(req, res, next) {
    let client_id = req.body.client_id;

    if (!client_id)
      return next({
        response: {
          status: 404,
          data: {
            error: "not_found",
            error_description: "client id not found",
          },
        },
      });

    let tokenMaster = await Controller.getTokenMaster(req, res, next);
    if (tokenMaster.error) return next(tokenMaster.error);

    let client_secret = await Controller.getClientSecret(
      req,
      res,
      next,
      client_id,
      tokenMaster
    );

    if (client_secret.error) return next(client_secret.error);

    try {
      let payload = {
        client_id: client_id,
        client_secret: client_secret,
        grant_type: "refresh_token",
        refresh_token: req.body.refresh_token,
      };

      let { data } = await axios({
        method: "post",
        url: `${keycloakHost}/auth/realms/${realms}/protocol/openid-connect/token`,
        data: qs.stringify(payload),
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      });

      return res.status(200).json(data);
    } catch (err) {
      return next(err);
    }
  }

  static async signOut(req, res, next) {
    let client_id = req.body.client_id;

    if (!client_id)
      return next({
        response: {
          status: 404,
          data: {
            error: "not_found",
            error_description: "client id not found",
          },
        },
      });

    let tokenMaster = await Controller.getTokenMaster(req, res, next);
    if (tokenMaster.error) return next(tokenMaster.error);

    let client_secret = await Controller.getClientSecret(
      req,
      res,
      next,
      client_id,
      tokenMaster
    );

    if (client_secret.error) return next(client_secret.error);

    try {
      await axios({
        method: "post",
        url: `${keycloakHost}/auth/realms/${realms}/protocol/openid-connect/logout`,
        data: qs.stringify({
          client_id: client_id,
          refresh_token: req.body.refresh_token,
          client_secret: client_secret,
        }),
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=utf-8",
          authorization: `Bearer ${req.body.access_token}`,
        },
      });

      res.status(200).json({ message: "sign out success" });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = Controller;
