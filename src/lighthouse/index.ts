import { Handler } from 'aws-lambda';

export const lighthouse: Handler = () => {
  const response = {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'lighthouse done!'
      },
      null,
      2
    ),
  };

  return new Promise((resolve) => {
    resolve(response)
  })
}
