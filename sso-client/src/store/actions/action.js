import axios from "axios";

import { serverHost } from "../../config";

export function signIn(payload, redirect_url) {
  return async (dispatch) => {
    dispatch(setLoadingStatus(true));

    try {
      let response = await axios.post(`${serverHost}/signIn`, payload);

      dispatch(setResult(response.data));
      redirect(redirect_url, response.data.code);
    } catch (error) {
      dispatch(setLoadingStatus(false));
      dispatch(setError(error.response.data.error_description));
    }
  };
}

export function signInGoogle(payload, redirect_url) {
  return async (dispatch) => {
    dispatch(setLoadingStatus(true));
    try {
      let response = await axios.post(`${serverHost}/exchangeToken`, payload);
      dispatch(setResult(response.data));
      redirect(redirect_url, response.data.code);
    } catch (error) {
      dispatch(setLoadingStatus(false));
      dispatch(setError(error.response.data.error_description));
    }
  };
}

export function register(payload, redirect_url) {
  return async (dispatch) => {
    dispatch(setLoadingStatus(true));
    try {
      let response = await axios.post(`${serverHost}/register`, payload);
      dispatch(setResult(response.data));
      redirect(redirect_url, response.data.code);
    } catch (error) {
      dispatch(setLoadingStatus(false));
      dispatch(setError(error.response.data.error_description));
    }
  };
}

export function forgotPassword(payload) {
  return async (dispatch) => {
    try {
      dispatch(setLoadingStatus(true));
      let response = await axios.post(`${serverHost}/forgotPassword`, payload);
      dispatch(setResult(response.data));
      dispatch(setEmailSendStatus(true));
    } catch (error) {
      dispatch(setLoadingStatus(false));
      dispatch(setError(error.response.data.error_description));
    }
  };
}

export function setRedirect_url(payload) {
  return {
    type: "SET_REDIRECT_URL",
    payload: payload,
  };
}

export function setClient_id(payload) {
  return {
    type: "SET_CLIENT_ID",
    payload: payload,
  };
}

export function setError(payload) {
  return {
    type: "SET_ERROR",
    payload: payload,
  };
}

export function setEmailSendStatus(payload) {
  return {
    type: "SET_EMAIL_SEND_STATUS",
    payload: payload,
  };
}

export function setLoadingStatus(payload) {
  return {
    type: "SET_LOADING",
    payload: payload,
  };
}

function setResult(payload) {
  return {
    type: "SET_RESULT",
    payload: payload,
  };
}

function redirect(redirect_url, refresh_token) {
  if (redirect_url.includes("?")) {
    window.location.assign(`${redirect_url}&code=${refresh_token}`);
  } else {
    window.location.assign(`${redirect_url}?code=${refresh_token}`);
  }
}
