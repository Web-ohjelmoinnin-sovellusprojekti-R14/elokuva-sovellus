function logoutController(req, res) {
  res.clearCookie("token");
  return res.json({ message: "Logged out" });
}

export default logoutController; 