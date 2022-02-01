// import { Handler } from 'aws-lambda';

// export const getHello: Handler = (event: any) => {
//   const response = {
//     statusCode: 200,
//     body: JSON.stringify(
//       {
//         message: 'Go Serverless v1.0! Your function executed successfully!',
//         input: event,
//       },
//       null,
//       2
//     ),
//   };

//   return new Promise((resolve) => {
//     resolve(response)
//   })
// }

// export const postHello: Handler = (event: any) => {
//   const userName = JSON.parse(event.body).name;
  
//   const response = {
//     statusCode: 200,
//     body: JSON.stringify(
//       {
//         message: `Hello, ${userName}!!`,
//         // input: event,
//       },
//       null,
//       2
//     ),
//   };

//   return new Promise((resolve) => {
//     resolve(response)
//   })
// }












import { Handler } from 'aws-lambda';

// declare module 'lighthouse';
// declare module 'lighthouse-logger';

// const lighthouse = require('lighthouse');
// const log = require('lighthouse-logger');
// const chromeLauncher = require('chrome-launcher');

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
export const hello: Handler = async (event: any) => {

  const result = await execLighthouse();
  console.log(result);

  const response = {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
        result 
      },
      null,
      2
    ),
  };

  return new Promise((resolve) => {
    resolve(response)
  })
}
