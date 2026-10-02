/** GraphQL documents for zone traffic. Same fields for hourly and daily groups. */
const FIELDS = `sum { requests cachedRequests threats bytes cachedBytes encryptedRequests pageViews
  countryMap { clientCountryName requests threats }
  responseStatusMap { edgeResponseStatus requests } }
  uniq { uniques }`;

export const HOURLY_QUERY = `query($zone:String!,$since:Time!,$until:Time!){viewer{zones(filter:{zoneTag:$zone}){
  rows: httpRequests1hGroups(limit:100,orderBy:[datetime_ASC],filter:{datetime_geq:$since,datetime_lt:$until}){
    dimensions{ t: datetime } ${FIELDS} }}}}`;

export const DAILY_QUERY = `query($zone:String!,$since:Date!,$until:Date!){viewer{zones(filter:{zoneTag:$zone}){
  rows: httpRequests1dGroups(limit:100,orderBy:[date_ASC],filter:{date_geq:$since,date_leq:$until}){
    dimensions{ t: date } ${FIELDS} }}}}`;

export interface Row {
  dimensions: { t: string };
  sum: {
    requests: number;
    cachedRequests: number;
    threats: number;
    bytes: number;
    cachedBytes: number;
    encryptedRequests: number;
    pageViews: number;
    countryMap: { clientCountryName: string; requests: number; threats: number }[];
    responseStatusMap: { edgeResponseStatus: number; requests: number }[];
  };
  uniq: { uniques: number };
}

export interface QueryResult {
  viewer: { zones: { rows: Row[] }[] };
}
