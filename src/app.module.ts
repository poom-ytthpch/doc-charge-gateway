import { Module } from '@nestjs/common';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,

      server: {
        playground: false,
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
        context: ({ req }) => ({
          headers: req.headers,
        }),
      },

      gateway: {
        buildService: ({ url }) => {
          return new RemoteGraphQLDataSource({
            url,
            willSendRequest({ request, context }) {
              if (context.headers) {
                Object.entries(context.headers).forEach(([key, value]) => {
                  request.http?.headers.set(key, String(value)); // forward header
                });
              }
            },
          });
        },

        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            { name: 'auth', url: process.env.AUTH_SERVICE_URL },
            { name: 'wallet', url: process.env.WALLET_SERVICE_URL },
            { name: 'charger', url: process.env.CHARGER_SERVICE_URL },
          ],
        }),
      },
    }),
  ],
})
export class AppModule {}
