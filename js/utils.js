export function extractErrorMessage(error, fallbackMessage = "Сталася помилка під час запиту. Спробуйте пізніше.") {
  const serverMessage = error.response?.data?.error;
  if (typeof serverMessage === "string") {
    return serverMessage;
  }
  if (error.message) {
    return error.message;
  }
  return fallbackMessage;
}
