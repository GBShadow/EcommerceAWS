import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { ProductRepository } from "./layers/productsLayer/nodejs/productRepository";
import DynamoDB = require("aws-sdk/clients/dynamodb");

const productsDdb = process.env.PRODUCTS_DDB!;
const ddbClient = new DynamoDB.DocumentClient();

const productRepository = new ProductRepository(ddbClient, productsDdb);

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  const method = event.httpMethod;

  console.log({ lambdaRequestId, apiRequestId });

  if (event.resource === "/products") {
    if (method === "GET") {
      const products = await productRepository.getAllProducts();

      return {
        statusCode: 200,
        body: JSON.stringify(products, null, 2),
      };
    }
  }

  if (event.resource === "/products/{id}") {
    if (method === "GET") {
      const productId = event.pathParameters!.id as string;
      try {
        const product = await productRepository.getProductById(productId);
        return {
          statusCode: 200,
          body: JSON.stringify(product, null, 2),
        };
      } catch (error) {
        console.error((error as Error).message);

        return {
          statusCode: 404,
          body: JSON.stringify(
            {
              message: (error as Error).message,
            },
            null,
            2
          ),
        };
      }
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify(
      {
        message: "Bad Request",
      },
      null,
      2
    ),
  };
}
