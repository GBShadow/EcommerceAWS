import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Code, LayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export class ProductsAppLayersStack extends Stack {
  readonly productsLayers: LayerVersion;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.productsLayers = new LayerVersion(this, "ProductsLayer", {
      code: Code.fromAsset("lambdas/products/layers/productsLayer"),
      compatibleRuntimes: [Runtime.NODEJS_14_X],
      layerVersionName: "ProductsLayers",
      removalPolicy: RemovalPolicy.RETAIN,
    });

    new StringParameter(this, "ProductsLayerVersionArn", {
      parameterName: "ProductsLayerVersionArn",
      stringValue: this.productsLayers.layerVersionArn,
    });
  }
}
