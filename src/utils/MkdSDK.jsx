export default function MkdSDK() {
  this._baseurl = "https://reacttask.mkdlabs.com";
  this._project_id = "reacttask";
  this._secret = "d9hedycyv6p7zw8xi34t9bmtsjsigy5t7";
  this._table = "";
  this._custom = "";
  this._method = "";

  const raw = this._project_id + ":" + this._secret;
  let base64Encode = btoa(raw);

  this.setTable = function (table) {
    this._table = table;
  };

  this.login = async function (email, password, role) {
    try {
      const loginRes = await fetch(
        `${this._baseurl}/v2/api/lambda/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-project": base64Encode,
          },
          body: JSON.stringify({
            email,
            password,
            role,
          }),
        });

      const jsonLogin = await loginRes.json();
      if (!loginRes.ok) {
        throw new Error(jsonLogin.message || "Failed to Login!");
      }
      localStorage.setItem("token", jsonLogin.token);
      localStorage.setItem("isAutheticated", true);
      localStorage.setItem("role", jsonLogin.role);
      return jsonLogin;
    } catch (error) {
      throw new Error(error.message || "Failed to Login!");
    }
  };

  this.getHeader = function () {
    return {
      Authorization: "Bearer " + localStorage.getItem("token"),
      "x-project": base64Encode,
    };
  };

  this.baseUrl = function () {
    return this._baseurl;
  };

  this.callRestAPI = async function (payload, method) {
    const header = {
      "Content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    switch (method) {
      case "GET":
        const getResult = await fetch(
          this._baseurl + `/v1/api/rest/${this._table}/GET`,
          {
            method: "POST",
            headers: header,
            body: JSON.stringify(payload),
          }
        );
        const jsonGet = await getResult.json();

        if (getResult.status === 401) {
          throw new Error(jsonGet.message || "Failed to fetch!");
        }
        if (getResult.status === 403) {
          throw new Error(jsonGet.message || "Failed to fetch!");
        }
        return jsonGet;

      case "PAGINATE":
        if (!payload.page) {
          payload.page = 1;
        }
        if (!payload.limit) {
          payload.limit = 10;
        }
        const paginateResult = await fetch(
          this._baseurl + `/v1/api/rest/${this._table}/${method}`,
          {
            method: "POST",
            headers: header,
            body: JSON.stringify(payload),
          }
        );
        const jsonPaginate = await paginateResult.json();

        if (paginateResult.status === 401) {
          throw new Error(jsonPaginate.message || "Failed to fetch!");
        }

        if (paginateResult.status === 403) {
          throw new Error(jsonPaginate.message || "Failed to fetch!");
        }
        return jsonPaginate;
      default:
        break;
    }
  };

  this.check = async function (role) {
    try {
      const checkRes = await fetch(
        `${this._baseurl}/v2/api/lambda/check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-project": base64Encode,
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({
            role,
          }),
        });
        
      if (checkRes.status === 200) {
        return true;
      } else {
        throw new Error(jsonLogin.message || "Token is not valid!");
      }
    } catch (error) {
      throw new Error(error.message || "Failed to Check token");
    }
  };

  return this;
}
