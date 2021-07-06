const qs = require("qs");
const { Client } = require("pg");
const axios = require("axios");

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "rsk",
  password: "postgres",
  port: 5432,
});
client.connect();

let total = 0;
let length;

let query = `SELECT COUNT(*) FROM users`;
client
  .query(query)
  .then((res) => {
    // length = res.rows[0].count;
    length = 2;
    fetching(length);
  })
  .catch((e) => console.error(e.stack));

function fetching(length) {
  let limit = 2;
  for (let i = 0; i < length; i += limit) {
    let query = `SELECT * FROM users LIMIT ${limit} OFFSET ${i}`;
    client
      .query(query)
      .then((res) => {
        seeding(res.rows);
      })
      .catch((e) => console.error(e.stack));
  }
}

function seeding(users) {
  for (let i = 0; i < users.length; i++) {
    submit(users[i]);
    total++;
    if (total == length) {
      client.end();
    }
  }
}

function submit(user) {
  let token;
  let userName = user.full_name.split(" ");
  let dataMaster = {
    client_secret: "29e4b11a-d484-4b47-ac31-b3cd8a060838",
    grant_type: "client_credentials",
    client_id: "admin-cli",
  };

  let body = {
    firstName: userName[0],
    lastName: userName[userName.length - 1],
    username: user.full_name,
    email: user.email,
    enabled: "true",
    credentials: [
      {
        type: "password",
        value: user.password_hash,
        temporary: false,
      },
    ],
    attributes: { phoneNumber: user.mobile_phone },
  };

  axios({
    method: "post",
    url:
      "http://keycloak:8080/auth/realms/master/protocol/openid-connect/token",
    data: qs.stringify(dataMaster),
    headers: {
      "content-type": "application/x-www-form-urlencoded;charset=utf-8",
    },
  })
    .then(({ data }) => {
      token = data.access_token;
      return axios({
        method: "post",
        url: "http://keycloak:8080/auth/admin/realms/Demo-Realm/users",
        data: JSON.stringify(body),
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
      });
    })
    .then((data) => {
      console.log(data.config.data + "\n");
    })
    .catch((err) => {
      console.log(err);
    });
}
