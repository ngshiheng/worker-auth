# worker-auth

- [worker-auth](#worker-auth)
  - [Motivation](#motivation)
  - [User Workflow](#user-workflow)
  - [Requirements](#requirements)
  - [Setup](#setup)
  - [Usage](#usage)
  - [Reference](#reference)

## Motivation

To demonstrate how cookie based authentication work.

## User Workflow

The diagram below shows how we implement user registration, login, and authorization.

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Server

    Client->>+Server: POST /register
    Server-->>-Client: 302 User registered successfully
    Client->>+Server: POST /login
    Server-->>-Client: 200 Successfully login
    Note over Client,Server: Token is set in cookie
    Client->>+Server: GET /hello
    Server-->>-Client: Hello, 你好!
    Client->>+Server: POST /logout
    Server-->>-Client: 200 Successfully logout
    Note over Client,Server: Token is set as empty string in cookie
```

## Requirements

-   A [Cloudflare](https://www.cloudflare.com/) account
-   Install [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/cli-wrangler/) for Cloudflare Workers deployment

## Setup

```sh
❯ npm ci
# ...omitted for brevity...

❯ wrangler login
# ...omitted for brevity...

❯ wrangler kv:namespace create "USERS"
# ...omitted for brevity...
Add the following to your configuration file in your kv_namespaces array:
{ binding = "USERS", id = "bd445a5887f6437cb4ec9adb11a19106" }

❯ wrangler secret put SALT
 # ...omitted for brevity...
✨ Success! Uploaded secret SALT
```

## Usage

```sh
wrangler dev
```

## Reference

-   https://htmx.org/
-   https://github.com/bezkoder/node-js-express-login-example
-   https://github.com/bigskysoftware/htmx/issues/607
-   https://blog.ropnop.com/storing-tokens-in-browser/
