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
