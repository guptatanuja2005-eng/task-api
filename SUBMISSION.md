# Submission Notes

I added unit tests for `taskService.js` using Jest and integration tests for the API routes using Supertest. I found and fixed an incorrect pagination calculation where the first page skipped the first tasks. I also added the `PATCH /tasks/:id/assign` endpoint with validation and tests. The final test suite has 32 passing tests with 92.05% statement coverage.

### What I'd Test Next

If I had more time, I would add tests for persistence/database failures, authentication and authorization, concurrent requests, and more validation edge cases.

### What Surprised Me

The API had no existing tests, and writing integration tests helped reveal the pagination bug that was not immediately obvious from reading the code.

### Questions Before Production

* Should a task that already has an assignee be allowed to be reassigned?
* Should assignees be validated against registered users?
* What authentication and authorization rules are required?
* What database and persistence strategy should be used in production?
