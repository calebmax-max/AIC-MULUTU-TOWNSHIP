const API_BASE = process.env.NODE_ENV === "production"
  ? "https://caocake.alwaysdata.net"
  : "";          // empty = same origin, proxy handles it

export default API_BASE;