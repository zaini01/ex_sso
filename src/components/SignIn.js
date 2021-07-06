import React, { useState, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import queryString from "query-string";
import cogoToast from "cogo-toast";
import Spinner from "../components/Spinner";
import {
  signIn,
  forgotPassword,
  setRedirect_url,
  setClient_id,
  setError,
  setEmailSendStatus,
} from "../store/actions/action";

function SignIn() {
  //EMAIL AS USER NAME SET IN KEYCLOAK
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const redirect_url = useSelector((state) => state.redirect_url);
  const client_id = useSelector((state) => state.client_id);
  const error = useSelector((state) => state.error);
  const loading = useSelector((state) => state.loading);

  const emailSendStatus = useSelector((state) => state.emailSendStatus);

  const dispatch = useDispatch();

  useEffect(() => {
    if (redirect_url === "") {
      let query = queryString.parse(window.location.search);

      dispatch(setRedirect_url(query.redirect_url));
      dispatch(setClient_id("RSK"));
    }
  }, []);

  const handleSubmitLogin = async (e) => {
    e.preventDefault();

    let payload = {
      client_id: client_id,
      username: username,
      password: password,
    };
    dispatch(signIn(payload, redirect_url));
    setPassword("");
  };

  const handleSubmitEmail = async () => {
    if (username === "") {
      const { hide } = cogoToast.warn("Email is required.", {
        hideAfter: 10,
        onClick: () => {
          hide();
        },
      });
    } else {
      let payload = {
        username: username,
      };
      dispatch(forgotPassword(payload));
    }
  };

  if (error) {
    const { hide } = cogoToast.error(error, {
      hideAfter: 10,
      onClick: () => {
        hide();
      },
    });
    dispatch(setError(""));
  }

  if (emailSendStatus) {
    const { hide } = cogoToast.success("Mail has been send.", {
      hideAfter: 10,
      onClick: () => {
        hide();
      },
    });
    dispatch(setEmailSendStatus(false));
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container">
      <form onSubmit={handleSubmitLogin}>
        <div className="form-group">
          <label>Alamat Email</label>
          <input
            type="email"
            className="form-control p-3"
            value={username}
            placeholder="Alamat Email"
            required="required"
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Kata Sandi</label>
          <input
            type="password"
            value={password}
            className="form-control p-3"
            placeholder="Kata Sandi"
            required="required"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="d-flex justify-content-end">
          <a href="#" onClick={handleSubmitEmail}>
            Lupa Kata Sandi?
          </a>
        </div>
        <div className="pt-3">
          <button type="submit" className="btn btn-primary btn-block p-3">
            Masuk
          </button>
        </div>
      </form>
    </div>
  );
}

export default SignIn;
