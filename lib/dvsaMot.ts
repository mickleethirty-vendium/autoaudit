type DvsaTokenCache = {
  accessToken: string;
  expiresAt: number;
} | null;

let tokenCache: DvsaTokenCache = null;

function mustGetEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function cleanRegistration(reg: string): string {
  return reg.replace(/\s/g, "").toUpperCase();
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();

  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.accessToken;
  }

  const tokenUrl = mustGetEnv("DVSA_MOT_TOKEN_URL");
  const clientId = mustGetEnv("DVSA_MOT_CLIENT_ID");
  const clientSecret = mustGetEnv("DVSA_MOT_CLIENT_SECRET");
  const scope = mustGetEnv("DVSA_MOT_SCOPE");

  const body = new URLSearchParams();
  body.set("grant_type", "client_credentials");
  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);
  body.set("scope", scope);

  let res: Response;
  try {
    res = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
    });
  } catch (error: any) {
    throw new Error(`DVSA token fetch failed: ${error?.message ?? "unknown error"}`);
  }

  const text = await res.text();

  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  if (!res.ok || !json?.access_token) {
    throw new Error(
      `DVSA token request failed: ${res.status} ${JSON.stringify(json)}`
    );
  }

  const expiresIn = typeof json.expires_in === "number" ? json.expires_in : 3600;

  tokenCache = {
    accessToken: json.access_token,
    expiresAt: now + expiresIn * 1000,
  };

  return tokenCache.accessToken;
}

export async function fetchDvsaMotHistory(
  registration: string
): Promise<any | null> {
  if (!registration) return null;

  try {
    const reg = cleanRegistration(registration);
    const apiKey = mustGetEnv("DVSA_MOT_API_KEY");
    const accessToken = await getAccessToken();

    const baseUrl =
      "https://history.mot.api.gov.uk/v1/trade/vehicles/mot-tests";

    let res: Response;
    try {
      res = await fetch(
        `${baseUrl}?registration=${encodeURIComponent(reg)}`,
        {
          method: "GET",
          headers: {
            "X-API-Key": apiKey,
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );
    } catch (error: any) {
      return {
        _error: true,
        status: 500,
        data: {
          message: `DVSA MOT API fetch failed: ${error?.message ?? "unknown error"}`,
        },
      };
    }

    const text = await res.text();

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      return {
        _error: true,
        status: res.status,
        data,
      };
    }

    return data;
  } catch (error: any) {
    return {
      _error: true,
      status: 500,
      data: {
        message: error?.message ?? "DVSA fetch failed",
      },
    };
  }
}