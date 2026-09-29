# Bug Report

## Bug: Incorrect Pagination for First Page

### Description

The pagination logic was calculating the starting index incorrectly.

### How the Bug Was Found

The bug was discovered while writing an integration test for:

`GET /tasks?page=1&limit=2`

The test created three tasks and expected the first two tasks to be returned.

### Expected Behavior

For:

`GET /tasks?page=1&limit=2`

the API should return the first two tasks.

### Actual Behavior

The API returned only the third task.

### Root Cause

The pagination offset was calculated as:

```js
const offset = page * limit;
```

For page 1 and limit 2, this resulted in:

```text
offset = 1 * 2 = 2
```

This caused the API to start from the third task instead of the first task.

### Fix

The calculation was changed to:

```js
const offset = (page - 1) * limit;
```

Now page 1 correctly starts at index 0.

### Verification

After fixing the bug, all tests passed successfully.

* Test Suites: 2 passed
* Tests: 32 passed
* Statements: 92.05%
* Branches: 82.14%
* Functions: 93.10%
* Lines: 91.24%
