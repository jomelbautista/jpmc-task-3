import { ServerRespond } from './DataStreamer';

export interface Row {
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
}

const ratios = [1];

export class DataManipulator {
  static generateRow(serverResponds: ServerRespond[]) {
    // Add logic to process raw server data
    const priceABC = (serverResponds[0].top_ask.price + serverResponds[0].top_bid.price) / 2;
    const priceDEF = (serverResponds[1].top_ask.price + serverResponds[1].top_bid.price) / 2;
    const ratio = priceABC / priceDEF;
    if (ratios.length === 365) {
      ratios.pop();
    }
    ratios.push(ratio);

    const averageRatio = ratios.reduce((a, b) => a + b) / ratios.length;

    // Upper bound calculation based on 5%
    const upperBound = averageRatio + (averageRatio * 0.05);
    // Lower bound calculation based on 5%
    const lowerBound = averageRatio - (averageRatio * 0.05);

    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio,
      timestamp: serverResponds[0].timestamp > serverResponds[1].timestamp ?
        serverResponds[0].timestamp : serverResponds[1].timestamp,
      upper_bound: upperBound,
      lower_bound: lowerBound,
      trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
    };

  }
}
