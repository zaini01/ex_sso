import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { signInGoogle, setError } from "../store/actions/action";
import { GoogleLogin } from "react-google-login";
import cogoToast from "cogo-toast";

const clientIdGoogle =
  "975315311294-qqpdikhql6nfcjedch045a57ud5ipgvc.apps.googleusercontent.com";

function GoogleSignIn() {
  const redirect_url = useSelector((state) => state.redirect_url);
  const client_id = useSelector((state) => state.client_id);
  const error = useSelector((state) => state.error);

  const dispatch = useDispatch();

  const onSuccess = (res) => {
    let payload = {
      access_token: res.accessToken,
      client_id: client_id,
    };
    if (client_id) {
      dispatch(signInGoogle(payload, redirect_url));
    }
  };

  const onFailure = (res) => {
    console.log("Login failed: res:", res);
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

  return (
    <div>
      <GoogleLogin
        clientId={clientIdGoogle}
        buttonText="Gunakan akun google"
        onSuccess={onSuccess}
        onFailure={onFailure}
        cookiePolicy={"single_host_origin"}
        style={{ marginTop: "100px" }}
        isSignedIn={true}
      />
    </div>
  );
}

export default GoogleSignIn;
