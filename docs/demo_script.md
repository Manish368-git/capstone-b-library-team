# Week 5 – Partner Demo Script

## Demo Objective

Demonstrate that the backend system has been successfully deployed to a staging environment and that the application health monitoring features are working correctly.

---

## Step 1 — Project Introduction 

The project is a backend API for a library management system developed as part of Capstone B. The application manages books, users, and borrowing records. For Week 5, the focus was on preparing the system for Alpha readiness by deploying the application to a staging environment, implementing a health check endpoint, enabling logging, and configuring a CI smoke test.

---

## Step 2 — Show Staging Deployment 

staging URL in the browser:

https://capstone-b-library-team.onrender.com

* The backend service is deployed on the Render cloud platform.
* The deployment is connected to the GitHub repository.
* Any updates pushed to the main branch automatically trigger a redeployment.

This confirms that the system is publicly accessible in the staging environment.

---

## Step 3 — Demonstrate Health Check Endpoint 

the endpoint:
https://capstone-b-library-team.onrender.com/healthz

 this endpoint verifies whether the backend service is running correctly.

Expected response:

{
"status": "ok",
"version": "alpha",
"time": "2026-03-12T12:03:14"
}

Explain the meaning of each field:

* **status** indicates whether the service is operational.
* **version** identifies the current application version.
* **time** shows the server timestamp.

This endpoint is used by monitoring tools and CI tests to confirm system health.

---

## Step 4 — Show Application Logs 

Open the Render dashboard and navigate to the **Logs** section.

 logs record all incoming HTTP requests and responses.

Example log entry:

GET /healthz 200

 the information captured:

* HTTP request method
* requested endpoint
* response status code

Logs help developers debug issues and monitor application activity during staging and production.

---

## Step 5 — Show CI Smoke Test 

Open the GitHub repository and navigate to the **Actions** tab.

 CI smoke test runs automatically on pull requests. The test starts the application and sends a request to the `/healthz` endpoint to ensure the service is operational.

If the health check fails, the merge is blocked until the issue is resolved.

---

## Step 6 — Demo Conclusion

Summarize the demonstration.

The application has been successfully deployed to a staging environment. The `/healthz` endpoint confirms system health, logging provides visibility into application behaviour, and CI smoke tests ensure stability before code changes are merged.

These features prepare the system for the Alpha milestone in Week 6.
