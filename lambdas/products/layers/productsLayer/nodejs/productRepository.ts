import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { v4 } from "uuid";

export interface Product {
  id: string;
  title: string;
  code: string;
  price: number;
  model: string;
}

export class ProductRepository {
  private ddbClient: DocumentClient;
  private productsDdb: string;

  constructor(ddbClient: DocumentClient, productsDdb: string) {
    this.ddbClient = ddbClient;
    this.productsDdb = productsDdb;
  }

  async getAllProducts(): Promise<Product[]> {
    const data = await this.ddbClient
      .scan({
        TableName: this.productsDdb,
      })
      .promise();

    return data.Items as Product[];
  }

  async getProductById(productId: string): Promise<Product> {
    const data = await this.ddbClient
      .get({
        TableName: this.productsDdb,
        Key: {
          id: productId,
        },
      })
      .promise();

    if (data.Item) {
      return data.Item as Product;
    } else {
      throw new Error("Product not found");
    }
  }

  async createProduct(product: Product): Promise<Product> {
    product.id = v4();

    await this.ddbClient
      .put({
        TableName: this.productsDdb,
        Item: product,
      })
      .promise();

    return product;
  }

  async deleteProductById(productId: string): Promise<Product> {
    const data = await this.ddbClient
      .delete({
        TableName: this.productsDdb,
        Key: {
          id: productId,
        },
        ReturnValues: "ALL_OLD",
      })
      .promise();

    if (data.Attributes) {
      return data.Attributes as Product;
    } else {
      throw new Error("Product not found");
    }
  }

  async updateProduct(productId: string, product: Product): Promise<Product> {
    const data = await this.ddbClient
      .update({
        TableName: this.productsDdb,
        Key: {
          id: productId,
        },
        ConditionExpression: "attribute_exists(id)",
        ReturnValues: "UPDATED_NEW",
        UpdateExpression: "set title = :t, code = :c, price = :p, model = :m",
        ExpressionAttributeValues: {
          ":t": product.title,
          ":c": product.code,
          ":p": product.price,
          ":m": product.model,
        },
      })
      .promise();

    data.Attributes!.id = productId;

    return data.Attributes as Product;
  }
}
