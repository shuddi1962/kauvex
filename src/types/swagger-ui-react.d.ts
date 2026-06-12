declare module "swagger-ui-react" {
  import { ComponentType } from "react";

  interface SwaggerUIProps {
    spec?: Record<string, unknown>;
    url?: string;
    requestInterceptor?: (req: Request) => Request;
    responseInterceptor?: (res: Response) => Response;
    docExpansion?: "list" | "full" | "none";
    defaultModelsExpandDepth?: number;
    filter?: boolean | string;
    layout?: string;
    defaultModelExpandDepth?: number;
    plugins?: unknown[];
    supportedSubmitMethods?: string[];
    showMutatedRequest?: boolean;
    presets?: unknown[];
  }

  const SwaggerUI: ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}
