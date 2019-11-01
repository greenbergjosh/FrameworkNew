let baseAddress = "https://getgotapp.com"

const resultCodes = {
  0: "Success",
  1: "Unhandled exception",
  2: "Server resource exception - Some external resource such as the DB or required API is down",
  50: "Bad or missing SID - this should never be shown as such",
  100: "Function unhandled exception",
  101: "Incorrect confirmation code",
  102: "Badly formatted contact",
  103: "Sending message to contact is not supported",
  104: "Password rule violation",
  105: "Handle rule violation",
  106: "Invalid login",
  107: "Account exists",
  108: "Exhausted unique handle attempts",
  109: "Contact not found",
  110: "Name already used in context",
  111:  "Invalid promotion payload"
}

export const setBaseAddress = (address: string) => {
  baseAddress = address
}

const getGotRequest = async (name: string, request: object) => {
  const body = {
    p: {
      
    }
  }
  body.p[name] = request;
  const response = await fetch(baseAddress, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
  const json = await response.json()
  console.log(json);
  if (json.r !== 0) {
    let msg = resultCodes[json.r]
    if (!msg) {
      msg = 'an unexpected generic error occured.'
    }
    throw new Error(msg)
  }
  if (json.login.r !== 0) {
    let msg = resultCodes[json.login.r]
    if (!msg) {
      msg = 'an unexpected specific error occured.'
    }
    throw new Error(msg)
  }
  return json[name]
}

export const login = async (username: string, password: string, device: string) => {
  return await getGotRequest('login', {
    u: username, 
    p: password,
    d: device
  })
}