## The first idea

```ts
let loading = false;
let posts = false;
const client = new GraphiClient([executeHook]);

const operation = client.compose(
  fromQuery({ query, variables }),
  useCache({ initialData: true }),
  refreshInterval(10000),
  beforeRequest(() => { loading = true; }),
  afterRequest(() => { loading = false; }),
  onResultUpdated((result) => posts = result),
  onSuccess(() => posts = result),
  onError(() => alert()),
);

operation.execute();
```

## The second idea
```ts
let loading = false;
const client = new GraphiClient([executeHook]);

const operation = client.compose(
  fromQuery({ query: postsQuery, variables }),
  beforeRequest(() => { loading = true; }),
  afterRequest(() => { loading = false; }),
  refreshInterval(10000),
  onResultUpdated(() => alert()),
  onEvent('mutation.createPost', ({ data: { createPost }}, dto, { updateResult }) => {
    updateResult([...dto.result, createPost ]);
  }),
  onResultUpdated((result) => posts = result),
  onSuccess(() => posts = result),
);

operation.execute();
```