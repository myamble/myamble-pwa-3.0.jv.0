```yaml
openapi: 3.0.0
info:
  title: Social Work Survey Application API
  description: API documentation for the Social Work Survey Application
  version: 1.0.0

paths:
  /api-docs:
    get:
      summary: Get API documentation
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  openapi:
                    type: string
                    description: OpenAPI specification
                  info:
                    $ref: '#/components/schemas/Info'
                  paths:
                    type: object
                    additionalProperties:
                      $ref: '#/components/schemas/PathItem'
                  components:
                    $ref: '#/components/schemas/Components'

components:
  schemas:
    Info:
      type: object
      properties:
        title:
          type: string
        description:
          type: string
        version:
          type: string

    PathItem:
      type: object
      properties:
        summary:
          type: string
        description:
          type: string
        parameters:
          type: array
          items:
            $ref: '#/components/schemas/Parameter'
        requestBody:
          $ref: '#/components/schemas/RequestBody'
        responses:
          type: object
          additionalProperties:
            $ref: '#/components/schemas/Response'

    Parameter:
      type: object
      properties:
        name:
          type: string
        in:
          type: string
        description:
          type: string
        required:
          type: boolean
        schema:
          $ref: '#/components/schemas/Schema'

    RequestBody:
      type: object
      properties:
        description:
          type: string
        content:
          type: object
          additionalProperties:
            $ref: '#/components/schemas/MediaType'

    MediaType:
      type: object
      properties:
        schema:
          $ref: '#/components/schemas/Schema'

    Response:
      type: object
      properties:
        description:
          type: string
        content:
          type: object
          additionalProperties:
            $ref: '#/components/schemas/MediaType'

    Components:
      type: object
      properties:
        schemas:
          type: object
          additionalProperties:
            $ref: '#/components/schemas/Schema'

    Schema:
      type: object
      properties:
        type:
          type: string
        format:
          type: string
        properties:
          type: object
          additionalProperties:
            $ref: '#/components/schemas/Schema'
        items:
          $ref: '#/components/schemas/Schema'
        additionalProperties:
          $ref: '#/components/schemas/Schema'
```