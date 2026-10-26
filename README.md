# Yapply

## API metrics

The backend exposes Prometheus metrics at `GET /metrics` using `@prometheus-io/client`. That package requires Node.js 22 or 24, which matches the current local runtime and Heroku’s Node 24 default. The endpoint is not public. Set `METRICS_TOKEN` on the Heroku app only, and send it as `Authorization: Bearer <token>`. Do not put this token in frontend environment variables. If `METRICS_TOKEN` is unset, `/metrics` returns 401. `/api/health` is unchanged.

`/metrics` and Socket.IO transport requests (`/socket.io`) are not included in the HTTP metrics. Route labels use Express route templates such as `/api/rooms/:roomCode`, never the requested URL, query string, user id, email, token, or room code.

### Metrics

- `yapply_http_requests_total` counts completed HTTP responses. Labels: `method`, `route`, `status_code`.
- `yapply_http_request_duration_seconds` is a histogram of those responses in seconds, with the same labels. Its buckets support `histogram_quantile` for p50, p95, and p99.
- Process and Node.js runtime metrics from the Prometheus client are included on the same registry. They do not contain environment variables or secrets.

Status codes stay on the `status_code` label, so 4xx and 5xx can be queried separately.

### Queries

p95 latency by route:

```promql
histogram_quantile(
  0.95,
  sum by (le, route) (
    rate(yapply_http_request_duration_seconds_bucket[5m])
  )
)
```

Request rate:

```promql
sum(rate(yapply_http_requests_total[5m]))
```

HTTP 5xx error rate:

```promql
sum(rate(yapply_http_requests_total{status_code=~"5.."}[5m]))
/
sum(rate(yapply_http_requests_total[5m]))
```

4xx responses use the same query with `status_code=~"4.."`.

### Scraping

Prometheus can scrape `https://api.yapply.dev/metrics` with a bearer token. Keep the token in the scraper config, not in the Yapply frontend.

```yaml
scrape_configs:
  - job_name: yapply-api
    scheme: https
    metrics_path: /metrics
    authorization:
      type: Bearer
      credentials: <METRICS_TOKEN>
    static_configs:
      - targets: ["api.yapply.dev"]
```

For a local check, from `backend/`:

```bash
curl -s -H "Authorization: Bearer $METRICS_TOKEN" http://localhost:8080/metrics
```

`PORT` in local development comes from the backend environment. Heroku sets `PORT` itself. Point k6 at the API routes, then read the histogram from Prometheus. Do not load-test `/metrics`.

### Tests

```bash
cd backend
npm test
npm run typecheck
npm run build
```
