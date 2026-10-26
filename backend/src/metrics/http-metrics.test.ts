import assert from "node:assert/strict";
import { createServer } from "node:http";
import { after, describe, test } from "node:test";
import express, { type Express } from "express";

import {
  createHttpMetrics,
  metricsResponse,
  requireMetricsToken,
  type HttpMetrics,
} from "./http-metrics.js";

const TOKEN = "metrics-test-token";
const ROOM_CODE = "ROOMCODE123";
const QUERY_SECRET = "super-secret-query";

describe("HTTP metrics", { concurrency: false }, () => {
  const originalToken = process.env.METRICS_TOKEN;

  after(() => {
    if (originalToken === undefined) {
      delete process.env.METRICS_TOKEN;
    } else {
      process.env.METRICS_TOKEN = originalToken;
    }
  });

  test("records route templates, status codes, and histogram buckets", async () => {
    process.env.METRICS_TOKEN = TOKEN;
    const metrics = createHttpMetrics();
    const server = await listen(buildApp(metrics));

    try {
      const health = await fetch(`${server.base}/api/health?token=${QUERY_SECRET}`);
      assert.equal(health.status, 200);
      const healthBody = await health.json();
      assert.equal(healthBody.status, "healthy");

      const room = await fetch(`${server.base}/api/rooms/${ROOM_CODE}`);
      assert.equal(room.status, 200);

      const users = await fetch(`${server.base}/api/users`);
      assert.equal(users.status, 200);

      const missing = await fetch(`${server.base}/api/does-not-exist`);
      assert.equal(missing.status, 404);

      const failure = await fetch(`${server.base}/api/boom`);
      assert.equal(failure.status, 500);

      const socket = await fetch(`${server.base}/socket.io/?EIO=4&transport=polling`);
      assert.equal(socket.status, 404);

      const denied = await fetch(`${server.base}/metrics`);
      assert.equal(denied.status, 401);

      const wrongToken = await fetch(`${server.base}/metrics`, {
        headers: { authorization: "Bearer wrong-token" },
      });
      assert.equal(wrongToken.status, 401);

      const metricsResponse = await fetch(`${server.base}/metrics`, {
        headers: { authorization: `Bearer ${TOKEN}` },
      });
      assert.equal(metricsResponse.status, 200);
      const body = await metricsResponse.text();

      assert.match(body, /yapply_http_requests_total/);
      assert.match(body, /yapply_http_request_duration_seconds_bucket/);
      assert.match(body, /route="\/api\/health",status_code="200"/);
      assert.match(body, /route="\/api\/rooms\/:roomCode",status_code="200"/);
      assert.match(body, /route="\/api\/users",status_code="200"/);
      assert.match(body, /route="unmatched",status_code="404"/);
      assert.match(body, /route="\/api\/boom",status_code="500"/);
      assert.equal(body.includes(ROOM_CODE), false);
      assert.equal(body.includes(QUERY_SECRET), false);
      assert.equal(body.includes(TOKEN), false);
      assert.equal(body.includes("/metrics"), false);
      assert.equal(body.includes("socket.io"), false);
      assert.equal(body.includes("EIO"), false);
    } finally {
      await server.close();
    }
  });

  test("rejects /metrics when METRICS_TOKEN is unset", async () => {
    delete process.env.METRICS_TOKEN;
    const metrics = createHttpMetrics();
    const server = await listen(buildApp(metrics));

    try {
      const response = await fetch(`${server.base}/metrics`, {
        headers: { authorization: `Bearer ${TOKEN}` },
      });
      assert.equal(response.status, 401);
      const body = await response.json();
      assert.deepEqual(body, { message: "Unauthorized" });
    } finally {
      await server.close();
    }
  });
});

function buildApp(metrics: HttpMetrics): Express {
  const app = express();
  app.use(metrics.middleware);
  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  });
  const rooms = express.Router();
  rooms.get("/:roomCode", (_req, res) => {
    res.status(200).json({ ok: true });
  });
  app.use("/api/rooms", rooms);
  const users = express.Router();
  users.get("/", (_req, res) => {
    res.status(200).json({ ok: true });
  });
  app.use("/api/users", users);
  app.get("/api/boom", (_req, res) => {
    res.status(500).json({ message: "failed" });
  });
  app.get("/metrics", requireMetricsToken, metricsResponse(metrics.register));
  return app;
}

function listen(app: Express): Promise<{ base: string; close: () => Promise<void> }> {
  const server = createServer(app);

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Test server did not receive a port"));
        return;
      }

      resolve({
        base: `http://127.0.0.1:${address.port}`,
        close: () =>
          new Promise((closeResolve, closeReject) => {
            server.close((error) => {
              if (error) {
                closeReject(error);
                return;
              }
              closeResolve();
            });
          }),
      });
    });
  });
}
