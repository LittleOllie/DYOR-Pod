import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

describe("admin middleware", () => {
  it("redirects unauthenticated admin page requests to login", () => {
    const request = new NextRequest("https://www.dyorpod.com/admin");
    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/admin/login");
    expect(response.headers.get("location")).toContain("next=%2Fadmin");
  });

  it("allows admin login without a session cookie", () => {
    const request = new NextRequest("https://www.dyorpod.com/admin/login");
    const response = middleware(request);

    expect(response.status).toBe(200);
  });

  it("allows authenticated admin requests", () => {
    const request = new NextRequest("https://www.dyorpod.com/admin/schedule", {
      headers: {
        cookie: "dyor_admin_session=test-token",
      },
    });
    const response = middleware(request);

    expect(response.status).toBe(200);
  });
});
