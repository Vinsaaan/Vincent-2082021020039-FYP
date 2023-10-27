const API_URL = "https://www.universal-tutorial.com/api";
const API_TOKEN =
  "xTBfQqlQd_ZjrNwH1bbOm5rxqWCWUbETMSU1LOVP9R6Tb_Do-sDYnLwDO73y8hv1q78";
const USER_EMAIL = "lauvincent99@gmail.com";

let authToken = null;

async function getAccessToken() {
  if (authToken) return authToken; // Return cached token if available

  const response = await fetch(`${API_URL}/getaccesstoken`, {
    // Modified URL endpoint
    headers: {
      Accept: "application/json",
      "api-token": API_TOKEN,
      "user-email": USER_EMAIL,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch access token");
  }

  const data = await response.json();
  authToken = data.auth_token;
  return authToken;
}

async function getCountry() {
  const token = await getAccessToken();

  const response = await fetch(`${API_URL}/countries`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch countries");
  }

  return await response.json();
}

async function getState(countryName) {
  const token = await getAccessToken();

  const response = await fetch(
    `${API_URL}/states/${encodeURIComponent(countryName)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch states for country ${countryName}`);
  }

  return await response.json();
}

async function getCity(stateName) {
  const token = await getAccessToken();

  const response = await fetch(
    `${API_URL}/cities/${encodeURIComponent(stateName)}`,
    {
      // Added encodeURIComponent for safety
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch cities for state ${stateName}`);
  }

  return await response.json();
}

export { getCountry, getState, getCity };
