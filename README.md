This is a basic [slimplate](https://github.com/slimplate) site.

It's deployed [here](https://slimplate-nextjs.vercel.app/)

In order to use it you will need to setup some [env-vars](https://vercel.com/docs/concepts/projects/environment-variables):

```
# client-side variables
NEXT_PUBLIC_GITHUB_BACKEND=https://YOURS/api/github
NEXT_PUBLIC_CORS_PROXY=https://YOURS/api/cors

# server-side variables
GITHUB_CLIENT=YOURS
GITHUB_SECRET=YOURS
REDIRECT_URL="http://localhost:3000*,https://*.vercel.app*,"
```

Locally, you can put these in `.env.local`