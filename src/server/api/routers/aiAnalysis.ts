import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { CodeInterpreter } from "@e2b/code-interpreter";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "~/server/env.mjs";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

const MODEL_NAME = "claude-3-opus-20240229";

const SYSTEM_PROMPT = `
You are an AI assistant specialized in data analysis. You can run Python code to analyze data, create visualizations, and provide insights. Use markdown for formatting your responses.
If a CSV file has been uploaded, you can access it using pandas:
import pandas as pd
df = pd.read_csv('/tmp/uploaded_file.csv')
`;

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
});

export const aiAnalysisRouter = createTRPCRouter({
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        file: z
          .object({
            name: z.string(),
            content: z.string(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { success } = await ratelimit.limit(ctx.session.user.id);
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded. Please try again later.",
        });
      }

      const codeInterpreter = await CodeInterpreter.create();

      try {
        if (input.file) {
          await codeInterpreter.filesystem.write(
            "/tmp/uploaded_file.csv",
            input.file.content,
          );
        }

        const response = await anthropic.messages.create({
          model: MODEL_NAME,
          max_tokens: 1000,
          messages: [{ role: "user", content: input.message }],
          system: SYSTEM_PROMPT,
        });

        let result = response.content[0].text;
        let codeOutput = null;

        // Check if the response contains Python code
        const codeMatch = result.match(/```python\n([\s\S]*?)\n```/);
        if (codeMatch) {
          const code = codeMatch[1];
          try {
            codeOutput = await codeInterpreter.notebook.execCell(code);

            // If the code output contains a plot, convert it to base64
            if (
              codeOutput.outputs &&
              codeOutput.outputs[0] &&
              codeOutput.outputs[0].data &&
              codeOutput.outputs[0].data["image/png"]
            ) {
              const base64Image = codeOutput.outputs[0].data["image/png"];
              result += `\n\n![Generated Plot](data:image/png;base64,${base64Image})`;
            }
          } catch (error) {
            codeOutput = { error: "Code execution failed: " + error.message };
          }

          // Replace the code block with the execution result
          result = result.replace(
            /```python\n[\s\S]*?\n```/,
            "```\nCode execution result:\n" +
              JSON.stringify(codeOutput, null, 2) +
              "\n```",
          );
        }

        await codeInterpreter.close();

        return { message: result, codeOutput };
      } catch (error) {
        await codeInterpreter.close();
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while processing your request.",
        });
      }
    }),
});
