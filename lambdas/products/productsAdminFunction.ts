import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import {
  Product,
  ProductRepository,
} from "./layers/productsLayer/nodejs/productRepository";
import DynamoDB = require("aws-sdk/clients/dynamodb");

const productsDdb = process.env.PRODUCTS_DDB!;
const ddbClient = new DynamoDB.DocumentClient();

const productRepository = new ProductRepository(ddbClient, productsDdb);

const teste = {
  nome: 'GBS',
  idade: 12,
  arr: [1,2,3],
  obj: {
    teste: ['a','s','d'],
    fn: () => true
  }
}

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  const method = event.httpMethod;

  console.log({ lambdaRequestId, apiRequestId });

  if (event.resource === "/products") {
    if (method === "POST") {
      const product = (await JSON.parse(event.body!)) as Product;

      const productCreated = await productRepository.createProduct(product);

      return {
        statusCode: 201,
        body: JSON.stringify(productCreated, null, 2),
      };
    }
  }

  if (event.resource === "/products/{id}") {
    const productId = event.pathParameters!.id as string;

    if (method === "PUT") {
      const product = (await JSON.parse(event.body!)) as Product;

      try {
        const productUpdated = await productRepository.updateProduct(
          productId,
          product
        );
        return {
          statusCode: 200,
          body: JSON.stringify(productUpdated, null, 2),
        };
      } catch (error) {
        console.error((error as Error).message);

        return {
          statusCode: 404,
          body: JSON.stringify(
            {
              message: "Product not found",
            },
            null,
            2
          ),
        };
      }
    }

    if (method === "DELETE") {
      try {
        const product = await productRepository.deleteProductById(productId);
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
