import { Stack, StackProps } from "aws-cdk-lib";
import {
  AccessLogFormat,
  LambdaIntegration,
  LogGroupLogDestination,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

interface ECommerceApiStackProps extends StackProps {
  productsFetchHandler: NodejsFunction;
  productsAdminHandler: NodejsFunction;
}

export class ECommerceApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ECommerceApiStackProps) {
    super(scope, id, props);

    const logGroup = new LogGroup(this, "ECommerceApiLogs");
    const api = new RestApi(this, "ECommerceApi", {
      restApiName: "ECommerceApi",
      cloudWatchRole: true,
      deployOptions: {
        accessLogDestination: new LogGroupLogDestination(logGroup),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields({
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          caller: true,
          user: true,
        }),
      },
    });

    const productsFetchIntegration = new LambdaIntegration(
      props.productsFetchHandler
    );
    const productsAdminIntegration = new LambdaIntegration(
      props.productsAdminHandler
    );

    // /products
    const productsResource = api.root.addResource("products");
    productsResource.addMethod("GET", productsFetchIntegration);
    productsResource.addMethod("POST", productsAdminIntegration);

    // /products/{id}
    const productIdResource = productsResource.addResource("{id}");
    productIdResource.addMethod("GET", productsFetchIntegration);
    productIdResource.addMethod("PUT", productsAdminIntegration);
    productIdResource.addMethod("DELETE", productsAdminIntegration);
  }
}
