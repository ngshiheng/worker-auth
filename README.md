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
```

## Requirements

-   A [Cloudflare](https://www.cloudflare.com/) account
-   Install [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/cli-wrangler/) for Cloudflare Workers deployment

## Setup

```sh
npm ci
wrangler kv:namespace create "USERS"
wrangler secret put SALT
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
