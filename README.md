## Motivation

## Model oriented queries

```ts
class VehiclesQueryModel extends GraphiQuery {
  @attr("id")
  public id: string;

  @attr()
  public name: string;

  @attr()
  public registrationNumber: string;

  @attr("tags { name }")
  public tags: Tag[];

  private names: string[];

  @computed("name", "registrationNumber")
  public fullName(name: string, registrationNumber: string): string {
    return `${registrationNumber} ${name}`;
  }

  public setNames(names: string[]): void {
    return (this.names = names);
  }
}

const query = gql`query asd {
  vehicles @model(VehiclesQueryModel) 
}`;
```

## Scallable hooks

```ts
function afterRequest(func: Function): any {
  return (dto: GraphiOperationDTO) => {
    return GraphiOperationDTO.addAfterRequestHooks(dto, (result) => {
      func(result);
    });
  };
}

function onResultUpdated(func: Function): any {
  return (dto: GraphiOperationDTO) => {
    return GraphiOperationDTO.addOnResultUpdatedHook(dto, () => {
      func(dto);
    });
  };
}

function executeHook(dto: GraphiOperationDTO): any {
  dto.makeRequest = async () => {
    return xhr.foo(dto.uri);
  };

  return dto;
}

let loading = false;
let posts = false;
const client = new GraphiClient([executeHook]);

const operation = client.compose(
  fromQuery({ query, variables }),
  useCache({ initialData: true }),
  refreshInterval(10000),
  beforeRequest(() => {
    loading = true;
  }),
  afterRequest(() => {
    loading = false;
  }),
  onResultUpdated((result) => (posts = result)),
  onSuccess(() => (posts = result)),
  onError(() => alert())
);

operation.execute();
```

## Event driven

```ts
let loading = false;
const client = new GraphiClient([executeHook]);

const operation = client.compose(
  fromQuery({ query: postsQuery, variables }),
  beforeRequest(() => {
    loading = true;
  }),
  afterRequest(() => {
    loading = false;
  }),
  refreshInterval(10000),
  onResultUpdated(() => alert()),
  onEvent(
    "mutation.createPost",
    ({ data: { createPost } }, dto, { updateResult }) => {
      updateResult([...dto.result, createPost]);
    }
  ),
  onResultUpdated((result) => (posts = result)),
  onSuccess(() => (posts = result))
);

operation.execute();
```

##Example of usage

```ts
import {
  GraphiClient,
  GraphiOperationDTO,
  beforeRequest,
  afterRequest,
  onResultUpdated,
  onSuccess,
  onError,
  refreshInterval,
  fromQuery,
  DTO,
} from "../core";

function executeHook(dto: GraphiOperationDTO): any {
  return DTO.setMakeRequest(dto, function () {
    return new Promise((resolve) => {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "https://api.foo.com/graphql", true);

      xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        }
        resolve(true);
      };

      xhr.send(
        JSON.stringify({ query: this.query, variables: this.variables })
      );
    });
  });
}

let loading = false;

const operation = new GraphiClient([executeHook]).compose(
  fromQuery({ query: "fooo", variables: { xd: "foo" } }),
  refreshInterval(4000),
  beforeRequest(() => {
    console.log("loading");
    loading = true;
  }),
  afterRequest(() => {
    console.log("loaded");
    loading = false;
  }),
  onResultUpdated(() => console.log("updated")),
  onSuccess(() => console.log("success")),
  onError(() => console.log())
);

operation.execute();

setTimeout(() => {
  operation.cancel();
}, 50000);
```
