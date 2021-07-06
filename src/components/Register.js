import React, { useState } from "react";
import { register, setError } from "../store/actions/action";
import { useDispatch, useSelector } from "react-redux";
import cogoToast from "cogo-toast";
import Spinner from "../components/Spinner";

function Register() {
  const [usernameReg, setUserNameReg] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const redirect_url = useSelector((state) => state.redirect_url);
  const client_id = useSelector((state) => state.client_id);
  const error = useSelector((state) => state.error);
  const loading = useSelector((state) => state.loading);

  const dispatch = useDispatch();

  const handleSubmitReg = async (e) => {
    e.preventDefault();
    let name = usernameReg.split(" ");

    let payload = {
      firstName: name[0],
      lastName: name[name.length - 1],
      username: usernameReg,
      email: email,
      password: passwordReg,
      phoneNumber: phoneNumber,
      client_id: client_id,
    };

    dispatch(register(payload, redirect_url));
    clear();
  };

  const clear = () => {
    setUserNameReg("");
    setPasswordReg("");
    setPhoneNumber("");
    setEmail("");
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

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container-fluid">
      <form onSubmit={handleSubmitReg}>
        <div className="form-group">
          <label>Nama Lengkap</label>
          <input
            className="form-control p-3"
            value={usernameReg}
            placeholder="Nama Lengkap"
            required="required"
            onChange={(e) => setUserNameReg(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Nomor Handphone</label>
          <input
            type="number"
            className="form-control p-3"
            value={phoneNumber}
            placeholder="Nomor Handphone"
            required="required"
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Alamat Email</label>
          <input
            type="email"
            value={email}
            className="form-control p-3"
            placeholder="Alamat Email"
            required="required"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Kata Sandi</label>
          <input
            type="password"
            value={passwordReg}
            className="form-control p-3"
            placeholder="Kata Sandi"
            required="required"
            onChange={(e) => setPasswordReg(e.target.value)}
          />
        </div>

        <div className="d-flex ">
          <button type="submit" className="btn btn-primary btn-block">
            Daftar
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;
