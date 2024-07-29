const request = require("supertest");
const app = require("../api/index");

describe("Route Tests", () => {
  test("GET / should serve index.html", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("<!DOCTYPE html>");
  });

  test("GET /dashboard should serve dashboard.html", async () => {
    const response = await request(app).get("/dashboard");
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("<title></title>");
    expect(response.text).toContain('class="modal centered"');
  });

  test("GET /playlist should serve playlist.html", async () => {
    const response = await request(app).get("/playlist");
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("<title></title>");
    expect(response.text).toContain('class="wistia_embed"');
  });

  test("Static files should be served correctly", async () => {
    const cssResponse = await request(app).get("/common.css");
    expect(cssResponse.statusCode).toBe(200);
    expect(cssResponse.headers["content-type"]).toContain("text/css");

    const jsResponse = await request(app).get("/common.js");
    expect(jsResponse.statusCode).toBe(200);
    expect(jsResponse.headers["content-type"]).toContain(
      "application/javascript"
    );

    const imageResponse = await request(app).get("/wistia-logo.png");
    expect(imageResponse.statusCode).toBe(200);
    expect(imageResponse.headers["content-type"]).toContain("image/png");
  });
});
