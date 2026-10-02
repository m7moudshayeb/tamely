/** Links the assistant may render: our own screens and https pages it cited. */
export const isAppLink = (href: string) => /^\/app(\/[\w\-./%?=&]*)?$/.test(href) && !href.includes("//");
export const isSafeHttp = (href: string) => /^https:\/\/[^\s]+$/.test(href);
