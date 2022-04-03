export const parseQuery = (
  queryString: string = global.location?.search ?? ""
) => {
  var query = {} as Record<string, string>;
  var pairs = (
    queryString[0] === "?" ? queryString.substring(1) : queryString
  ).split("&");
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
  }
  return query;
};

export const updateQueryParam = (key: string, value: string) => {
  if ("URLSearchParams" in window) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(key, value);
    window.location.search = searchParams.toString();
  }
};
