# API Specification: Authentication Concept

**Purpose:** Manage user accounts, including registration, authentication, and profile updates.

---

## API Endpoints

### POST /api/Authentication/register

**Description:** Registers a new user with a unique username and password.

**Requirements:**
- The provided username must not already be in use.

**Effects:**
- A new user account is created with the given username and password, and added to the user set.
- The unique ID of the newly created user is returned.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "user": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Authentication/deleteUser

**Description:** Deletes an existing registered user account.

**Requirements:**
- The specified user must exist.

**Effects:**
- The user account is removed from the user set.

**Request Body:**
```json
{
  "user": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Authentication/changePassword

**Description:** Changes the password for an existing user account.

**Requirements:**
- The specified user must exist.

**Effects:**
- The password associated with the user is updated to the `newPassword`.

**Request Body:**
```json
{
  "user": "string",
  "newPassword": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Authentication/authenticate

**Description:** Authenticates a user given their username and password.

**Requirements:**
- A user with the provided username and password must exist.

**Effects:**
- If successful, the ID of the authenticated user is returned.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "user": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Authentication/_getAllUsers

**Description:** Retrieves all registered users.

**Requirements:**
- true

**Effects:**
- Returns a list of all user objects, each containing their ID, username, and password.

**Request Body:**
```json
{}
```

**Success Response Body (Query):**
```json
[
  {
    "_id": "string",
    "username": "string",
    "password": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```