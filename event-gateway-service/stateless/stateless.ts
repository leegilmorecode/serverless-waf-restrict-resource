import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';

import { Construct } from 'constructs';

export interface EventGatewayServiceStatelessStackProps extends cdk.StackProps {
  shared: {
    stage: string;
  };
  stateless: {
    logisticsIpAddresses: string[];
  };
}

export class EventGatewayServiceStatelessStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: EventGatewayServiceStatelessStackProps,
  ) {
    super(scope, id, props);

    const {
      shared: { stage },
      stateless: { logisticsIpAddresses },
    } = props;

    const openResourceHandler = new lambda.Function(
      this,
      'OpenResourceHandler',
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        handler: 'index.handler',
        functionName: `open-resource-handler-${stage}`,
        code: lambda.Code.fromInline(`
        exports.handler = async function(event) {
          return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "This is the open resource" })
          };
        }
      `),
      },
    );

    const restrictedResourceHandler = new lambda.Function(
      this,
      'RestrictedResourceHandler',
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        handler: 'index.handler',
        functionName: `restricted-resource-handler-${stage}`,
        code: lambda.Code.fromInline(`
        exports.handler = async function(event) {
          return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "This is the restricted resource" })
          };
        }
      `),
      },
    );

    const api = new apigateway.RestApi(this, 'ApiGateway', {
      restApiName: `event-gateway-service-api-${stage}`,
      deployOptions: {
        stageName: stage,
      },
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      deploy: true,
    });

    const openResource = api.root.addResource('open');
    const restrictedResource = api.root.addResource('restricted');

    openResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(openResourceHandler),
    );

    restrictedResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(restrictedResourceHandler),
    );

    const wafAcl = new wafv2.CfnWebACL(this, 'WafWebAcl', {
      name: `event-gateway-service-waf-${stage}`,
      description: `WAF for Event Gateway Service ${stage}`,
      scope: 'REGIONAL',
      defaultAction: {
        allow: {},
      },
      rules: [
        {
          name: 'RestrictedPathRule',
          priority: 0,
          action: {
            block: {},
          },
          statement: {
            andStatement: {
              statements: [
                {
                  byteMatchStatement: {
                    fieldToMatch: {
                      uriPath: {},
                    },
                    positionalConstraint: 'STARTS_WITH',
                    searchString: `/${stage}/restricted`,
                    textTransformations: [
                      {
                        priority: 0,
                        type: 'NONE',
                      },
                    ],
                  },
                },
                {
                  notStatement: {
                    statement: {
                      ipSetReferenceStatement: {
                        arn: new wafv2.CfnIPSet(this, 'AllowedIpSet', {
                          name: 'AllowedIpSet',
                          scope: 'REGIONAL',
                          ipAddressVersion: 'IPV4',
                          addresses: logisticsIpAddresses,
                        }).attrArn,
                      },
                    },
                  },
                },
              ],
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'RestrictedPathRule',
            sampledRequestsEnabled: true,
          },
        },
      ],
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'ApiGatewayWafAcl',
        sampledRequestsEnabled: true,
      },
    });

    new wafv2.CfnWebACLAssociation(this, 'WebAclAssociation', {
      resourceArn: `arn:aws:apigateway:${this.region}::/restapis/${api.restApiId}/stages/${api.deploymentStage.stageName}`,
      webAclArn: wafAcl.attrArn,
    });
  }
}
