# Week 3 Reflection – Sujit Giri

During this activity, the mock dataset helped identify several invalid input cases such as empty names, short name lengths, incorrect email formats, negative or out-of-range ages, and duplicate email addresses. These cases revealed potential issues that could cause incorrect data to be stored in the system or lead to application errors.

To prevent these problems, validation rules were implemented on the server side. The API now checks that names contain 2–50 characters, emails follow a valid format, and ages fall within the acceptable range of 0–120. Duplicate email checks also prevent multiple accounts from using the same email address.

For upcoming milestones such as W6 Alpha and W8 gates, the next steps include expanding test coverage, adding more edge-case validation, and strengthening the CI pipeline to ensure consistent testing before deployment.
Minor update to trigger CI workflow.