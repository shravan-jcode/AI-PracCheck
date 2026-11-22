# User Functionality – API Testing Guide

This document explains how to test the User Authentication and Profile Management APIs using **Postman**.

## 1. Base URL

Start your backend server before testing.

```text
http://localhost:3000/api/v1/user
```

> Make sure MongoDB is connected and your server is running.

## 2. User APIs

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/register` | Register a new user | Not required |
| POST | `/login` | Login an existing user | Not required |
| POST | `/logout` | Logout the user | Not required |
| GET | `/profile` | Get logged-in user's profile | Required |
| PUT | `/profile` | Update user's name | Required |
| PUT | `/change-password` | Change user's password | Required |

## 3. Testing APIs in Postman

### A. Register User

**Request**

```http
POST http://localhost:3000/api/v1/user/register
```

**Body → raw → JSON**

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@gmail.com",
  "password": "rahul1234",
  "role": "student"
}
```

**Expected result:**

- Status: `201 Created` (if configured by your controller).
- User should be created successfully.
- Password should be stored as a hashed value, not plain text.

**Test cases:**

- Register with all valid details.
- Try registering with an already registered email.
- Try submitting without a name, email, or password.
- Try using an invalid email format.
- Try a password shorter than 8 characters.
- Try an invalid role.

### B. Login User

**Request**

```http
POST http://localhost:3000/api/v1/user/login
```

**Body → raw → JSON**

```json
{
  "email": "rahul@gmail.com",
  "password": "rahul1234"
}
```

**Expected result:**

- Login should succeed with correct credentials.
- A JWT authentication cookie named `token` should be set.
- Password should not be included in the response.

**Test cases:**

- Login with correct email and password.
- Try an incorrect password.
- Try an email that is not registered.
- Try logging in with an inactive account.

> Postman normally saves cookies automatically. Check the Cookies section for `localhost` and confirm that the `token` cookie is present.

### C. Get User Profile

**Request**

```http
GET http://localhost:3000/api/v1/user/profile
```

**Body:** None.

**Authentication:** Required. Login first so Postman can send the authentication cookie.

**Expected result:**

- Returns the logged-in user's profile.
- Password should not appear in the response.

**Test cases:**

- Send the request after successful login.
- Remove the authentication cookie and send the request again.
- Expected without a valid cookie: `401 Unauthorized`.

### D. Update User Profile

**Request**

```http
PUT http://localhost:3000/api/v1/user/profile
```

**Body → raw → JSON**

```json
{
  "name": "Rahul Kumar"
}
```

**Authentication:** Required.

**Expected result:**

- User's name should be updated.
- Updated user details should be returned.

**Test cases:**

- Update with a valid name.
- Try sending an empty name.
- Try sending a number instead of a string.
- Try updating without authentication.

### E. Change Password

**Request**

```http
PUT http://localhost:3000/api/v1/user/change-password
```

**Body → raw → JSON**

```json
{
  "currentPassword": "rahul1234",
  "newPassword": "rahul4567"
}
```

**Authentication:** Required.

**Expected result:**

- Current password should be verified.
- New password should be hashed and saved.
- Password should not be returned in the response.

**Test cases:**

- Change password using the correct current password.
- Try changing it with an incorrect current password.
- Try a new password shorter than 8 characters.
- Try changing the password without authentication.

**Additional verification:**

1. Log out or otherwise ensure you can test a fresh login.
2. Try logging in with the old password. It should fail.
3. Try logging in with the new password. It should succeed.

### F. Logout User

**Request**

```http
POST http://localhost:3000/api/v1/user/logout
```

**Body:** None.

**Expected result:**

- Logout success response should be returned.
- The `token` authentication cookie should be cleared.

**Test cases:**

- Logout after logging in.
- Check that the token cookie is cleared.
- Try accessing `/profile` after logout. It should return `401 Unauthorized`.

## 4. Recommended Testing Order

Follow this order to test the complete user functionality:

1. Register a new user.
2. Login with the registered user's credentials.
3. Check the user profile.
4. Update the user's name.
5. Change the password.
6. Test login using the old password (should fail).
7. Test login using the new password (should succeed).
8. Logout.
9. Try accessing the profile after logout (should return `401 Unauthorized`).

## 5. Important Notes

- Use **Body → raw → JSON** for requests that need a request body.
- Use the correct HTTP method for each endpoint.
- Login before testing protected routes.
- Postman should send the authentication cookie automatically when it is saved for the same host.
- Do not manually send the password in profile update requests.
- Passwords are stored as hashed values using bcrypt.
- JWT authentication is handled using an HTTP-only cookie.
- The exact success status codes and response messages depend on your controller implementation.

---

**Scope:** This guide covers only the User Authentication and Profile Management functionality currently implemented. It does not cover subject management, teacher management, student management, or other future modules.