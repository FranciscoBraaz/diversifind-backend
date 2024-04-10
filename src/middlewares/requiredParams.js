import { setErrorMessage } from "../utils/index.js"

export function requiredParams(params) {
  return (request, response, next) => {
    const verify = [...params].filter((key) => !request.body[key])
    if (verify.length > 0) {
      return response.status(400).send({
        errors: [
          setErrorMessage(400, `Missing body params: ${verify.join(", ")}`),
        ],
      })
    }

    next()
  }
}
