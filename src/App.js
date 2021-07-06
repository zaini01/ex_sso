import React, { useState } from "react";
import { Provider } from "react-redux";
import store from "./store/index";
import { BrowserRouter as Router } from "react-router-dom";
import SignIn from "./components/SignIn";
import Register from "./components/Register";
import GoogleSignIn from "./components/GoogleSignIn";

function App() {
  const [currenTab, setCurrenTab] = useState("signin");

  return (
    <Provider store={store}>
      <Router>
        <div className="d-flex justify-content-center pt-5">
          <div className="rounded border p-3" style={{ width: 500 }}>
            <section id="tabs">
              <div className="row">
                <div className="col-xs-12 ">
                  <nav>
                    <div className="nav nav-tabs nav-fill">
                      <button
                        className="nav-item nav-link btn btn-link"
                        onClick={(e) => setCurrenTab("signin")}
                      >
                        Masuk
                      </button>

                      <button
                        className="nav-item nav-link btn btn-link"
                        onClick={(e) => setCurrenTab("register")}
                      >
                        Daftar
                      </button>
                    </div>
                  </nav>
                  <div
                    className="tab-content py-3 px-3 px-sm-0 "
                    id="nav-tabContent"
                  >
                    <div className="d-flex justify-content-center">
                      <GoogleSignIn />
                    </div>

                    {currenTab === "signin" ? <SignIn /> : <Register />}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
