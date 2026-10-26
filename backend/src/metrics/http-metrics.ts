import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from "@prometheus-io/client";

const HTTP_LABELS = ["method", "route", "status_code"] as const;
type HttpLabel = (typeof HTTP_LABELS)[number];

const DURATION_BUCKETS_SECONDS = [
  0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10,
];

const KNOWN_METHODS = new Set([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
]);

const ROUTE_LABEL = /^\/[A-Za-z0-9_./:-]*$/;

export type HttpMetrics = {
  register: Registry;
  middleware: RequestHandler;
};

export function createHttpMetrics(): HttpMetrics {
  const register = new Registry();
  collectDefaultMetrics({ register });

  const duration = new Histogram<HttpLabel>({
    name: "yapply_http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds.",
    labelNames: [...HTTP_LABELS],
    buckets: DURATION_BUCKETS_SECONDS,
    registers: [register],
  });

  const requests = new Counter<HttpLabel>({
    name: "yapply_http_requests_total",
    help: "Total number of HTTP requests.",
    labelNames: [...HTTP_LABELS],
    registers: [register],
  });

  const middleware: RequestHandler = (req, res, next) => {
    if (skipMetrics(req)) {
      next();
      return;
    }

    const stopTimer = duration.startTimer();
    res.on("finish", () => {
      const labels = {
        method: methodLabel(req.method),
        route: routeLabel(req),
        status_code: statusLabel(res.statusCode),
      };
      stopTimer(labels);
      requests.inc(labels);
    });

    next();
  };

  return { register, middleware };
}

export const httpMetrics = createHttpMetrics();

let missingTokenWarningSent = false;

export function requireMetricsToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const expected = process.env.METRICS_TOKEN?.trim();
  if (!expected) {
    if (!missingTokenWarningSent) {
      missingTokenWarningSent = true;
      console.warn("METRICS_TOKEN is not set. /metrics will reject requests.");
    }
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const provided = bearerToken(req.header("authorization"));
  if (!provided || !safeEqual(provided, expected)) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  next();
}

export function metricsResponse(register: Registry): RequestHandler {
  return async (_req, res) => {
    try {
      const body = await register.metrics();
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Content-Type", register.contentType);
      res.status(200).send(body);
    } catch {
      res.status(500).json({ message: "Failed to render metrics" });
    }
  };
}

function skipMetrics(req: Request): boolean {
  return req.path === "/metrics" || req.path.startsWith("/socket.io");
}

function methodLabel(method: string): string {
  const normalized = method.toUpperCase();
  return KNOWN_METHODS.has(normalized) ? normalized : "OTHER";
}

function statusLabel(statusCode: number): string {
  if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) {
    return "other";
  }
  return String(statusCode);
}

function routeLabel(req: Request): string {
  const path = req.route?.path;
  if (typeof path !== "string" || !path.startsWith("/")) {
    return "unmatched";
  }

  const base = req.baseUrl ?? "";
  const route = !base ? path : path === "/" ? base : `${base}${path}`;
  return ROUTE_LABEL.test(route) ? route : "unmatched";
}

function bearerToken(header: string | undefined): string | undefined {
  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }

  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : undefined;
}

function safeEqual(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return timingSafeEqual(providedBuffer, expectedBuffer);
}
