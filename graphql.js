import { request, gql } from "graphql-request";

// const GRAPHQL_ENDPOINT = "https://graph.kadena.network/graphql";
const GRAPHQL_ENDPOINT = "https://graph.testnet.kadena.network/graphql";
// const RAFFLE_WALLET =
//   "k:2a3b9afef6a4b0daa606ab16d36a8b48a1170568a0730f19490744115f0da0ce"; // My main KDA wallet (mainnet)
const RAFFLE_WALLET =
  "k:cf0e0d2a3bb872e6332a8532d0e0b90dd98522990603422b96b083ee9f5407d2"; // Chainweb test wallet (testnet)

/**
 * Fetch coin.TRANSFER events using after cursor for pagination
 */
async function fetchCoinTransferEvents(chainId, afterCursor = null) {
  const query = gql`
    query ($chainId: String!, $after: String) {
      events(
        chainId: $chainId
        qualifiedEventName: "coin.TRANSFER"
        after: $after
      ) {
        edges {
          cursor
          node {
            requestKey
            block {
              height
            }
            qualifiedName
            parameters
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const variables = {
    chainId,
    after: afterCursor,
  };

  const data = await request(GRAPHQL_ENDPOINT, query, variables);

  return data.events;
}

/**
 * Poll deposits for your raffle wallet
 */
export async function pollDeposits(lastCursor = null, chainId = "0") {
  let allEdges = [];
  let cursor = lastCursor;

  // Paginate until there are no more new events
  do {
    const eventsPage = await fetchCoinTransferEvents(chainId, cursor);
    allEdges = allEdges.concat(eventsPage.edges);
    cursor = eventsPage.pageInfo.endCursor;
  } while (cursor && cursor !== lastCursor);

  // Filter only incoming deposits to your raffle wallet
  const deposits = allEdges
    .map((edge) => edge.node)
    .filter((ev) => ev.parameters[1] === RAFFLE_WALLET)
    .map((ev) => ({
      from: ev.parameters[0],
      to: ev.parameters[1],
      amount: parseFloat(ev.parameters[2]),
      requestKey: ev.requestKey,
      blockHeight: ev.block.height,
    }));

  return { deposits, lastCursor: cursor };
}
