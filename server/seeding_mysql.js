const mysql = require("mysql");
const qs = require("qs");
const axios = require("axios");

let total = 0;
let length;

const con = mysql.createConnection({
  host: "localhost",
  user: "zai",
  password: "P@55w0rd",
  database: "rsk",
});

let query = `SELECT COUNT(*) as count FROM user`;

con.connect(function (err) {
  if (err) throw err;
  con.query(query, function (err, res, fields) {
    if (err) throw err;
    length = res[0].count;
    fetching(err, res, fields, length);
  });
});

function fetching(err, res, fields, length) {
  let limit = 5;
  for (let i = 0; i < length; i += limit) {
    let query = `SELECT * FROM user LIMIT ${limit} OFFSET ${i}`;

    if (err) throw err;
    con.query(query, function (err, res, fields) {
      if (err) throw err;
      seeding(res);
    });
  }
}

function seeding(users) {
  for (let i = 0; i < users.length; i++) {
    submit(users[i]);
    total++;
    if (total == length) {
      con.end();
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
  // console.log(body.firstName);

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
