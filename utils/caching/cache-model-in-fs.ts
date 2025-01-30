import { wrapLanguageModel, type LanguageModelV1 } from "ai";
import { createCacheMiddleware } from "./cache-model";
import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";

/**
 * The cache object that uses the file system as a storage.
 */
const cache = createStorage({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  driver: (fsDriver as any)({
    base: "./node_modules/.cache",
  }),
});

/**
 * Takes in a model from AI SDK and wraps it with some
 * middleware which caches the results in the file system.
 */
export const cacheModelInFs = (model: LanguageModelV1) => {
  return wrapLanguageModel({
    model,
    middleware: createCacheMiddleware(cache),
  });
};
