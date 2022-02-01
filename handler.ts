import { Handler } from 'aws-lambda';

// CommonJS形式のモジュールを使う場合は `* as` が必要
import * as lighthouse from 'lighthouse';
import * as log from 'lighthouse-logger';
import * as chromeLauncher from 'chrome-launcher';

const opts = {
  chromeFlags: ["--headless", "--disable-gpu"],
  //chromeFlags: ["--disable-gpu"],
  logLevel: "info"
};
log.setLevel(opts.logLevel);

// function launchChromeAndRunLighthouse(url: string, opts: any, config = null) {
async function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher.launch({ chromeFlags: opts.chromeFlags }).then((chrome) => {
    opts.port = chrome.port;
    return lighthouse(url, opts, config).then((results) => {
      // results.lhr はよく見るスコアリングの元データ
      // https://github.com/GoogleChrome/lighthouse/blob/master/types/lhr.d.ts
      const {
        // "time-to-first-byte": ttfb,
        // "first-contentful-paint": fcp,
        // "first-meaningful-paint": fmp,
        // "speed-index": speedindex,
        // interactive,
        metrics,
      } = results.lhr.audits;

      return chrome.kill().then(() => ({
        // TTFB: Math.round(ttfb.numericValue),
        FIRST_PAINT: metrics.details.items[0].observedFirstPaint,
        // FMP: Math.round(fmp.numericValue),
        // FCP: Math.round(fcp.numericValue),
        // SPEED_INDEX: Math.round(speedindex.numericValue),
        // TTI: Math.round(interactive.numericValue),
      }));
    });
  });
}

const execLighthouse = async () => {
  return launchChromeAndRunLighthouse("https://google.com", opts).then((results) => {
    // 一旦標準出力に表示
    console.table(results);
    return results;
  });
}

// _________________________________________________
//
export const hello: Handler = (event: any) => {
  console.log("LOGGER:: hello kicked.");

  // いったん非同期処理を待たずにレスポンスさせる
  execLighthouse()
    .then((value) => {
      console.log(`LOGGER::result:: ${JSON.stringify(value)}`);
    })
    .catch(e => {
      console.error(e)
    });

  const response = {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };
  // console.log(`LOGGER::response:: ${JSON.stringify(response)}`);

  return new Promise((resolve) => {
    resolve(response)
  })
}
