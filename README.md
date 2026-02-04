# Postman training mock API

This API is used for training to testing with Postman or similar programs.

## Installation

Clone git repository, go with terminal inside project directory and run:

```bash
npm install
```

## Run

Run command below to start API for testing:

```bash
npm start
```

or with specific PORT for the API

```bash
PORT=4001 npm start
```

> NOTE: all changes such as new, modified or deleted users will be lost after server restart.

## API description

| Method | Endpoint      | Description                            |
| ------ | ------------- | -------------------------------------- |
| POST   | `/auth/login` | Login with email and password          |
| GET    | `/users`      | List existing users (admin only)       |
| GET    | `/users/:id`  | Pick specific user                     |
| POST   | `/users`      | Create new user (admin only)           |
| PATCH  | `/users/:id`  | Update existing user info (admin only) |
| DELETE | `/users/:id`  | Remove specific user (admin only)      |
| GET    | `/error/500`  | Test specific error code               |
