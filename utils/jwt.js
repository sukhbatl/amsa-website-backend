const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is not set");
  console.error("Please set JWT_SECRET in your .env file");
  process.exit(1);
}

export default JWT_SECRET;
