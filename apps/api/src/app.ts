import { cors } from "hono/cors";
import { swaggerUI } from "@hono/swagger-ui";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";



const app = new OpenAPIHono();

app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json(
    {
      error: "Internal Server Error",
      message: err.message || "Something went wrong",
    },
    500
  );
});


const getUsersRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Users"],
  responses: {
    200: {
      description: "Users fetched successfully",
    },
    401: {
      description: "Unauthorized",
    },
  },
});
const getUsersHandler = async (c: Context) => {
  return c.json({"Hellow" : "we have made it this far"});
};
app.openapi(getUsersRoute, getUsersHandler)

app.get("/ui", swaggerUI({ url: "/doc" }));
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Perkly API",
    description: "API for Perkly",
  },
});

export default app;
