export function getNextBids(currentBid: number, count = 4): number[] {
  const bids: number[] = [];
  let bid = currentBid;
  for (let i = 0; i < count; i++) {
    if (bid < 200) bid += 10;
    else if (bid < 500) bid += 20;
    else bid += 50;
    bids.push(bid);
  }
  return bids;
}
