const initialState = {
  result: {},
  redirect_url: "",
  client_id: "",
  error: "",
  loading: "",
  emailSendStatus: false,
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case "SET_RESULT":
      return { ...state, result: action.payload };
    case "SET_REDIRECT_URL":
      return { ...state, redirect_url: action.payload };
    case "SET_CLIENT_ID":
      return { ...state, client_id: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_EMAIL_SEND_STATUS":
      return { ...state, emailSendStatus: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}
export default reducer;
