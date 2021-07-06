function errorHandler(err, req, res, next) {
  if (err == "Error: Unsupported state or unable to authenticate data") {
    res.status(401).send("invalid code");
  } else if (err.response) {
    if (
      err.response.data.error ===
      "Alamat email atau kata sandi tidak valid. Mohon periksa kembali."
    ) {
      err.response.data = {
        error: "invalid_grant",
        error_description:
          "Alamat email atau kata sandi tidak valid. Mohon periksa kembali.",
      };
    }

    if (err.response.data.error_description === "Invalid user credentials") {
      err.response.data.error_description =
        "Alamat email atau kata sandi tidak valid. Mohon periksa kembali.";
    }

    if (
      err.response.data.errorMessage === "Failed to send execute actions email"
    ) {
      err.response.data.error_description =
        "Failed to send execute actions email";
    }

    res.status(err.response.status).json(err.response.data);
  } else {
    res.status(500).send("internal server error");
  }
}

module.exports = errorHandler;

