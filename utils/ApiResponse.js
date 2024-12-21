class ApiResponse {
  constructor(status, message = "Internal Server Response", data) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.success = status < 400;
  }
}