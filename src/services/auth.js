export function logout() {
  localStorage.removeItem("yourTaxToken");
  localStorage.removeItem("yourTaxUser");

  window.location.assign("/login");
}
